import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  Category,
  Assessment,
  Settings,
  Notifications,
  AccountCircle,
  Diamond,
  TrendingUp,
  Calculate,
  AccountBalance,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
  { text: 'داشبورد', icon: <Dashboard />, path: '/dashboard' },
  { text: 'تابلوی قیمت‌ها', icon: <TrendingUp />, path: '/prices' },
  { text: 'محاسبه‌گر طلا', icon: <Calculate />, path: '/calculator' },
  { text: 'مدیریت خرید و فروش', icon: <Diamond />, path: '/sales' },
  { text: 'امور مالی', icon: <AccountBalance />, path: '/finance' },
  { text: 'محصولات', icon: <Inventory />, path: '/products' },
  { text: 'دسته‌بندی‌ها', icon: <Category />, path: '/categories' },
  { text: 'موجودی', icon: <Assessment />, path: '/inventory' },
  { text: 'تنظیمات', icon: <Settings />, path: '/settings' },
];

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
        <Diamond sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          طلا و جواهر
        </Typography>
        <Typography variant="body2" color="text.secondary">
          سیستم مدیریت
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          وضعیت سیستم
        </Typography>
        <Chip 
          label="آنلاین" 
          color="success" 
          size="small" 
          sx={{ mr: 1 }} 
        />
        <Chip 
          label="نسخه 1.0.0" 
          variant="outlined" 
          size="small" 
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mr: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo in center */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Diamond sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#d4af37',
                fontFamily: 'Vazirmatn, sans-serif',
              }}
            >
              فروشگاه طلا و جواهرات
            </Typography>
          </Box>
          
          {/* User icons on the left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#fafafa',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#fafafa',
              borderLeft: '1px solid #e0e0e0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 9, // Reduced margin for single header
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 