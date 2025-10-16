'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Grid, Box, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { fetchProductsByCategory } from '@/app/services/api';
import type { Product } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!params.id) {
        setError('Category ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchProductsByCategory(Number(params.id));
        if (!response.data || !response.data.length) {
          setProducts([]);
        } else {
          setProducts(response.data);
          // Lấy tên danh mục từ sản phẩm đầu tiên
          if (response.data[0]?.category?.name) {
            setCategoryName(response.data[0].category.name);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    height: 300,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                    animation: 'pulse 1.5s infinite'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h5" color="error" align="center">
            {error}
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/categories" style={{ color: '#FFB629' }}>
              Quay lại danh mục
            </Link>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" style={{ color: '#FFB629' }}>
            Trang chủ
          </Link>
          <Link href="/categories" style={{ color: '#FFB629' }}>
            Danh mục
          </Link>
          <Typography color="text.primary">{categoryName}</Typography>
        </Breadcrumbs>

        {/* Category Title */}
        <Typography variant="h4" component="h1" gutterBottom>
          {categoryName}
        </Typography>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không có sản phẩm nào trong danh mục này
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Footer />
    </>
  );
} 