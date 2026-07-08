const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');

// Validation middleware
const validateProduct = [
  body('name').notEmpty().withMessage('نام محصول الزامی است'),
  body('weight').isFloat().withMessage('وزن باید عدد باشد'),
  body('purity').isInt().withMessage('عیار باید عدد صحیح باشد'),
  body('making_wage').isFloat().withMessage('اجرت ساخت باید عدد باشد'),
  body('category_id').isInt().withMessage('دسته‌بندی نامعتبر است')
];

// Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validateProduct, productController.createProduct);
router.put('/:id', validateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;