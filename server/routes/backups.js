const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const backupController = require('../controllers/backupController');

// Validation middleware
const validateDeleteOld = [
  body('days').optional().isInt({ min: 1, max: 365 }).withMessage('تعداد روزها باید بین 1 تا 365 باشد')
];

const validateRestore = [
  body('filename').notEmpty().withMessage('نام فایل پشتیبان الزامی است')
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
router.post('/create', backupController.createBackup);
router.get('/list', backupController.listBackups);
router.get('/status', backupController.getBackupStatus);
router.get('/download/:filename', backupController.downloadBackup);
router.delete('/:filename', backupController.deleteBackup);
router.post('/clean', validateDeleteOld, handleValidationErrors, backupController.cleanOldBackups);
router.post('/restore', validateRestore, handleValidationErrors, backupController.restoreBackup);

module.exports = router;
