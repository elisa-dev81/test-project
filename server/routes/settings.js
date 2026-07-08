const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const settingsController = require('../controllers/settingsController');

// Validation middleware
const validateSetting = [
  body('key').notEmpty().withMessage('کلید تنظیم الزامی است'),
  body('value').exists().withMessage('مقدار تنظیم الزامی است'),
  body('type').optional().isIn(['string', 'number', 'boolean', 'json']).withMessage('نوع تنظیم نامعتبر است'),
  body('category').optional().isIn(['general', 'business', 'appearance', 'security', 'backup']).withMessage('دسته‌بندی تنظیم نامعتبر است')
];

const validateUpdateSetting = [
  body('value').exists().withMessage('مقدار تنظیم الزامی است')
];

const validateUpdateSettings = [
  body('settings').isObject().withMessage('تنظیمات باید به صورت object باشد')
];

const validateQuery = [
  query('category').optional().isIn(['general', 'business', 'appearance', 'security', 'backup']).withMessage('دسته‌بندی نامعتبر است')
];

// Error handling middleware
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
router.get('/', validateQuery, handleValidationErrors, settingsController.getSettings);
router.get('/:key', settingsController.getSetting);
router.post('/', validateSetting, handleValidationErrors, settingsController.createSetting);
router.put('/:key', validateUpdateSetting, handleValidationErrors, settingsController.updateSetting);
router.put('/', validateUpdateSettings, handleValidationErrors, settingsController.updateSettings);
router.delete('/:key', settingsController.deleteSetting);
router.post('/reset', settingsController.resetSettings);

module.exports = router;
