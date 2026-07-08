const { Installment, Transaction } = require('../../models');
const { Op } = require('sequelize');

exports.getAllInstallments = async (req, res) => {
  try {
    const { status, overdue, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status) whereClause.status = status;
    
    // Check for overdue installments
    if (overdue === 'true') {
      whereClause.due_date = {
        [Op.lt]: new Date()
      };
      whereClause.status = 'pending';
    }

    const { count, rows } = await Installment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'transaction_number', 'customer_name', 'customer_phone', 'type']
        }
      ],
      order: [['due_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        installments: rows,
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
      message: 'خطا در دریافت اقساط',
      error: error.message
    });
  }
};

exports.getInstallmentById = async (req, res) => {
  try {
    const installment = await Installment.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          as: 'transaction'
        }
      ]
    });
    
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'قسط مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت قسط',
      error: error.message
    });
  }
};

exports.payInstallment = async (req, res) => {
  try {
    const installment = await Installment.findByPk(req.params.id);
    
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'قسط مورد نظر یافت نشد'
      });
    }
    
    const { paid_amount, late_fee = 0, notes } = req.body;
    
    // Update installment
    await installment.update({
      paid_amount: paid_amount,
      paid_date: new Date(),
      late_fee: late_fee,
      status: paid_amount >= installment.amount ? 'paid' : 'pending',
      notes: notes
    });
    
    // Update transaction payment status
    const transaction = await Transaction.findByPk(installment.transaction_id);
    if (transaction) {
      const newPaidAmount = parseFloat(transaction.paid_amount) + parseFloat(paid_amount);
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
    }
    
    res.json({
      success: true,
      data: installment,
      message: 'قسط با موفقیت پرداخت شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در پرداخت قسط',
      error: error.message
    });
  }
};

exports.updateInstallment = async (req, res) => {
  try {
    const installment = await Installment.findByPk(req.params.id);
    
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'قسط مورد نظر یافت نشد'
      });
    }
    
    await installment.update(req.body);
    
    res.json({
      success: true,
      data: installment,
      message: 'قسط با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی قسط',
      error: error.message
    });
  }
};

exports.getOverdueInstallments = async (req, res) => {
  try {
    const overdueInstallments = await Installment.findAll({
      where: {
        due_date: {
          [Op.lt]: new Date()
        },
        status: 'pending'
      },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'transaction_number', 'customer_name', 'customer_phone']
        }
      ],
      order: [['due_date', 'ASC']]
    });
    
    res.json({
      success: true,
      data: overdueInstallments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اقساط معوقه',
      error: error.message
    });
  }
};

exports.getInstallmentSummary = async (req, res) => {
  try {
    const totalPending = await Installment.findAll({
      where: { status: 'pending' },
      attributes: [
        [Installment.sequelize.fn('COUNT', Installment.sequelize.col('id')), 'count'],
        [Installment.sequelize.fn('SUM', Installment.sequelize.col('amount')), 'total_amount']
      ]
    });
    
    const totalPaid = await Installment.findAll({
      where: { status: 'paid' },
      attributes: [
        [Installment.sequelize.fn('COUNT', Installment.sequelize.col('id')), 'count'],
        [Installment.sequelize.fn('SUM', Installment.sequelize.col('paid_amount')), 'total_amount']
      ]
    });
    
    const overdue = await Installment.findAll({
      where: {
        due_date: {
          [Op.lt]: new Date()
        },
        status: 'pending'
      },
      attributes: [
        [Installment.sequelize.fn('COUNT', Installment.sequelize.col('id')), 'count'],
        [Installment.sequelize.fn('SUM', Installment.sequelize.col('amount')), 'total_amount']
      ]
    });
    
    res.json({
      success: true,
      data: {
        pending: totalPending[0],
        paid: totalPaid[0],
        overdue: overdue[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت خلاصه اقساط',
      error: error.message
    });
  }
};