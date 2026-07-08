const { Transaction, TransactionItem, Payment, Installment, Product, Inventory } = require('../../models');
const { Op } = require('sequelize');

// Helper function to generate transaction number
const generateTransactionNumber = (type) => {
  const prefix = type === 'purchase' ? 'P' : 'S';
  const timestamp = Date.now().toString().slice(-8);
  return `${prefix}${timestamp}`;
};

// Helper function to generate payment number
const generatePaymentNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `PAY${timestamp}`;
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { type, status, startDate, endDate, customer, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (type) whereClause.type = type;
    if (status) whereClause.payment_status = status;
    if (customer) {
      whereClause[Op.or] = [
        { customer_name: { [Op.like]: `%${customer}%` } },
        { customer_phone: { [Op.like]: `%${customer}%` } }
      ];
    }
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: TransactionItem,
          as: 'items',
          required: false
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        transactions: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تراکنش‌ها',
      error: error.message
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          required: false
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        },
        {
          model: Installment,
          as: 'installments',
          required: false
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'تراکنش مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تراکنش',
      error: error.message
    });
  }
};

exports.createTransaction = async (req, res) => {
  const dbTransaction = await Transaction.sequelize.transaction();
  
  try {
    console.log('Received transaction data:', req.body);
    
    const { items, installments, ...transactionData } = req.body;
    
    // Validate required fields
    if (!transactionData.customer_name) {
      throw new Error('نام مشتری الزامی است');
    }
    
    if (!transactionData.type || !['sale', 'purchase'].includes(transactionData.type)) {
      throw new Error('نوع تراکنش باید sale یا purchase باشد');
    }
    
    // Generate transaction number
    transactionData.transaction_number = generateTransactionNumber(transactionData.type);
    
    // Calculate totals
    let totalWeight = 0;
    let totalAmount = 0;
    
    if (items && items.length > 0) {
      items.forEach(item => {
        totalWeight += parseFloat(item.weight || 0) * parseInt(item.quantity || 1);
        totalAmount += parseFloat(item.total_price || 0);
      });
    }
    
    // Set calculated values
    transactionData.total_weight = totalWeight;
    transactionData.total_amount = totalAmount;
    transactionData.remaining_amount = totalAmount - (transactionData.paid_amount || 0);
    
    // Ensure numeric fields are properly formatted
    transactionData.gold_price_18k = parseFloat(transactionData.gold_price_18k || 0);
    transactionData.gold_price_24k = parseFloat(transactionData.gold_price_24k || 0);
    transactionData.paid_amount = parseFloat(transactionData.paid_amount || 0);
    transactionData.discount_amount = parseFloat(transactionData.discount_amount || 0);
    transactionData.tax_amount = parseFloat(transactionData.tax_amount || 0);
    
    console.log('Creating transaction with data:', transactionData);
    
    // Create transaction
    const newTransaction = await Transaction.create(transactionData, { transaction: dbTransaction });
    
    console.log('Transaction created with ID:', newTransaction.id);
    
    // Create transaction items
    if (items && items.length > 0) {
      const itemsWithTransactionId = items.map(item => ({
        transaction_id: newTransaction.id,
        product_id: item.product_id || null,
        item_name: item.item_name || 'نامشخص',
        weight: parseFloat(item.weight || 0),
        purity: parseInt(item.purity || 18),
        making_wage: parseFloat(item.making_wage || 0),
        unit_price: parseFloat(item.unit_price || 0),
        total_price: parseFloat(item.total_price || 0),
        quantity: parseInt(item.quantity || 1)
      }));
      
      console.log('Creating items:', itemsWithTransactionId);
      
      await TransactionItem.bulkCreate(itemsWithTransactionId, { transaction: dbTransaction });
    }
    
    // Create installments if payment method is installment
    if (transactionData.payment_method === 'installment' && installments && installments.length > 0) {
      const installmentsWithTransactionId = installments.map(installment => ({
        ...installment,
        transaction_id: newTransaction.id
      }));
      await Installment.bulkCreate(installmentsWithTransactionId, { transaction: dbTransaction });
    }
    
    await dbTransaction.commit();
    
    // Fetch the complete transaction with relations
    const completeTransaction = await Transaction.findByPk(newTransaction.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          required: false
        },
        {
          model: Installment,
          as: 'installments',
          required: false
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: completeTransaction,
      message: 'تراکنش با موفقیت ایجاد شد'
    });
  } catch (error) {
    await dbTransaction.rollback();
    console.error('Transaction creation error:', error);
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد تراکنش',
      error: error.message
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'تراکنش مورد نظر یافت نشد'
      });
    }
    
    await transaction.update(req.body);
    
    res.json({
      success: true,
      data: transaction,
      message: 'تراکنش با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی تراکنش',
      error: error.message
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'تراکنش مورد نظر یافت نشد'
      });
    }
    
    await transaction.destroy();
    
    res.json({
      success: true,
      message: 'تراکنش با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف تراکنش',
      error: error.message
    });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'تراکنش مورد نظر یافت نشد'
      });
    }
    
    const paymentData = {
      ...req.body,
      transaction_id: transaction.id,
      payment_number: generatePaymentNumber()
    };
    
    const payment = await Payment.create(paymentData);
    
    // Update transaction paid amount and status
    const newPaidAmount = parseFloat(transaction.paid_amount) + parseFloat(payment.amount);
    const remainingAmount = parseFloat(transaction.total_amount) - newPaidAmount;
    
    let paymentStatus = 'partial';
    if (remainingAmount <= 0) {
      paymentStatus = 'completed';
    } else if (newPaidAmount === 0) {
      paymentStatus = 'pending';
    }
    
    await transaction.update({
      paid_amount: newPaidAmount,
      remaining_amount: Math.max(0, remainingAmount),
      payment_status: paymentStatus
    });
    
    res.status(201).json({
      success: true,
      data: payment,
      message: 'پرداخت با موفقیت ثبت شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در ثبت پرداخت',
      error: error.message
    });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const salesSummary = await Transaction.findAll({
      where: { ...whereClause, type: 'sale' },
      attributes: [
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'total_transactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'total_amount'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('paid_amount')), 'total_paid'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('remaining_amount')), 'total_remaining']
      ]
    });
    
    const purchasesSummary = await Transaction.findAll({
      where: { ...whereClause, type: 'purchase' },
      attributes: [
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'total_transactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'total_amount'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('paid_amount')), 'total_paid'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('remaining_amount')), 'total_remaining']
      ]
    });
    
    res.json({
      success: true,
      data: {
        sales: salesSummary[0],
        purchases: purchasesSummary[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت خلاصه تراکنش‌ها',
      error: error.message
    });
  }
};