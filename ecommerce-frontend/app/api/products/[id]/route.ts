import { NextResponse } from 'next/server';
import { fetchProductById } from '@/app/services/api';

// Mock product data
const products = {
  'ao-thun-basic': {
    id: 1,
    name: "Áo Thun Basic",
    slug: "ao-thun-basic",
    description: "Áo thun cotton 100% form regular fit, phù hợp với mọi dáng người. Thiết kế basic dễ phối đồ, phù hợp với nhiều phong cách khác nhau.",
    price: 199000,
    discountPrice: 149000,
    brand: "Local Brand",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isPrimary: true
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isPrimary: false
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Trắng",
        stock: 10
      },
      {
        id: 2,
        size: "M",
        color: "Trắng",
        stock: 15
      },
      {
        id: 3,
        size: "L",
        color: "Trắng",
        stock: 20
      },
      {
        id: 4,
        size: "S",
        color: "Đen",
        stock: 12
      },
      {
        id: 5,
        size: "M",
        color: "Đen",
        stock: 18
      },
      {
        id: 6,
        size: "L",
        color: "Đen",
        stock: 22
      }
    ],
    specifications: {
      material: "100% cotton",
      origin: "Việt Nam",
      style: "Basic, Casual",
      washingGuide: "Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy, ủi ở nhiệt độ thấp"
    },
    rating: 4.5,
    reviews: [
      {
        id: 1,
        userName: "Nguyễn Văn A",
        rating: 5,
        comment: "Chất lượng sản phẩm tốt, form áo đẹp, đúng size.",
        createdAt: "2024-03-15",
        images: ["/images/reviews/review-1.jpg"]
      },
      {
        id: 2,
        userName: "Trần Thị B",
        rating: 4,
        comment: "Áo đẹp, chất vải mềm, thoáng mát.",
        createdAt: "2024-03-14"
      }
    ],
    relatedProducts: [
      {
        id: 2,
        name: "Áo Polo Basic",
        slug: "ao-polo-basic",
        price: 299000,
        imageUrl: "/images/products/polo-1.jpg"
      },
      {
        id: 3,
        name: "Áo Thun Graphic",
        slug: "ao-thun-graphic",
        price: 249000,
        imageUrl: "/images/products/graphic-tee-1.jpg"
      }
    ]
  },
  'ao-polo-basic': {
    id: 2,
    name: "Áo Polo Basic",
    slug: "ao-polo-basic",
    description: "Áo polo cotton cao cấp, thiết kế basic thanh lịch, phù hợp mọi hoàn cảnh từ đi làm đến đi chơi.",
    price: 299000,
    brand: "Local Brand",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "/images/products/polo-1.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "/images/products/polo-2.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "M",
        color: "Xanh navy",
        stock: 20
      },
      {
        id: 2,
        size: "L",
        color: "Xanh navy",
        stock: 15
      },
      {
        id: 3,
        size: "M",
        color: "Trắng",
        stock: 18
      },
      {
        id: 4,
        size: "L",
        color: "Trắng",
        stock: 12
      }
    ],
    specifications: {
      material: "100% cotton",
      origin: "Việt Nam",
      style: "Basic, Smart Casual",
      washingGuide: "Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy"
    },
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Lê Văn C",
        rating: 5,
        comment: "Chất vải tốt, form áo đẹp.",
        createdAt: "2024-03-16"
      }
    ],
    relatedProducts: [
      {
        id: 1,
        name: "Áo Thun Basic",
        slug: "ao-thun-basic",
        price: 199000,
        imageUrl: "/images/products/basic-tee-1.jpg"
      }
    ]
  },
  'ao-so-mi-trang': {
    id: 3,
    name: "Áo Sơ Mi Trắng",
    slug: "ao-so-mi-trang",
    description: "Áo sơ mi trắng chất liệu lụa cao cấp, form regular fit. Thiết kế thanh lịch, phù hợp cho công sở và các dịp trang trọng.",
    price: 450000,
    brand: "Premium",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "/images/products/white-shirt-1.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "/images/products/white-shirt-2.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Trắng",
        stock: 8
      },
      {
        id: 2,
        size: "M",
        color: "Trắng",
        stock: 12
      },
      {
        id: 3,
        size: "L",
        color: "Trắng",
        stock: 10
      }
    ],
    specifications: {
      material: "60% cotton, 40% lụa",
      origin: "Việt Nam",
      style: "Smart Casual, Office",
      washingGuide: "Giặt tay hoặc giặt máy nhẹ nhàng, ủi nhiệt độ trung bình"
    },
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Phạm Thị D",
        rating: 5,
        comment: "Chất vải đẹp, form áo vừa vặn, rất hài lòng.",
        createdAt: "2024-03-19"
      }
    ],
    relatedProducts: [
      {
        id: 1,
        name: "Áo Thun Basic",
        slug: "ao-thun-basic",
        price: 199000,
        imageUrl: "/images/products/basic-tee-1.jpg"
      },
      {
        id: 2,
        name: "Áo Polo Basic",
        slug: "ao-polo-basic",
        price: 299000,
        imageUrl: "/images/products/polo-1.jpg"
      }
    ]
  },
  'ao-thun-graphic': {
    id: 4,
    name: "Áo Thun Graphic",
    slug: "ao-thun-graphic",
    description: "Áo thun với họa tiết graphic độc đáo, chất liệu cotton 100% thoáng mát. Thiết kế trẻ trung, năng động phù hợp với nhiều phong cách.",
    price: 249000,
    brand: "Local Brand",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "/images/products/graphic-tee-1.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "/images/products/graphic-tee-2.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "M",
        color: "Đen",
        stock: 15
      },
      {
        id: 2,
        size: "L",
        color: "Đen",
        stock: 10
      }
    ],
    specifications: {
      material: "100% cotton",
      origin: "Việt Nam",
      style: "Casual, Street Style",
      washingGuide: "Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy"
    },
    rating: 4.6,
    reviews: [
      {
        id: 1,
        userName: "Nguyễn Văn E",
        rating: 5,
        comment: "Áo đẹp, hình in sắc nét.",
        createdAt: "2024-03-18"
      }
    ],
    relatedProducts: [
      {
        id: 1,
        name: "Áo Thun Basic",
        slug: "ao-thun-basic",
        price: 199000,
        imageUrl: "/images/products/basic-tee-1.jpg"
      }
    ]
  },
  'ao-khoac-denim': {
    id: 5,
    name: "Áo Khoác Denim",
    slug: "ao-khoac-denim",
    description: "Áo khoác denim cao cấp, thiết kế hiện đại với các chi tiết wash độc đáo. Phù hợp cho cả nam và nữ.",
    price: 699000,
    brand: "Denim",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "/images/products/denim-jacket-1.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "/images/products/denim-jacket-2.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "M",
        color: "Xanh đậm",
        stock: 8
      },
      {
        id: 2,
        size: "L",
        color: "Xanh đậm",
        stock: 12
      }
    ],
    specifications: {
      material: "100% cotton denim",
      origin: "Việt Nam",
      style: "Casual, Street Style",
      washingGuide: "Giặt máy với nước lạnh, không dùng thuốc tẩy"
    },
    rating: 4.7,
    reviews: [
      {
        id: 1,
        userName: "Trần Văn F",
        rating: 5,
        comment: "Chất vải denim đẹp, form áo chuẩn.",
        createdAt: "2024-03-17"
      }
    ],
    relatedProducts: [
      {
        id: 1,
        name: "Áo Thun Basic",
        slug: "ao-thun-basic",
        price: 199000,
        imageUrl: "/images/products/basic-tee-1.jpg"
      }
    ]
  },
  'ao-len-co-lo': {
    id: 6,
    name: "Áo Len Cổ Lọ",
    slug: "ao-len-co-lo",
    description: "Áo len cổ lọ chất liệu len mềm mại, giữ ấm tốt. Thiết kế basic dễ phối đồ, phù hợp cho mùa thu đông.",
    price: 459000,
    brand: "Winter",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "/images/products/turtleneck-1.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "/images/products/turtleneck-2.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "M",
        color: "Be",
        stock: 10
      },
      {
        id: 2,
        size: "L",
        color: "Be",
        stock: 15
      }
    ],
    specifications: {
      material: "80% len, 20% polyester",
      origin: "Việt Nam",
      style: "Basic, Winter",
      washingGuide: "Giặt tay với nước lạnh, phơi phẳng"
    },
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Lê Thị G",
        rating: 5,
        comment: "Áo len mềm, giữ ấm tốt.",
        createdAt: "2024-03-16"
      }
    ],
    relatedProducts: [
      {
        id: 1,
        name: "Áo Thun Basic",
        slug: "ao-thun-basic",
        price: 199000,
        imageUrl: "/images/products/basic-tee-1.jpg"
      }
    ]
  },
  'ao-so-mi-lua-dai-tay': {
    id: 7,
    name: "Áo Sơ Mi Lụa Dài Tay",
    slug: "ao-so-mi-lua-dai-tay",
    description: "Áo sơ mi lụa cao cấp, form suông thanh lịch. Chất liệu lụa mềm mại, thoáng mát, phù hợp cho công sở và các dịp quan trọng.",
    price: 550000,
    brand: "Premium",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "https://product.hstatic.net/1000392567/product/z4035492140152_d9a1a69cf9ed33e5f7108fb1eef3a85b_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg",
        isPrimary: true
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Trắng",
        stock: 10
      },
      {
        id: 2,
        size: "M",
        color: "Trắng",
        stock: 15
      }
    ],
    specifications: {
      material: "100% lụa cao cấp",
      origin: "Việt Nam",
      style: "Công sở, Thanh lịch",
      washingGuide: "Giặt tay, không ngâm, ủi nhiệt độ thấp"
    },
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Nguyễn Thị H",
        rating: 5,
        comment: "Chất vải đẹp, form áo thanh lịch.",
        createdAt: "2024-03-20"
      }
    ],
    relatedProducts: [
      {
        id: 2,
        name: "Áo Sơ Mi Trắng",
        slug: "ao-so-mi-trang",
        price: 450000,
        imageUrl: "/images/products/white-shirt-1.jpg"
      }
    ]
  },
  'ao-khoac-bomber-nu': {
    id: 8,
    name: "Áo Khoác Bomber Nữ",
    slug: "ao-khoac-bomber-nu",
    description: "Áo khoác bomber thiết kế hiện đại, chất liệu chống nắng, chống gió tốt. Phù hợp cho mùa thu đông và những ngày se lạnh.",
    price: 750000,
    brand: "Premium",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isPrimary: true
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isPrimary: false
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Đen",
        stock: 8
      },
      {
        id: 2,
        size: "M",
        color: "Đen",
        stock: 12
      },
      {
        id: 3,
        size: "L",
        color: "Đen",
        stock: 10
      },
      {
        id: 4,
        size: "S",
        color: "Xanh Navy",
        stock: 6
      },
      {
        id: 5,
        size: "M",
        color: "Xanh Navy",
        stock: 10
      },
      {
        id: 6,
        size: "L",
        color: "Xanh Navy",
        stock: 8
      }
    ],
    specifications: {
      material: "Polyester, Cotton",
      origin: "Việt Nam",
      style: "Casual, Streetwear",
      washingGuide: "Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy, ủi ở nhiệt độ thấp"
    },
    rating: 4.7,
    reviews: [
      {
        id: 1,
        userName: "Nguyễn Thị D",
        rating: 5,
        comment: "Áo đẹp, chất liệu tốt, form chuẩn.",
        createdAt: "2024-03-18"
      },
      {
        id: 2,
        userName: "Trần Văn E",
        rating: 4.5,
        comment: "Áo ấm, chống gió tốt, rất hài lòng.",
        createdAt: "2024-03-17"
      }
    ],
    relatedProducts: [
      {
        id: 9,
        name: "Áo Khoác Denim",
        slug: "ao-khoac-denim",
        price: 699000,
        imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 10,
        name: "Áo Blazer Dáng Suông",
        slug: "ao-blazer-dang-suong",
        price: 850000,
        imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  'dam-suong-cong-so': {
    id: 9,
    name: "Đầm Suông Công Sở",
    slug: "dam-suong-cong-so",
    description: "Đầm suông thiết kế thanh lịch, kín đáo phù hợp môi trường công sở. Chất liệu thoáng mát, ít nhăn.",
    price: 650000,
    brand: "Office",
    category: {
      id: 3,
      name: "Đầm",
      slug: "dresses"
    },
    images: [
      {
        id: 1,
        url: "https://product.hstatic.net/1000392567/product/z4035492140154_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg",
        isPrimary: true
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Xanh đen",
        stock: 10
      },
      {
        id: 2,
        size: "M",
        color: "Xanh đen",
        stock: 15
      }
    ],
    specifications: {
      material: "Polyester cao cấp",
      origin: "Việt Nam",
      style: "Công sở, Thanh lịch",
      washingGuide: "Giặt máy nhẹ, ủi nhiệt độ thấp"
    },
    rating: 4.9,
    reviews: [
      {
        id: 1,
        userName: "Phạm Thị K",
        rating: 5,
        comment: "Đầm đẹp, form chuẩn, rất hài lòng.",
        createdAt: "2024-03-18"
      }
    ],
    relatedProducts: [
      {
        id: 4,
        name: "Đầm Suông Dự Tiệc",
        slug: "dam-suong-du-tiec",
        price: 850000,
        imageUrl: "/images/products/party-dress.jpg"
      }
    ]
  },
  'set-ao-vest-quan-au': {
    id: 10,
    name: "Set Áo Vest & Quần Âu",
    slug: "set-ao-vest-quan-au",
    description: "Bộ vest công sở cao cấp, thiết kế hiện đại, thanh lịch. Chất liệu vải cao cấp, form dáng chuẩn, phù hợp cho các dịp quan trọng và môi trường công sở.",
    price: 1250000,
    brand: "Premium",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "https://product.hstatic.net/1000392567/product/z4035492140155_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg",
        isPrimary: true
      },
      {
        id: 2,
        url: "https://product.hstatic.net/1000392567/product/z4035492140155_2_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg",
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Đen",
        stock: 5
      },
      {
        id: 2,
        size: "M",
        color: "Đen",
        stock: 8
      },
      {
        id: 3,
        size: "L",
        color: "Đen",
        stock: 6
      },
      {
        id: 4,
        size: "S",
        color: "Xám đậm",
        stock: 4
      },
      {
        id: 5,
        size: "M",
        color: "Xám đậm",
        stock: 7
      },
      {
        id: 6,
        size: "L",
        color: "Xám đậm",
        stock: 5
      }
    ],
    specifications: {
      material: "65% polyester, 35% viscose",
      origin: "Việt Nam",
      style: "Công sở, Thanh lịch",
      washingGuide: "Giặt khô, không giặt máy, ủi nhiệt độ thấp"
    },
    rating: 4.9,
    reviews: [
      {
        id: 1,
        userName: "Trần Văn M",
        rating: 5,
        comment: "Chất vải đẹp, form dáng chuẩn, rất hài lòng với sản phẩm.",
        createdAt: "2024-03-15"
      },
      {
        id: 2,
        userName: "Nguyễn Thị N",
        rating: 5,
        comment: "Set đồ rất sang trọng, phù hợp với công việc văn phòng.",
        createdAt: "2024-03-14"
      },
      {
        id: 3,
        userName: "Lê Văn P",
        rating: 4.5,
        comment: "Chất lượng tốt, giao hàng nhanh, đóng gói cẩn thận.",
        createdAt: "2024-03-13"
      }
    ],
    relatedProducts: [
      {
        id: 7,
        name: "Áo Sơ Mi Lụa Dài Tay",
        slug: "ao-so-mi-lua-dai-tay",
        price: 550000,
        imageUrl: "https://product.hstatic.net/1000392567/product/z4035492140152_d9a1a69cf9ed33e5f7108fb1eef3a85b_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg"
      },
      {
        id: 8,
        name: "Áo Blazer Dáng Suông",
        slug: "ao-blazer-dang-suong",
        price: 850000,
        imageUrl: "https://product.hstatic.net/1000392567/product/z4035492140156_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg"
      }
    ]
  },
  'ao-blazer-dang-suong': {
    id: 11,
    name: "Áo Blazer Dáng Suông",
    slug: "ao-blazer-dang-suong",
    description: "Áo blazer dáng suông thanh lịch, thiết kế hiện đại. Chất liệu vải cao cấp, form dáng thoải mái, phù hợp cho công sở và các buổi gặp mặt quan trọng.",
    price: 850000,
    brand: "Premium",
    category: {
      id: 1,
      name: "Áo",
      slug: "tops"
    },
    images: [
      {
        id: 1,
        url: "https://product.hstatic.net/1000392567/product/z4035492140156_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg",
        isPrimary: true
      }
    ],
    variants: [
      {
        id: 1,
        size: "S",
        color: "Be",
        stock: 8
      },
      {
        id: 2,
        size: "M",
        color: "Be",
        stock: 12
      },
      {
        id: 3,
        size: "L",
        color: "Be",
        stock: 10
      }
    ],
    specifications: {
      material: "70% polyester, 30% cotton",
      origin: "Việt Nam",
      style: "Công sở, Thanh lịch",
      washingGuide: "Giặt khô hoặc giặt tay nhẹ nhàng, ủi nhiệt độ thấp"
    },
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Phạm Thị Q",
        rating: 5,
        comment: "Áo đẹp, form dáng thoải mái, rất hài lòng.",
        createdAt: "2024-03-16"
      }
    ],
    relatedProducts: [
      {
        id: 10,
        name: "Set Áo Vest & Quần Âu",
        slug: "set-ao-vest-quan-au",
        price: 1250000,
        imageUrl: "https://product.hstatic.net/1000392567/product/z4035492140155_1a0c0f2e4c5e4c0a9c3b9f6c5a0b6a1a_master.jpg"
      }
    ]
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetchProductById(Number(params.id));
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 