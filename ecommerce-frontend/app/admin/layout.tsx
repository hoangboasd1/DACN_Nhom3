import React from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import AdminGuard from '@/components/AdminGuard';
import { Box, Container } from '@mui/material';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          px: { xs: 2, md: 2 }, // Add horizontal padding only
          ml: { xs: 0, md: '240px' } // Add margin-left for desktop to account for fixed sidebar
        }}>
          <Navbar />
          <Container maxWidth="xl" sx={{ py: 2, flexGrow: 1, px: { xs: 1, md: 2 } }}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: 2, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              p: 3,
              minHeight: 'calc(100vh - 120px)'
            }}>
              {children}
            </Box>
          </Container>
        </Box>
      </Box>
    </AdminGuard>
  );
}