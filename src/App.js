import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import './styles/persianNumbers.css';
import './styles/login.css';
import './styles/loginEnhanced.css';

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
import Login from './pages/Auth/Login';

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
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Box sx={{ p: 3 }}><ProductsSimple /></Box>} />
              <Route path="/products/add" element={<Box sx={{ p: 3 }}><AddProduct /></Box>} />
              <Route path="/products/:id" element={<Box sx={{ p: 3 }}><ProductDetail /></Box>} />
              <Route path="/products/:id/edit" element={<Box sx={{ p: 3 }}><EditProduct /></Box>} />
              <Route path="/categories" element={<Box sx={{ p: 3 }}><CategoriesFixed /></Box>} />
              <Route path="/categories/:id" element={<Box sx={{ p: 3 }}><CategoryDetail /></Box>} />
              <Route path="/categories/:id/edit" element={<Box sx={{ p: 3 }}><EditCategory /></Box>} />
              <Route path="/inventory" element={<Box sx={{ p: 3 }}><Inventory /></Box>} />
              <Route path="/inventory/:productId" element={<Box sx={{ p: 3 }}><InventoryDetail /></Box>} />
              <Route path="/inventory/:productId/edit" element={<Box sx={{ p: 3 }}><EditInventory /></Box>} />
              <Route path="/inventory/add" element={<Box sx={{ p: 3 }}><AddInventory /></Box>} />
              <Route path="/settings" element={<Box sx={{ p: 3 }}><Settings /></Box>} />
              <Route path="/prices" element={<Box sx={{ p: 3 }}><PriceBoard /></Box>} />
              <Route path="/calculator" element={<Box sx={{ p: 3 }}><Calculator /></Box>} />
              <Route path="/sales" element={<Box sx={{ p: 3 }}><SalesManagement /></Box>} />
              <Route path="/finance" element={<Box sx={{ p: 3 }}><FinanceManagement /></Box>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </>
  );
}

export default App; 