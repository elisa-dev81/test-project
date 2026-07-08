# بکاپ پروژه Gold Shop

## 📅 تاریخ بکاپ
**17 آگوست 2025 - 00:32**

## 📂 محتویات بکاپ

### 🎯 فایل‌های پروژه
- ✅ **Frontend**: تمام فایل‌های React در پوشه `src/`
- ✅ **Backend**: تمام فایل‌های Node.js/Express در پوشه `server/`
- ✅ **Database Schema**: Migration و Seeder فایل‌ها
- ✅ **Configuration**: فایل‌های تنظیمات و environment
- ✅ **Dependencies**: package.json و package-lock.json

### 📊 آمار بکاپ
- **تعداد پوشه‌ها**: 35 پوشه
- **تعداد فایل‌ها**: 115 فایل
- **حجم کل**: 6.21 مگابایت

### 🗄️ دیتابیس
- **نوع**: PostgreSQL
- **نام دیتابیس**: gold_shop_dev
- **اطلاعات اتصال**: مراجعه به `database_backup_info.txt`

## 🚀 راهنمای بازیابی پروژه

### 1️⃣ نصب Dependencies
```bash
# نصب Node.js dependencies
npm install

# یا
npm ci  # برای نصب دقیق بر اساس package-lock.json
```

### 2️⃣ تنظیم دیتابیس
```bash
# ایجاد دیتابیس جدید
createdb -U postgres gold_shop_dev

# اجرای migration ها
npm run migrate

# اجرای seeder ها (اختیاری - برای داده‌های نمونه)
npm run seed
```

### 3️⃣ راه‌اندازی سرور
```bash
# شروع backend server
npm run server

# شروع frontend (در terminal دیگر)
npm start
```

### 4️⃣ تنظیمات Environment
- فایل `.env` را بررسی کنید
- اطلاعات اتصال دیتابیس را در `config/config.json` تنظیم کنید

## 🔧 ویژگی‌های پیاده‌شده تا زمان بکاپ

### ✅ عملکردهای کامل شده:
- 🏪 مدیریت فروشگاه طلا
- 📊 داشبورد اصلی
- 🏷️ مدیریت دسته‌بندی‌ها
- 📦 مدیریت محصولات
- 📋 مدیریت موجودی
- 💰 مدیریت خرید و فروش
- 🧾 صدور فاکتور فروش و خرید
- 💳 مدیریت مالی
- 📈 رهگیری قیمت طلا
- ⚙️ تنظیمات

### 🔄 عملکردهای اخیراً تکمیل شده:
- ✅ رفع مشکل ذخیره فاکتورها در دیتابیس
- ✅ نمایش فاکتورها در لیست‌ها پس از ثبت
- ✅ پایداری داده‌ها پس از refresh صفحه
- ✅ عملکرد صحیح دکمه‌های حذف
- ✅ **مدیریت خودکار محصولات**:
  - اضافه کردن محصولات به لیست هنگام صدور فاکتور خرید
  - حذف محصولات از لیست هنگام صدور فاکتور فروش

### 🏗️ معماری فنی:
- **Frontend**: React 18 + Redux Toolkit
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL با Sequelize ORM
- **UI Framework**: Material-UI (MUI)
- **API Communication**: Axios

## 📝 نکات مهم

### 🔧 تنظیمات پورت:
- **Backend Server**: پورت 5001
- **Frontend Dev Server**: پورت 3000
- **PostgreSQL Database**: پورت 5432

### 📁 ساختار مهم فایل‌ها:
```
backup/
├── src/                    # Frontend React files
├── server/                 # Backend Express files
├── models/                 # Sequelize models
├── migrations/             # Database migrations
├── seeders/               # Database seeders
├── config/                # Configuration files
├── package.json           # Dependencies
├── package-lock.json      # Exact dependency versions
└── database_backup_info.txt # Database info
```

### 🔐 اطلاعات امنیتی:
- رمزهای عبور در فایل‌های `.env` و `config.json` ذخیره شده‌اند
- توصیه می‌شود قبل از استقرار در production، رمزهای عبور را تغییر دهید

## 🆘 عیب‌یابی

### مشکلات رایج و راه‌حل:
1. **خطای EADDRINUSE**: پورت 5001 در حال استفاده است
   - راه‌حل: `netstat -ano | findstr :5001` و kill کردن process

2. **خطای دیتابیس**: اتصال برقرار نمی‌شود
   - راه‌حل: بررسی PostgreSQL service و اطلاعات اتصال

3. **خطای dependency**: modules پیدا نمی‌شوند
   - راه‌حل: `npm install` مجدد

## 📞 اطلاعات تماس
این بکاپ در تاریخ مشخص شده ایجاد شده و شامل آخرین تغییرات کارکردی پروژه می‌باشد.

---
**نکته**: این بکاپ کامل تمام جنبه‌های پروژه را شامل می‌شود و آماده استقرار مجدد است.