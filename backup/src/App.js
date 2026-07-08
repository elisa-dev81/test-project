import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductsSimple from './pages/Products/ProductsSimple';
import ProductDetail from './pages/Products/ProductDetail';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import CategoriesFixed from './pages/Categories/CategoriesFixed';
import CategoryDetail from './pages/Categories/CategoryDetail';
import EditCategory from './pages/Categories/EditCategory';
import Inventory from './pages/Inventory/Inventory';
import InventoryDetail from './pages/Inventory/InventoryDetail';
import EditInventory from './pages/Inventory/EditInventory';
import AddInventory from './pages/Inventory/AddInventory';
import Settings from './pages/Settings/Settings';
import PriceBoard from './pages/PriceBoard/PriceBoard';
import Calculator from './pages/Calculator/Calculator';
import SalesManagement from './pages/Sales/SalesManagement';
import FinanceManagement from './pages/Finance/FinanceManagement';

// Redux actions
import { fetchProducts } from './store/slices/productSlice';
import { fetchCategories } from './store/slices/categorySlice';
import { initializeInventory } from './store/slices/inventorySlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load initial data in sequence
    const loadData = async () => {
      try {
        // First load products and categories
        await Promise.all([
          dispatch(fetchProducts()).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);
        
        // Then initialize inventory for all products
        await dispatch(initializeInventory()).unwrap();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadData();
  }, [dispatch]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsSimple />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/categories" element={<CategoriesFixed />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/categories/:id/edit" element={<EditCategory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:productId" element={<InventoryDetail />} />
          <Route path="/inventory/:productId/edit" element={<EditInventory />} />
          <Route path="/inventory/add" element={<AddInventory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/prices" element={<PriceBoard />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/sales" element={<SalesManagement />} />
          <Route path="/finance" element={<FinanceManagement />} />
        </Routes>
      </Box>
    </Layout>
  );
}

export default App; 