// تابع تبدیل اعداد انگلیسی به فارسی
export const toPersianNumbers = (number) => {
  if (number === null || number === undefined) return '';
  
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = number.toString();
  
  // تبدیل اعداد انگلیسی به فارسی
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
  }
  
  return result;
};

// تابع تبدیل اعداد به فارسی با فرمت مناسب
export const formatPersianNumber = (number, options = {}) => {
  if (number === null || number === undefined) return '';
  
  const {
    locale = 'fa-IR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    style = 'decimal',
    currency = 'IRR'
  } = options;
  
  // اگر عدد باشد، ابتدا فرمت انگلیسی را اعمال کن
  if (typeof number === 'number') {
    const formattedNumber = number.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      style,
      currency
    });
    
    // سپس اعداد را به فارسی تبدیل کن
    return toPersianNumbers(formattedNumber);
  }
  
  // اگر رشته باشد، مستقیماً اعداد را تبدیل کن
  return toPersianNumbers(number);
};

// تابع تبدیل اعداد به فارسی برای نمایش در کارت‌ها
export const formatCardNumber = (number) => {
  if (number === null || number === undefined) return '۰';
  
  if (typeof number === 'number') {
    // برای اعداد بزرگ، از فرمت میلیونی استفاده کن
    if (number >= 1000000) {
      const millions = (number / 1000000).toFixed(1);
      return toPersianNumbers(millions) + 'M';
    }
    
    // برای اعداد معمولی، از فرمت عادی استفاده کن
    return toPersianNumbers(number.toLocaleString('fa-IR'));
  }
  
  return toPersianNumbers(number.toString());
};

// تابع تبدیل اعداد به فارسی برای نمایش قیمت
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '۰ تومان';
  
  const formattedPrice = formatPersianNumber(price, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${formattedPrice} تومان`;
};

// تابع تبدیل اعداد به فارسی برای نمایش وزن
export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return '۰ گرم';
  
  const formattedWeight = formatPersianNumber(weight, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  });
  
  return `${formattedWeight} گرم`;
};

// تابع تبدیل اعداد به فارسی برای نمایش درصد
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return '۰%';
  
  const formattedPercentage = formatPersianNumber(percentage, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
  
  return `${formattedPercentage}%`;
};
