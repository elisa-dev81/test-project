const { Category, Product } = require('../../models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Category,
          as: 'children'
        },
        {
          model: Product,
          as: 'products'
        }
      ]
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دسته‌بندی‌ها',
      error: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'children'
        },
        {
          model: Product,
          as: 'products'
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دسته‌بندی',
      error: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'دسته‌بندی با موفقیت ایجاد شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد دسته‌بندی',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی مورد نظر یافت نشد'
      });
    }
    
    await category.update(req.body);
    
    res.json({
      success: true,
      data: category,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی دسته‌بندی',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی مورد نظر یافت نشد'
      });
    }
    
    await category.destroy();
    
    res.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف دسته‌بندی',
      error: error.message
    });
  }
};