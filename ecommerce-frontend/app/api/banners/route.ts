import { NextResponse } from 'next/server';
import type { Banner } from '@/types';

const banners: Banner[] = [
  {
    id: 1,
    title: 'Big patterns are back in fashion',
    subtitle: 'New season',
    buttonText: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1512331455279-c8ae8178f586?q=80&w=1000&auto=format&fit=crop',
    link: '/collection/patterns',
    size: 'large'
  },
  {
    id: 2,
    title: 'The Latest trend',
    subtitle: 'New season',
    buttonText: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop',
    link: '/collection/latest',
    size: 'small'
  },
  {
    id: 3,
    title: 'Top new collection',
    subtitle: 'New season',
    buttonText: 'SHOP NOW',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
    link: '/collection/new',
    size: 'small'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Banners fetched successfully',
      data: banners
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch banners',
        data: null
      },
      { status: 500 }
    );
  }
} 