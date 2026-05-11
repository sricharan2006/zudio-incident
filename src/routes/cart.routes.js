const express = require('express')
const router = express.Router()
const { checkout } = require('../controllers/checkout.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.post('/checkout', verifyToken, checkout)

module.exports = router
