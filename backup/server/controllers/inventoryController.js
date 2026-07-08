const { Inventory, Product } = require('../../models');

exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{
        model: Product,
        as: 'product'
      }]
    });
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت موجودی',
      error: error.message
    });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'product'
      }]
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'موجودی مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت موجودی',
      error: error.message
    });
  }
};

exports.createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: inventory,
      message: 'موجودی با موفقیت ایجاد شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد موجودی',
      error: error.message
    });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'موجودی مورد نظر یافت نشد'
      });
    }
    
    await inventory.update(req.body);
    
    res.json({
      success: true,
      data: inventory,
      message: 'موجودی با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی موجودی',
      error: error.message
    });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'موجودی مورد نظر یافت نشد'
      });
    }
    
    await inventory.destroy();
    
    res.json({
      success: true,
      message: 'موجودی با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف موجودی',
      error: error.message
    });
  }
};