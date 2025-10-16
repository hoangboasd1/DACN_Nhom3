import { NextResponse } from 'next/server';

// Mock products data
const products = {
  tops: [
    {
      id: 1,
      name: "Áo Thun Basic",
      description: "Áo thun cotton 100% form regular fit",
      price: 199000,
      imageUrl: "/images/products/basic-tee.jpg",
      slug: "ao-thun-basic",
      brand: "Local Brand",
      rating: 4.5,
      createdAt: "2024-03-20",
      category: {
        id: 1,
        name: "Áo",
        slug: "tops"
      }
    },
    {
      id: 2,
      name: "Áo Sơ Mi Trắng",
      description: "Áo sơ mi trắng chất liệu lụa cao cấp",
      price: 450000,
      imageUrl: "/images/products/white-shirt.jpg",
      slug: "ao-so-mi-trang",
      brand: "Premium",
      rating: 4.8,
      createdAt: "2024-03-19",
      category: {
        id: 1,
        name: "Áo",
        slug: "tops"
      }
    }
  ],
  bottoms: [
    {
      id: 3,
      name: "Quần Jean Slim Fit",
      description: "Quần jean nam form slim fit",
      price: 550000,
      imageUrl: "/images/products/slim-jeans.jpg",
      slug: "quan-jean-slim-fit",
      brand: "Denim",
      rating: 4.6,
      createdAt: "2024-03-18",
      category: {
        id: 2,
        name: "Quần",
        slug: "bottoms"
      }
    }
  ],
  dresses: [
    {
      id: 4,
      name: "Đầm Suông Dự Tiệc",
      description: "Đầm suông dự tiệc thiết kế sang trọng",
      price: 850000,
      imageUrl: "/images/products/party-dress.jpg",
      slug: "dam-suong-du-tiec",
      brand: "Luxury",
      rating: 4.9,
      createdAt: "2024-03-17",
      category: {
        id: 3,
        name: "Đầm",
        slug: "dresses"
      }
    }
  ],
  sportswear: [
    {
      id: 5,
      name: "Bộ Thể Thao Nam",
      description: "Bộ quần áo thể thao nam chất liệu thun lạnh",
      price: 399000,
      imageUrl: "/images/products/sports-set.jpg",
      slug: "bo-the-thao-nam",
      brand: "Sport",
      rating: 4.7,
      createdAt: "2024-03-16"
    }
  ],
  accessories: [
    {
      id: 6,
      name: "Túi Xách Nữ",
      description: "Túi xách nữ thiết kế hiện đại",
      price: 299000,
      imageUrl: "/images/products/handbag.jpg",
      slug: "tui-xach-nu",
      brand: "Fashion",
      rating: 4.4,
      createdAt: "2024-03-15"
    }
  ],
  collections: [
    {
      id: 7,
      name: "Set Áo Quần Mùa Hè",
      description: "Bộ sưu tập mùa hè năng động",
      price: 699000,
      imageUrl: "/images/products/summer-set.jpg",
      slug: "set-ao-quan-mua-he",
      brand: "Summer",
      rating: 4.8,
      createdAt: "2024-03-14"
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const categoryProducts = products[params.slug as keyof typeof products] || [];
    
    return NextResponse.json(categoryProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 