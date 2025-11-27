'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  FaBoxes, 
  FaTags, 
  FaUsers, 
  FaClipboardList, 
  FaChartBar, 
  FaComments,
  FaBars,
  FaHome
} from "react-icons/fa";
import { useState } from 'react';

const menuItems = [
  { href: "/admin", icon: <FaHome />, label: "Tổng quan" },
  { href: "/admin/categories", icon: <FaTags />, label: "Nhóm sản phẩm" },
  { href: "/admin/products", icon: <FaBoxes />, label: "Sản phẩm" },
  { href: "/admin/users", icon: <FaUsers />, label: "Người dùng" },
  { href: "/admin/orders", icon: <FaClipboardList />, label: "Đơn hàng" },
  { href: "/admin/chat", icon: <FaComments />, label: "Chat hỗ trợ" },
  { href: "/admin/report", icon: <FaChartBar />, label: "Thống kê báo cáo" },
];

const drawerWidth = 240; // Giảm từ 256px xuống 240px

export default function Sidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography variant="h5" component="div" sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛠️ Admin Panel
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Quản lý hệ thống
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <ListItem key={href} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <Tooltip title={label} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  href={href}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.main' : 'action.hover',
                      transform: 'translateX(4px)',
                    },
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    '&:hover .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : 'text.secondary',
                    transition: 'all 0.2s ease-in-out',
                    minWidth: 40
                  }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} Hệ thống quản lý
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            borderRight: '1px solid #e2e8f0'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            borderRight: '1px solid #e2e8f0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile menu button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: 16, 
            left: 16, 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          <FaBars />
        </IconButton>
      )}
    </>
  );
}