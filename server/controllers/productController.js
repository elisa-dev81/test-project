const { Product, Category, Inventory } = require('../../models');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Inventory,
          as: 'inventories'
        }
      ]
    });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات',
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Inventory,
          as: 'inventories'
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول مورد نظر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصول',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    const product = await Product.create(req.body);
    console.log('Product created successfully:', product.toJSON());
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'محصول با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد محصول',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول مورد نظر یافت نشد'
      });
    }
    
    await product.update(req.body);
    
    res.json({
      success: true,
      data: product,
      message: 'محصول با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی محصول',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول مورد نظر یافت نشد'
      });
    }
    
    await product.destroy();
    
    res.json({
      success: true,
      message: 'محصول با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف محصول',
      error: error.message
    });
  }
};