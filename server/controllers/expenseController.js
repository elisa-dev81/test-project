const { Expense } = require('../../models');
const { Op } = require('sequelize');

exports.getAllExpenses = async (req, res) => {
  try {
    const { category, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.expense_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Expense.findAndCountAll({
      where: whereClause,
      order: [['expense_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        expenses: rows,
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
      message: 'خطا در دریافت هزینه‌ها',
      error: error.message
    });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'هزینه مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت هزینه',
      error: error.message
    });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    
    res.status(201).json({
      success: true,
      data: expense,
      message: 'هزینه با موفقیت ایجاد شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد هزینه',
      error: error.message
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'هزینه مورد نظر یافت نشد'
      });
    }
    
    await expense.update(req.body);
    
    res.json({
      success: true,
      data: expense,
      message: 'هزینه با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی هزینه',
      error: error.message
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'هزینه مورد نظر یافت نشد'
      });
    }
    
    await expense.destroy();
    
    res.json({
      success: true,
      message: 'هزینه با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف هزینه',
      error: error.message
    });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.expense_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const summaryByCategory = await Expense.findAll({
      where: whereClause,
      attributes: [
        'category',
        [Expense.sequelize.fn('COUNT', Expense.sequelize.col('id')), 'total_count'],
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total_amount']
      ],
      group: ['category']
    });
    
    const totalSummary = await Expense.findAll({
      where: whereClause,
      attributes: [
        [Expense.sequelize.fn('COUNT', Expense.sequelize.col('id')), 'total_expenses'],
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total_amount']
      ]
    });
    
    res.json({
      success: true,
      data: {
        by_category: summaryByCategory,
        total: totalSummary[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت خلاصه هزینه‌ها',
      error: error.message
    });
  }
};