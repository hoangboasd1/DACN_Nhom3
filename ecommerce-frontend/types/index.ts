export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  link: string;
  size: 'large' | 'small';
}

export interface Category {
  id: number;
  name: string;
  image: string;
  link: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  instock: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
  rating?: number;
  discountPrice?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
} 