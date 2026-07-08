// سرویس تولید PDF برای فاکتورها
// در محیط واقعی باید از کتابخانه‌هایی مثل jsPDF یا react-pdf استفاده کرد

class PDFService {
  constructor() {
    this.defaultSettings = {
      shopName: 'فروشگاه طلا و جواهرات',
      shopAddress: 'تهران، خیابان ولیعصر، پلاک 123',
      shopPhone: '021-1234-5678',
      shopEmail: 'info@goldshop.ir',
      shopLogo: null, // path to logo
      currency: 'تومان',
      language: 'fa'
    };
  }

  // تولید فاکتور فروش PDF
  async generateSaleInvoicePDF(invoiceData) {
    try {
      console.log('تولید PDF فاکتور فروش:', invoiceData);
      
      // ساختار HTML برای فاکتور
      const htmlContent = this.generateSaleInvoiceHTML(invoiceData);
      
      // در اینجا باید از کتابخانه PDF استفاده کرد
      // برای مثال با jsPDF:
      
      /*
      import jsPDF from 'jspdf';
      import 'jspdf-autotable';
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // اضافه کردن فونت فارسی
      // pdf.addFont('Vazir.ttf', 'Vazir', 'normal');
      // pdf.setFont('Vazir');
      
      // Header
      pdf.setFontSize(20);
      pdf.text(this.defaultSettings.shopName, 105, 20, { align: 'center' });
      
      // Customer info
      pdf.setFontSize(12);
      pdf.text(`مشتری: ${invoiceData.customerName}`, 20, 40);
      pdf.text(`تلفن: ${invoiceData.customerPhone}`, 20, 50);
      pdf.text(`تاریخ: ${new Date(invoiceData.date).toLocaleDateString('fa-IR')}`, 150, 40);
      
      // Table
      const tableData = invoiceData.items.map(item => [
        item.productName,
        item.weight + ' گرم',
        item.purity,
        item.quantity,
        item.unitPrice.toLocaleString('fa-IR'),
        item.total.toLocaleString('fa-IR')
      ]);
      
      pdf.autoTable({
        head: [['محصول', 'وزن', 'عیار', 'تعداد', 'قیمت واحد', 'جمع']],
        body: tableData,
        startY: 70,
        styles: { font: 'Vazir', fontSize: 10 },
        headStyles: { fillColor: [212, 175, 55] }
      });
      
      // Totals
      const finalY = pdf.lastAutoTable.finalY + 10;
      pdf.text(`جمع کل: ${invoiceData.subtotal.toLocaleString('fa-IR')} ${this.defaultSettings.currency}`, 150, finalY);
      pdf.text(`اجرت: ${invoiceData.laborCost.toLocaleString('fa-IR')} ${this.defaultSettings.currency}`, 150, finalY + 10);
      pdf.text(`کارمزد: ${invoiceData.commission.toLocaleString('fa-IR')} ${this.defaultSettings.currency}`, 150, finalY + 20);
      pdf.text(`مالیات: ${invoiceData.tax.toLocaleString('fa-IR')} ${this.defaultSettings.currency}`, 150, finalY + 30);
      pdf.text(`مبلغ نهایی: ${invoiceData.total.toLocaleString('fa-IR')} ${this.defaultSettings.currency}`, 150, finalY + 40);
      
      // Save
      pdf.save(`فاکتور-فروش-${Date.now()}.pdf`);
      */
      
      // موقتاً فقط لاگ می‌کنیم
      this.downloadHTMLAsPDF(htmlContent, `فاکتور-فروش-${Date.now()}.html`);
      
      return {
        success: true,
        fileName: `فاکتور-فروش-${Date.now()}.pdf`,
        data: invoiceData
      };
      
    } catch (error) {
      console.error('خطا در تولید PDF فاکتور فروش:', error);
      throw error;
    }
  }

  // تولید فاکتور خرید PDF
  async generatePurchaseInvoicePDF(invoiceData) {
    try {
      console.log('تولید PDF فاکتور خرید:', invoiceData);
      
      const htmlContent = this.generatePurchaseInvoiceHTML(invoiceData);
      this.downloadHTMLAsPDF(htmlContent, `فاکتور-خرید-${Date.now()}.html`);
      
      return {
        success: true,
        fileName: `فاکتور-خرید-${Date.now()}.pdf`,
        data: invoiceData
      };
      
    } catch (error) {
      console.error('خطا در تولید PDF فاکتور خرید:', error);
      throw error;
    }
  }

  // تولید HTML برای فاکتور فروش
  generateSaleInvoiceHTML(invoiceData) {
    const persianDate = new Date(invoiceData.date).toLocaleDateString('fa-IR');
    
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاکتور فروش</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazir:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Vazir', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          direction: rtl;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #d4af37;
          padding-bottom: 20px;
        }
        
        .shop-name {
          font-size: 24px;
          font-weight: bold;
          color: #d4af37;
          margin-bottom: 10px;
        }
        
        .shop-info {
          font-size: 14px;
          color: #666;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        
        .customer-info, .invoice-details {
          flex: 1;
        }
        
        .invoice-details {
          text-align: left;
          direction: ltr;
        }
        
        .section-title {
          font-weight: bold;
          color: #d4af37;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
        }
        
        .items-table th {
          background: #d4af37;
          color: white;
          font-weight: bold;
        }
        
        .items-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .totals {
          margin-right: auto;
          width: 300px;
          border: 2px solid #d4af37;
          padding: 20px;
          border-radius: 5px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        
        .total-row.final {
          border-top: 2px solid #d4af37;
          font-weight: bold;
          font-size: 18px;
          color: #d4af37;
          margin-top: 15px;
          padding-top: 15px;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${this.defaultSettings.shopName}</div>
        <div class="shop-info">
          ${this.defaultSettings.shopAddress}<br>
          تلفن: ${this.defaultSettings.shopPhone} | ایمیل: ${this.defaultSettings.shopEmail}
        </div>
      </div>
      
      <div class="invoice-info">
        <div class="customer-info">
          <div class="section-title">اطلاعات مشتری</div>
          <div><strong>نام:</strong> ${invoiceData.customerName}</div>
          <div><strong>تلفن:</strong> ${invoiceData.customerPhone}</div>
        </div>
        <div class="invoice-details">
          <div class="section-title">مشخصات فاکتور</div>
          <div><strong>تاریخ:</strong> ${persianDate}</div>
          <div><strong>شماره فاکتور:</strong> ${invoiceData.id || 'خودکار'}</div>
          <div><strong>نوع:</strong> فاکتور فروش</div>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>محصول</th>
            <th>وزن (گرم)</th>
            <th>عیار</th>
            <th>تعداد</th>
            <th>قیمت واحد (${this.defaultSettings.currency})</th>
            <th>جمع (${this.defaultSettings.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td>${item.weight}</td>
              <td>${item.purity}</td>
              <td>${item.quantity}</td>
              <td>${item.unitPrice.toLocaleString('fa-IR')}</td>
              <td>${item.total.toLocaleString('fa-IR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="total-row">
          <span>جمع کل کالا:</span>
          <span>${invoiceData.subtotal.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row">
          <span>اجرت ساخت:</span>
          <span>${invoiceData.laborCost.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row">
          <span>کارمزد:</span>
          <span>${invoiceData.commission.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row">
          <span>مالیات (${invoiceData.tax}%):</span>
          <span>${((invoiceData.subtotal + invoiceData.laborCost + invoiceData.commission) * (invoiceData.tax / 100)).toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row">
          <span>سود:</span>
          <span>${invoiceData.profit.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row final">
          <span>مبلغ نهایی:</span>
          <span>${invoiceData.total.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>این فاکتور به صورت الکترونیکی تولید شده است.</p>
        <p>تاریخ تولید: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR')}</p>
      </div>
    </body>
    </html>
    `;
  }

  // تولید HTML برای فاکتور خرید
  generatePurchaseInvoiceHTML(invoiceData) {
    const persianDate = new Date(invoiceData.date).toLocaleDateString('fa-IR');
    
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاکتور خرید</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazir:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Vazir', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          direction: rtl;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #e67e22;
          padding-bottom: 20px;
        }
        
        .shop-name {
          font-size: 24px;
          font-weight: bold;
          color: #e67e22;
          margin-bottom: 10px;
        }
        
        .shop-info {
          font-size: 14px;
          color: #666;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        
        .supplier-info, .invoice-details {
          flex: 1;
        }
        
        .invoice-details {
          text-align: left;
          direction: ltr;
        }
        
        .section-title {
          font-weight: bold;
          color: #e67e22;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
        }
        
        .items-table th {
          background: #e67e22;
          color: white;
          font-weight: bold;
        }
        
        .items-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .totals {
          margin-right: auto;
          width: 300px;
          border: 2px solid #e67e22;
          padding: 20px;
          border-radius: 5px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        
        .total-row.final {
          border-top: 2px solid #e67e22;
          font-weight: bold;
          font-size: 18px;
          color: #e67e22;
          margin-top: 15px;
          padding-top: 15px;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${this.defaultSettings.shopName}</div>
        <div class="shop-info">
          ${this.defaultSettings.shopAddress}<br>
          تلفن: ${this.defaultSettings.shopPhone} | ایمیل: ${this.defaultSettings.shopEmail}
        </div>
      </div>
      
      <div class="invoice-info">
        <div class="supplier-info">
          <div class="section-title">اطلاعات تامین‌کننده</div>
          <div><strong>نام:</strong> ${invoiceData.supplierName}</div>
          <div><strong>تلفن:</strong> ${invoiceData.supplierPhone}</div>
        </div>
        <div class="invoice-details">
          <div class="section-title">مشخصات فاکتور</div>
          <div><strong>تاریخ:</strong> ${persianDate}</div>
          <div><strong>شماره فاکتور:</strong> ${invoiceData.id || 'خودکار'}</div>
          <div><strong>نوع:</strong> فاکتور خرید</div>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>محصول</th>
            <th>وزن (گرم)</th>
            <th>عیار</th>
            <th>تعداد</th>
            <th>قیمت واحد (${this.defaultSettings.currency})</th>
            <th>جمع (${this.defaultSettings.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td>${item.weight}</td>
              <td>${item.purity}</td>
              <td>${item.quantity}</td>
              <td>${item.unitPrice.toLocaleString('fa-IR')}</td>
              <td>${item.total.toLocaleString('fa-IR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="total-row">
          <span>جمع کل کالا:</span>
          <span>${invoiceData.subtotal.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row">
          <span>تخفیف:</span>
          <span>${invoiceData.discount.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
        <div class="total-row final">
          <span>مبلغ نهایی:</span>
          <span>${invoiceData.total.toLocaleString('fa-IR')} ${this.defaultSettings.currency}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>این فاکتور به صورت الکترونیکی تولید شده است.</p>
        <p>تاریخ تولید: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR')}</p>
      </div>
    </body>
    </html>
    `;
  }

  // دانلود HTML به عنوان فایل (موقتی تا پیاده‌سازی PDF واقعی)
  downloadHTMLAsPDF(htmlContent, fileName) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ارسال فاکتور از طریق ایمیل
  async sendInvoiceByEmail(invoiceData, email, type = 'sale') {
    try {
      console.log(`ارسال فاکتور ${type} به ایمیل ${email}:`, invoiceData);
      
      // در اینجا باید API ارسال ایمیل فراخوانی شود
      // مثلاً با استفاده از SendGrid, Mailgun یا سرویس داخلی
      
      const emailData = {
        to: email,
        subject: `فاکتور ${type === 'sale' ? 'فروش' : 'خرید'} - ${this.defaultSettings.shopName}`,
        html: type === 'sale' ? 
          this.generateSaleInvoiceHTML(invoiceData) : 
          this.generatePurchaseInvoiceHTML(invoiceData),
        attachments: [] // PDF file can be attached here
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'فاکتور با موفقیت ارسال شد',
        email: email
      };
      
    } catch (error) {
      console.error('خطا در ارسال ایمیل:', error);
      throw error;
    }
  }

  // ارسال فاکتور از طریق پیامک
  async sendInvoiceBySMS(invoiceData, phoneNumber, type = 'sale') {
    try {
      console.log(`ارسال فاکتور ${type} به شماره ${phoneNumber}:`, invoiceData);
      
      const smsText = `
${this.defaultSettings.shopName}
فاکتور ${type === 'sale' ? 'فروش' : 'خرید'}
تاریخ: ${new Date(invoiceData.date).toLocaleDateString('fa-IR')}
مبلغ: ${invoiceData.total.toLocaleString('fa-IR')} ${this.defaultSettings.currency}
از خرید شما متشکریم.
      `.trim();
      
      // در اینجا باید API پیامک فراخوانی شود
      // مثلاً Kavenegar, SmsIr یا سرویس داخلی
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'پیامک با موفقیت ارسال شد',
        phoneNumber: phoneNumber
      };
      
    } catch (error) {
      console.error('خطا در ارسال پیامک:', error);
      throw error;
    }
  }

  // ارسال فاکتور از طریق واتساپ
  async sendInvoiceByWhatsApp(invoiceData, phoneNumber, type = 'sale') {
    try {
      console.log(`ارسال فاکتور ${type} به واتساپ ${phoneNumber}:`, invoiceData);
      
      const whatsappText = `
🏪 *${this.defaultSettings.shopName}*

📄 فاکتور ${type === 'sale' ? 'فروش' : 'خرید'}
📅 تاریخ: ${new Date(invoiceData.date).toLocaleDateString('fa-IR')}
💰 مبلغ: ${invoiceData.total.toLocaleString('fa-IR')} ${this.defaultSettings.currency}

🙏 از خرید شما متشکریم
📞 ${this.defaultSettings.shopPhone}
      `.trim();
      
      // ایجاد لینک واتساپ
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;
      
      // باز کردن واتساپ
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }
      
      return {
        success: true,
        message: 'واتساپ باز شد',
        phoneNumber: phoneNumber,
        url: whatsappUrl
      };
      
    } catch (error) {
      console.error('خطا در ارسال واتساپ:', error);
      throw error;
    }
  }

  // تنظیم اطلاعات پیش‌فرض فروشگاه
  setShopSettings(settings) {
    this.defaultSettings = { ...this.defaultSettings, ...settings };
  }

  // دریافت اطلاعات فروشگاه
  getShopSettings() {
    return this.defaultSettings;
  }
}

// ایجاد نمونه singleton
const pdfService = new PDFService();

export default pdfService;