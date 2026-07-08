# تغییرات و بروزرسانی‌های پروژه

## نسخه فعلی - 17 آگوست 2025

### 🔧 رفع مشکلات:
- ✅ **رفع خطای "Error saving invoice"**: مشکل ذخیره فاکتورها در دیتابیس حل شد
- ✅ **پایداری داده‌ها**: فاکتورها پس از refresh صفحه حفظ می‌شوند
- ✅ **مشکل field mapping**: تطبیق صحیح فیلدهای frontend و backend
- ✅ **رفع خطای port conflict**: تغییر پورت سرور از 5000 به 5001
- ✅ **رفع خطای seeder**: اصلاح فیلد transaction_type به type

### 🆕 ویژگی‌های جدید:
- ✅ **مدیریت خودکار محصولات**:
  - اضافه شدن خودکار محصولات هنگام صدور فاکتور خرید
  - حذف خودکار محصولات هنگام صدور فاکتور فروش
- ✅ **بهبود UI**: نمایش فاکتورها در تب‌های مربوطه
- ✅ **عملکرد دکمه‌های حذف**: حذف صحیح در تمام تب‌ها

### 🔄 بهبودهای فنی:
- ✅ **Error Handling**: بهبود مدیریت خطاها و نمایش پیام‌های مفصل
- ✅ **Response Structure**: بهبود ساختار پاسخ‌های API
- ✅ **State Management**: بهبود مدیریت state در Redux
- ✅ **Database Consistency**: اطمینان از یکسان‌سازی داده‌ها

### 📝 فایل‌های تغییر یافته:
- `src/pages/Sales/SalesManagement.js`
- `src/services/transactionService.js`
- `src/services/api.js`
- `server/server.js`
- `server/controllers/transactionController.js`
- `server/controllers/productController.js`
- `seeders/20250801171000-demo-transactions.js`
- `seeders/20250801161901-demo-products.js`

## تاریخچه نسخه‌های قبلی

### نسخه اولیه
- ✅ راه‌اندازی اولیه پروژه
- ✅ ایجاد ساختار پایه React + Node.js
- ✅ پیاده‌سازی مدل‌های دیتابیس
- ✅ ایجاد کامپوننت‌های اصلی UI
