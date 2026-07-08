const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');

// Validation middleware
const validateInventory = [
  body('product_id').isInt().withMessage('محصول نامعتبر است'),
  body('quantity').isInt({ min: 0 }).withMessage('تعداد باید عدد صحیح و بزرگتر از صفر باشد'),
  body('purchase_price').isFloat({ min: 0 }).withMessage('قیمت خرید باید عدد مثبت باشد'),
  body('sale_price').isFloat({ min: 0 }).withMessage('قیمت فروش باید عدد مثبت باشد'),
  body('status').isIn(['available', 'sold', 'reserved']).withMessage('وضعیت نامعتبر است')
];

// Routes
router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', validateInventory, inventoryController.createInventory);
router.put('/:id', validateInventory, inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;