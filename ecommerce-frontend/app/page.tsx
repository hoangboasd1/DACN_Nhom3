import React from 'react';
import Header from '@/components/layout/Header';
import HeroBanner from '@/components/home/HeroBanner';
import Services from '@/components/home/Services';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WeeklyBestSell from '@/components/home/NewProduct';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroBanner />
      <Services />
      <FeaturedProducts />
      <WeeklyBestSell />
      <Footer />
    </main>
  );
}
