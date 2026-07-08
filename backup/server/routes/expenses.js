const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');

// Validation middleware
const validateExpense = [
  body('title').notEmpty().withMessage('عنوان هزینه الزامی است'),
  body('amount').isFloat({ min: 0 }).withMessage('مبلغ باید عدد مثبت باشد'),
  body('category').isIn(['rent', 'utilities', 'supplies', 'marketing', 'labor', 'equipment', 'maintenance', 'other']).withMessage('دسته‌بندی نامعتبر است'),
  body('payment_method').isIn(['cash', 'card', 'check', 'transfer']).withMessage('روش پرداخت نامعتبر است')
];

// Routes
router.get('/', expenseController.getAllExpenses);
router.get('/summary', expenseController.getExpenseSummary);
router.get('/:id', expenseController.getExpenseById);
router.post('/', validateExpense, expenseController.createExpense);
router.put('/:id', validateExpense, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;