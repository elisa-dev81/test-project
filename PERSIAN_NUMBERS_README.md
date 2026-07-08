# تبدیل اعداد به فارسی در پروژه فروشگاه طلا

## 📋 فایل‌های ایجاد شده

### 1. `src/utils/persianNumbers.js`
تابع‌های اصلی برای تبدیل اعداد به فارسی

### 2. `src/utils/globalPersianNumbers.js`
تابع‌های پیشرفته برای تبدیل اعداد در کل پروژه

### 3. `src/styles/persianNumbers.css`
استایل‌های CSS برای نمایش اعداد فارسی

## 🚀 نحوه استفاده

### Import کردن توابع
```javascript
import { 
  toPersianNumbers, 
  formatPrice, 
  formatWeight, 
  formatCardNumber,
  formatTableNumber 
} from '../../utils/persianNumbers';
```

### مثال‌های استفاده

#### 1. تبدیل اعداد ساده
```javascript
// قبل
{totalProducts.toLocaleString('fa-IR')}

// بعد
{toPersianNumbers(totalProducts.toLocaleString('fa-IR'))}
```

#### 2. نمایش قیمت
```javascript
// قبل
{price.toLocaleString('fa-IR')} تومان

// بعد
{formatPrice(price)}
```

#### 3. نمایش وزن
```javascript
// قبل
{weight.toFixed(1)} گرم

// بعد
{formatWeight(weight)}
```

#### 4. نمایش در کارت‌ها
```javascript
// قبل
{value.toLocaleString('fa-IR')}

// بعد
{formatCardNumber(value)}
```

#### 5. نمایش در جدول‌ها
```javascript
// قبل
{item.price.toLocaleString('fa-IR')}

// بعد
{formatTableNumber(item.price)}
```

## 📊 توابع موجود

### `toPersianNumbers(number)`
تبدیل مستقیم اعداد انگلیسی به فارسی

### `formatPrice(price)`
تبدیل قیمت به فارسی با واحد تومان

### `formatWeight(weight)`
تبدیل وزن به فارسی با واحد گرم

### `formatCardNumber(number)`
تبدیل اعداد برای نمایش در کارت‌ها (با فرمت میلیونی)

### `formatTableNumber(number)`
تبدیل اعداد برای نمایش در جدول‌ها

### `formatPercentage(percentage)`
تبدیل درصد به فارسی

### `formatStatCardNumber(number)`
تبدیل اعداد برای کارت‌های آماری

## 🎨 کلاس‌های CSS

### `.persian-numbers`
کلاس اصلی برای اعداد فارسی

### `.card-number`
کلاس برای اعداد در کارت‌ها

### `.table-number`
کلاس برای اعداد در جدول‌ها

### `.price-number`
کلاس برای اعداد قیمت

### `.weight-number`
کلاس برای اعداد وزن

### `.percentage-number`
کلاس برای اعداد درصد

## 📝 مثال کامل

```javascript
import { formatPrice, formatCardNumber } from '../../utils/persianNumbers';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Typography variant="h3" className="card-number">
        {formatCardNumber(value)}
      </Typography>
      <Typography variant="body2">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

// استفاده
<StatCard 
  title="ارزش کل موجودی"
  value={totalValue}
  icon={<AttachMoney />}
  color="#2c3e50"
/>
```

## 🔄 فایل‌های به‌روزرسانی شده

✅ `src/pages/Dashboard/Dashboard.js`
✅ `src/pages/Finance/FinanceManagement.js`
✅ `src/pages/Inventory/Inventory.js`
✅ `src/pages/Sales/SalesManagement.js`
✅ `src/App.js`

## 📈 نتیجه

حالا تمام اعداد در کارت‌ها، جدول‌ها و بخش‌های مختلف پروژه به فارسی نمایش داده می‌شوند:

- **اعداد کارت‌ها**: ۱۲۳۴ → ۱۲۳۴
- **قیمت‌ها**: 1,234,567 تومان → ۱,۲۳۴,۵۶۷ تومان
- **وزن‌ها**: 12.5 گرم → ۱۲.۵ گرم
- **درصدها**: 15% → ۱۵%

## 🎯 نکات مهم

1. **فونت Vazirmatn**: برای نمایش بهتر اعداد فارسی استفاده شده
2. **Direction RTL**: اعداد با جهت راست به چپ نمایش داده می‌شوند
3. **فرمت مناسب**: اعداد بزرگ به صورت میلیونی نمایش داده می‌شوند
4. **سازگاری**: با تمام بخش‌های پروژه سازگار است
