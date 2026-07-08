const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');

// Validation middleware for transactions
const validateTransaction = [
  body('type').isIn(['purchase', 'sale']).withMessage('نوع تراکنش نامعتبر است'),
  body('customer_name').notEmpty().withMessage('نام مشتری الزامی است'),
  body('total_amount').isFloat({ min: 0 }).withMessage('مبلغ کل باید عدد مثبت باشد'),
  body('gold_price_18k').isFloat({ min: 0 }).withMessage('قیمت طلای 18 عیار الزامی است'),
  body('gold_price_24k').isFloat({ min: 0 }).withMessage('قیمت طلای 24 عیار الزامی است'),
  body('payment_method').isIn(['cash', 'card', 'installment', 'exchange']).withMessage('روش پرداخت نامعتبر است')
];

// Validation middleware for payments
const validatePayment = [
  body('amount').isFloat({ min: 0 }).withMessage('مبلغ پرداخت باید عدد مثبت باشد'),
  body('payment_method').isIn(['cash', 'card', 'check', 'installment']).withMessage('روش پرداخت نامعتبر است')
];

// Routes
router.get('/', transactionController.getAllTransactions);
router.get('/summary', transactionController.getTransactionSummary);
router.get('/:id', transactionController.getTransactionById);
router.post('/', validateTransaction, transactionController.createTransaction);
router.put('/:id', validateTransaction, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.post('/:id/payments', validatePayment, transactionController.addPayment);

module.exports = router;