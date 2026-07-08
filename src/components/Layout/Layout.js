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
  Chip,
  InputBase,
  Avatar,
  Badge,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  Category,
  Assessment,
  Settings,
  Diamond,
  TrendingUp,
  Calculate,
  AccountBalance,
  Login,
  Search,
  Notifications,
  Message,
  LockOpen,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

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
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3, 
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px',
          width: 32,
          height: 32,
        }}>
          <Box sx={{ backgroundColor: '#d4af37', borderRadius: '4px' }} />
          <Box sx={{ backgroundColor: '#d4af37', borderRadius: '4px' }} />
          <Box sx={{ backgroundColor: '#d4af37', borderRadius: '4px' }} />
          <Box sx={{ backgroundColor: '#d4af37', borderRadius: '4px' }} />
        </Box>
        <Typography variant="h6" sx={{ 
          color: '#1e293b', 
          fontWeight: 700,
          fontSize: '1.25rem'
        }}>
          طلا و جواهر
        </Typography>
      </Box>
      
      {/* Navigation Menu */}
      <List sx={{ pt: 2, px: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={isSelected}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 2,
                py: 1.2,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: '#fff8e1',
                  color: '#d4af37',
                  '&:hover': {
                    backgroundColor: '#fff8e1',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#d4af37',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: isSelected ? '#d4af37' : '#64748b'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isSelected ? 600 : 500,
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Pro Section at Bottom */}
      <Box sx={{ p: 2, m: 2, backgroundColor: '#d4af37', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LockOpen sx={{ color: '#ffffff', fontSize: 32 }} />
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#ffffff', 
            textAlign: 'center',
            mb: 2,
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}
        >
          دسترسی کامل به تحلیل‌های مالی دقیق و نمودارها
        </Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#b8941f',
            color: '#ffffff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#a0851a',
            },
          }}
        >
          دریافت نسخه پرو
        </Button>
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
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: 'none',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: '#1e293b',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            داشبورد
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            mx: 4
          }}>
            <Box sx={{
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              width: '100%',
              maxWidth: 500,
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#d4af37',
                backgroundColor: '#ffffff',
              },
              '&:focus-within': {
                borderColor: '#d4af37',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
              }
            }}>
              <InputBase
                placeholder="جستجو..."
                sx={{ 
                  flex: 1, 
                  fontSize: '0.95rem',
                  '& input': {
                    textAlign: 'right'
                  }
                }}
              />
              <Search sx={{ color: '#64748b', fontSize: 22 }} />
            </Box>
          </Box>
          
          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton sx={{ 
              color: '#64748b',
              '&:hover': { backgroundColor: '#f8fafc' }
            }}>
              <Badge badgeContent={99} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton sx={{ 
              color: '#64748b',
              '&:hover': { backgroundColor: '#f8fafc' }
            }}>
              <Message />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#fff8e1',
                }
              }}
              onClick={handleMenuOpen}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: '#d4af37',
                }}
              >
                م
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  مدیر فروشگاه
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  طلا و جواهر
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={handleProfile}
          sx={{
            py: 1.5,
            px: 2,
            gap: 2,
            '&:hover': {
              backgroundColor: '#fff8e1',
            }
          }}
        >
          <ListItemIcon>
            <AccountCircle sx={{ color: '#d4af37' }} />
          </ListItemIcon>
          <ListItemText 
            primary="پروفایل من" 
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          />
        </MenuItem>
        
        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem 
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            gap: 2,
            '&:hover': {
              backgroundColor: '#fef2f2',
            }
          }}
        >
          <ListItemIcon>
            <Logout sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText 
            primary="خروج" 
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.95rem',
              color: '#ef4444'
            }}
          />
        </MenuItem>
      </Menu>
      
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
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #f1f5f9',
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
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #f1f5f9',
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
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 