const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const installmentController = require('../controllers/installmentController');

// Validation middleware for installment payment
const validateInstallmentPayment = [
  body('paid_amount').isFloat({ min: 0 }).withMessage('مبلغ پرداختی باید عدد مثبت باشد')
];

// Routes
router.get('/', installmentController.getAllInstallments);
router.get('/overdue', installmentController.getOverdueInstallments);
router.get('/summary', installmentController.getInstallmentSummary);
router.get('/:id', installmentController.getInstallmentById);
router.put('/:id', installmentController.updateInstallment);
router.post('/:id/pay', validateInstallmentPayment, installmentController.payInstallment);

module.exports = router;