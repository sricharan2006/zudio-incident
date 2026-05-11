const express = require('express')
const router = express.Router()
const { getOrderHistory, updateOrderStatus } = require('../controllers/order.controller')
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware')

router.get('/history', verifyToken, getOrderHistory)
router.patch('/:id/status', verifyToken, verifyAdmin, updateOrderStatus)

module.exports = router
