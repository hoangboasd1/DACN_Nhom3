'use client';
import { logout } from '@/app/services/api';
import { useRouter } from 'next/navigation';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleHomeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const confirmLogout = window.confirm('Bạn có chắc muốn đăng xuất và quay về Trang chủ không?');
    if (confirmLogout) {
      logout();
      router.push('/'); // Điều hướng về trang chủ
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#f59e0b', // màu vàng giống homepage
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🛒 LazyShop Admin
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FaHome />}
            onClick={handleHomeClick}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isMobile ? 'Trang chủ' : 'Về trang chủ'}
          </Button>
          
          <IconButton
            onClick={handleHomeClick}
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'error.dark',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            title="Đăng xuất"
          >
            <FaSignOutAlt />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
