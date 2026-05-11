const pool = require('../db')

const checkout = async (req, res) => {
  const client = await pool.connect()
  try {
    const userId = req.user.userId
    const { items, couponCode, shippingAddress } = req.body

    // items should be an array of { productId, quantity }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' })
    }

    // Start transaction
    await client.query('BEGIN')

    // calculate total price by fetching each product
    let totalAmount = 0
    const cartItems = []

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1',
        [item.productId]
      )

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Product ${item.productId} not found` })
      }

      const product = productResult.rows[0]

      if (product.stock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }

      totalAmount += parseFloat(product.price) * item.quantity
      cartItems.push({ ...item, product })
    }

    let discount = 0
    let couponId = null

    // BUG #3 [CRITICAL] Double discount race condition — FIXED
    // Changed from: SELECT then UPDATE in separate operations
    // To: Single atomic UPDATE ... WHERE used = false RETURNING * operation
    // Now only one concurrent request can successfully use a coupon
    if (couponCode) {
      const couponResult = await client.query(
        'UPDATE coupons SET used = true WHERE code = $1 AND used = false AND expires_at > NOW() RETURNING *',
        [couponCode]
      )

      if (couponResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Invalid, expired, or already used coupon' })
      }

      const coupon = couponResult.rows[0]
      couponId = coupon.id
      discount = parseFloat(coupon.discount_amount)
      totalAmount = Math.max(0, totalAmount - discount)
    }

    // Create the order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, discount, shipping_address, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, totalAmount, discount, shippingAddress, 'pending']
    )

    const order = orderResult.rows[0]

    // Insert order items
    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, unit_price) VALUES ($1, $2, $3, $4, $5, $6)',
        [order.id, item.productId, item.product.name, item.product.price, item.quantity, item.product.price]
      )
    }

    // BUG #4 [CRITICAL] Stock never decrements — FIXED
    // Changed from: commented-out code
    // To: Uncommented and wrapped in transaction, with AND stock >= $1 check
    // Stock is now atomically decremented alongside order creation
    // If stock is insufficient, entire transaction rolls back (no partial order)
    for (const item of cartItems) {
      const stockResult = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id',
        [item.quantity, item.productId]
      )

      if (!stockResult.rows[0]) {
        // Stock check failed — roll back entire transaction
        await client.query('ROLLBACK')
        return res.status(409).json({
          error: `Insufficient stock for product ${item.productId}. Please try again.`,
        })
      }
    }

    // Commit transaction only if all operations succeeded
    await client.query('COMMIT')

    res.status(201).json({
      message: 'Order placed successfully',
      order,
      discount: discount > 0 ? discount : undefined,
    })
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr.message)
    }
    console.error('checkout error:', err.message)
    res.status(500).json({ error: 'Checkout failed' })
  } finally {
    client.release()
  }
}

module.exports = { checkout }
