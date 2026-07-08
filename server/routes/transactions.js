const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const transactionController = require('../controllers/transactionController');

// Validation middleware for transactions
const validateTransaction = [
  body('type').isIn(['purchase', 'sale']).withMessage('نوع تراکنش نامعتبر است'),
  body('customer_name').notEmpty().withMessage('نام مشتری الزامی است'),
  body('total_amount').isFloat({ min: 0 }).withMessage('مبلغ کل باید عدد مثبت باشد'),
  body('gold_price_18k').isFloat({ min: 0 }).withMessage('قیمت طلای 18 عیار الزامی است'),
  body('gold_price_24k').isFloat({ min: 0 }).withMessage('قیمت طلای 24 عیار الزامی است'),
  body('payment_method').isIn(['cash', 'card', 'check', 'transfer', 'unpaid', 'installment', 'exchange']).withMessage('روش پرداخت نامعتبر است')
];

// Validation middleware for payments
const validatePayment = [
  body('amount').isFloat({ min: 0 }).withMessage('مبلغ پرداخت باید عدد مثبت باشد'),
  body('payment_method').isIn(['cash', 'card', 'check', 'transfer', 'unpaid', 'installment']).withMessage('روش پرداخت نامعتبر است'),
  body('notes').optional().isString().withMessage('توضیحات باید متن باشد'),
  body('payment_date').optional().isISO8601().withMessage('تاریخ پرداخت نامعتبر است'),
  body('is_full_payment').optional().isBoolean().withMessage('وضعیت پرداخت کامل باید true یا false باشد'),
  body('update_payment_method').optional().isBoolean().withMessage('وضعیت بروزرسانی روش پرداخت باید true یا false باشد')
];

// Validation middleware for installments
const validateInstallment = [
  body('number_of_installments').isInt({ min: 1, max: 36 }).withMessage('تعداد اقساط باید بین 1 تا 36 باشد'),
  body('start_date').isISO8601().withMessage('تاریخ شروع نامعتبر است'),
  body('amount').isFloat({ min: 0 }).withMessage('مبلغ اقساط باید عدد مثبت باشد'),
  body('notes').optional().isString().withMessage('توضیحات باید متن باشد')
];

// Error handling middleware for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطا در اعتبارسنجی داده‌ها',
      errors: errors.array()
    });
  }
  next();
};

// Routes
router.get('/', transactionController.getAllTransactions);
router.get('/summary', transactionController.getTransactionSummary);
router.get('/:id', transactionController.getTransactionById);
router.post('/', validateTransaction, handleValidationErrors, transactionController.createTransaction);
router.put('/:id', validateTransaction, handleValidationErrors, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.post('/:id/payments', validatePayment, handleValidationErrors, transactionController.addPayment);
router.post('/:id/pay', validatePayment, handleValidationErrors, transactionController.payCustomerDebt);
router.post('/:id/installments', validateInstallment, handleValidationErrors, transactionController.createInstallmentPlan);

module.exports = router;