import { NextResponse } from 'next/server';

// Mock data for fashion categories
const categories = [
  {
    id: 1,
    name: "Áo",
    description: "Áo thời trang nam nữ các loại",
    imageUrl: "/images/categories/tops.jpg",
    slug: "tops"
  },
  {
    id: 2,
    name: "Quần",
    description: "Quần jeans, kaki, short thời trang",
    imageUrl: "/images/categories/bottoms.jpg",
    slug: "bottoms"
  },
  {
    id: 3,
    name: "Đầm & Váy",
    description: "Đầm và váy thời trang nữ",
    imageUrl: "/images/categories/dresses.jpg",
    slug: "dresses"
  },
  {
    id: 4,
    name: "Đồ thể thao",
    description: "Trang phục thể thao nam nữ",
    imageUrl: "/images/categories/sportswear.jpg",
    slug: "sportswear"
  },
  {
    id: 5,
    name: "Phụ kiện",
    description: "Túi xách, nón, thắt lưng, phụ kiện thời trang",
    imageUrl: "/images/categories/accessories.jpg",
    slug: "accessories"
  },
  {
    id: 6,
    name: "Bộ sưu tập",
    description: "Các bộ sưu tập thời trang mới nhất",
    imageUrl: "/images/categories/collections.jpg",
    slug: "collections"
  }
];

export async function GET() {
  try {
    // In a real application, you would fetch this data from a database
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 