# راهنمای API‌های مالی و مدیریت خرید و فروش

این راهنما توضیح کاملی از API‌های مالی، ساختار دیتابیس و نحوه استفاده از آنها ارائه می‌دهد.

## ساختار دیتابیس

### جدول تراکنش‌ها (Transactions)
جدول اصلی برای ذخیره اطلاعات خرید و فروش:

- `id`: شناسه یکتا
- `transaction_number`: شماره تراکنش (منحصر به فرد)
- `type`: نوع تراکنش (`purchase` یا `sale`)
- `customer_name`: نام مشتری
- `customer_phone`: شماره تلفن مشتری
- `customer_address`: آدرس مشتری
- `total_weight`: وزن کل (گرم)
- `total_amount`: مبلغ کل
- `payment_method`: روش پرداخت (`cash`, `card`, `installment`, `exchange`)
- `payment_status`: وضعیت پرداخت (`pending`, `partial`, `completed`)
- `paid_amount`: مبلغ پرداخت شده
- `remaining_amount`: مبلغ باقی‌مانده
- `gold_price_18k`: قیمت طلای 18 عیار در زمان تراکنش
- `gold_price_24k`: قیمت طلای 24 عیار در زمان تراکنش
- `discount_amount`: مبلغ تخفیف
- `tax_amount`: مبلغ مالیات
- `notes`: یادداشت‌ها
- `transaction_date`: تاریخ تراکنش

### جدول آیتم‌های تراکنش (TransactionItems)
جزئیات اقلام هر تراکنش:

- `id`: شناسه یکتا
- `transaction_id`: شناسه تراکنش
- `product_id`: شناسه محصول (اختیاری)
- `inventory_id`: شناسه موجودی (اختیاری)
- `item_name`: نام آیتم
- `item_description`: توضیحات آیتم
- `weight`: وزن
- `purity`: عیار
- `making_wage`: اجرت ساخت
- `unit_price`: قیمت واحد
- `total_price`: قیمت کل
- `quantity`: تعداد

### جدول پرداخت‌ها (Payments)
تاریخچه پرداخت‌های هر تراکنش:

- `id`: شناسه یکتا
- `transaction_id`: شناسه تراکنش
- `payment_number`: شماره پرداخت
- `amount`: مبلغ پرداخت
- `payment_method`: روش پرداخت
- `payment_date`: تاریخ پرداخت
- `reference_number`: شماره مرجع
- `notes`: یادداشت‌ها
- `status`: وضعیت پرداخت

### جدول اقساط (Installments)
مدیریت اقساط:

- `id`: شناسه یکتا
- `transaction_id`: شناسه تراکنش
- `installment_number`: شماره قسط
- `amount`: مبلغ قسط
- `due_date`: تاریخ سررسید
- `paid_date`: تاریخ پرداخت
- `paid_amount`: مبلغ پرداخت شده
- `status`: وضعیت (`pending`, `paid`, `overdue`, `cancelled`)
- `late_fee`: جریمه دیرکرد
- `notes`: یادداشت‌ها

### جدول هزینه‌ها (Expenses)
مدیریت هزینه‌های کسب‌وکار:

- `id`: شناسه یکتا
- `title`: عنوان هزینه
- `description`: توضیحات
- `amount`: مبلغ
- `category`: دسته‌بندی (`rent`, `utilities`, `supplies`, `marketing`, `labor`, `equipment`, `maintenance`, `other`)
- `expense_date`: تاریخ هزینه
- `payment_method`: روش پرداخت
- `receipt_number`: شماره رسید
- `vendor_name`: نام فروشنده
- `vendor_phone`: شماره تلفن فروشنده
- `status`: وضعیت (`pending`, `paid`, `cancelled`)

## API Endpoints

### API تراکنش‌ها

#### دریافت همه تراکنش‌ها
```http
GET /api/transactions
```

پارامترهای اختیاری:
- `type`: نوع تراکنش (purchase/sale)
- `status`: وضعیت پرداخت (pending/partial/completed)
- `customer`: جستجو در نام یا شماره مشتری
- `startDate`: تاریخ شروع
- `endDate`: تاریخ پایان
- `page`: شماره صفحه
- `limit`: تعداد در هر صفحه

#### دریافت تراکنش خاص
```http
GET /api/transactions/:id
```

#### ایجاد تراکنش جدید
```http
POST /api/transactions
```

نمونه داده‌های ورودی:
```json
{
  "type": "sale",
  "customer_name": "احمد محمدی",
  "customer_phone": "09123456789",
  "customer_address": "تهران، میدان آزادی",
  "payment_method": "installment",
  "gold_price_18k": 1350000,
  "gold_price_24k": 1800000,
  "discount_amount": 500000,
  "notes": "فروش دستبند طلا",
  "items": [
    {
      "item_name": "دستبند طلا",
      "weight": 15.5,
      "purity": 18,
      "making_wage": 2000000,
      "unit_price": 1350000,
      "total_price": 25000000,
      "quantity": 1
    }
  ],
  "installments": [
    {
      "installment_number": 1,
      "amount": 12500000,
      "due_date": "2025-02-15"
    },
    {
      "installment_number": 2,
      "amount": 12500000,
      "due_date": "2025-03-15"
    }
  ]
}
```

#### به‌روزرسانی تراکنش
```http
PUT /api/transactions/:id
```

#### حذف تراکنش
```http
DELETE /api/transactions/:id
```

#### افزودن پرداخت
```http
POST /api/transactions/:id/payments
```

نمونه داده:
```json
{
  "amount": 5000000,
  "payment_method": "cash",
  "reference_number": "REF123",
  "notes": "پرداخت نقدی"
}
```

#### خلاصه تراکنش‌ها
```http
GET /api/transactions/summary
```

### API هزینه‌ها

#### دریافت همه هزینه‌ها
```http
GET /api/expenses
```

پارامترهای اختیاری:
- `category`: دسته‌بندی هزینه
- `status`: وضعیت هزینه
- `startDate`: تاریخ شروع
- `endDate`: تاریخ پایان
- `page`: شماره صفحه
- `limit`: تعداد در هر صفحه

#### دریافت هزینه خاص
```http
GET /api/expenses/:id
```

#### ایجاد هزینه جدید
```http
POST /api/expenses
```

نمونه داده:
```json
{
  "title": "اجاره ماهانه",
  "description": "اجاره مغازه ماه بهمن",
  "amount": 15000000,
  "category": "rent",
  "payment_method": "cash",
  "vendor_name": "محمد صاحب ملک",
  "vendor_phone": "09121234567",
  "expense_date": "2025-01-01"
}
```

#### به‌روزرسانی هزینه
```http
PUT /api/expenses/:id
```

#### حذف هزینه
```http
DELETE /api/expenses/:id
```

#### خلاصه هزینه‌ها
```http
GET /api/expenses/summary
```

### API اقساط

#### دریافت همه اقساط
```http
GET /api/installments
```

پارامترهای اختیاری:
- `status`: وضعیت قسط
- `overdue`: اقساط معوقه (true/false)
- `page`: شماره صفحه
- `limit`: تعداد در هر صفحه

#### دریافت قسط خاص
```http
GET /api/installments/:id
```

#### پرداخت قسط
```http
POST /api/installments/:id/pay
```

نمونه داده:
```json
{
  "paid_amount": 12500000,
  "late_fee": 125000,
  "notes": "پرداخت قسط اول"
}
```

#### به‌روزرسانی قسط
```http
PUT /api/installments/:id
```

#### اقساط معوقه
```http
GET /api/installments/overdue
```

#### خلاصه اقساط
```http
GET /api/installments/summary
```

## سرویس‌های فرانت‌اند

### TransactionService
سرویس مدیریت تراکنش‌ها:

```javascript
import transactionService from '../services/transactionService';

// دریافت تراکنش‌ها
const transactions = await transactionService.getTransactions({
  type: 'sale',
  page: 1,
  limit: 10
});

// ایجاد تراکنش جدید
const newTransaction = await transactionService.createTransaction(transactionData);

// محاسبه قیمت آیتم
const price = transactionService.calculateItemPrice(15.5, 18, 1350000, 2000000);
```

### ExpenseService
سرویس مدیریت هزینه‌ها:

```javascript
import expenseService from '../services/expenseService';

// دریافت هزینه‌ها
const expenses = await expenseService.getExpenses({
  category: 'rent',
  page: 1
});

// ایجاد هزینه جدید
const newExpense = await expenseService.createExpense(expenseData);

// دریافت دسته‌بندی‌ها
const categories = expenseService.getExpenseCategories();
```

### InstallmentService
سرویس مدیریت اقساط:

```javascript
import installmentService from '../services/installmentService';

// دریافت اقساط
const installments = await installmentService.getInstallments();

// پرداخت قسط
await installmentService.payInstallment(installmentId, paymentData);

// بررسی معوقه بودن
const isOverdue = installmentService.isOverdue(dueDate);

// تولید برنامه اقساط
const schedule = installmentService.generateInstallmentSchedule(25000000, 5, new Date());
```

## Redux State Management

### Transaction Slice
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { fetchTransactions, createTransaction } from '../store/slices/transactionSlice';

const dispatch = useDispatch();
const { transactions, loading, error } = useSelector(state => state.transactions);

// دریافت تراکنش‌ها
dispatch(fetchTransactions({ type: 'sale' }));

// ایجاد تراکنش
dispatch(createTransaction(transactionData));
```

### Expense Slice
```javascript
import { fetchExpenses, createExpense } from '../store/slices/expenseSlice';

const { expenses, loading } = useSelector(state => state.expenses);

// دریافت هزینه‌ها
dispatch(fetchExpenses({ category: 'rent' }));
```

### Installment Slice
```javascript
import { fetchInstallments, payInstallment } from '../store/slices/installmentSlice';

const { installments, overdueInstallments } = useSelector(state => state.installments);

// پرداخت قسط
dispatch(payInstallment({ id: installmentId, paymentData }));
```

## نحوه راه‌اندازی

### 1. اجرای Migration ها
```bash
npx sequelize-cli db:migrate
```

### 2. اجرای Seed ها
```bash
npx sequelize-cli db:seed:all
```

### 3. راه‌اندازی سرور
```bash
npm run dev
```

## نکات مهم

1. **امنیت**: همیشه از validation middleware استفاده کنید
2. **تراکنش دیتابیس**: برای عملیات پیچیده از database transaction استفاده شود
3. **محاسبات مالی**: همیشه از DECIMAL برای مبالغ استفاده کنید
4. **تاریخ‌ها**: از UTC timestamp برای ذخیره تاریخ استفاده کنید
5. **شماره‌گذاری**: شماره تراکنش‌ها باید منحصر به فرد باشند

## مثال‌های کاربردی

### ایجاد فروش اقساطی
```javascript
const saleData = {
  type: 'sale',
  customer_name: 'علی احمدی',
  customer_phone: '09123456789',
  payment_method: 'installment',
  gold_price_18k: 1350000,
  gold_price_24k: 1800000,
  items: [
    {
      item_name: 'انگشتر طلا',
      weight: 5.2,
      purity: 18,
      making_wage: 800000,
      unit_price: 1350000,
      total_price: 8320000,
      quantity: 1
    }
  ],
  installments: [
    { installment_number: 1, amount: 4160000, due_date: '2025-02-15' },
    { installment_number: 2, amount: 4160000, due_date: '2025-03-15' }
  ]
};

const transaction = await transactionService.createTransaction(saleData);
```

### گزارش مالی ماهانه
```javascript
const startDate = '2025-01-01';
const endDate = '2025-01-31';

const [transactionSummary, expenseSummary] = await Promise.all([
  transactionService.getTransactionSummary({ startDate, endDate }),
  expenseService.getExpenseSummary({ startDate, endDate })
]);

console.log('فروش ماه:', transactionSummary.sales.total_amount);
console.log('خرید ماه:', transactionSummary.purchases.total_amount);
console.log('هزینه‌های ماه:', expenseSummary.total.total_amount);
```

این مستندات راهنمای کاملی برای استفاده از سیستم مالی و مدیریت خرید و فروش فراهم می‌کند.