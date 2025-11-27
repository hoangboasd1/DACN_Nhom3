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

export interface Material {
  id: number;
  name: string;
  description?: string;
}

export interface ClothingType {
  id: number;
  name: string;
  description?: string;
}

export interface ProductMaterial {
  id: number;
  productId: number;
  materialId: number;
  material: Material;
  percentage?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  instock: number;
  imageUrl: string;
  gender?: string;
  categoryId: number;
  category?: Category;
  clothingTypeId?: number;
  clothingType?: ClothingType;
  productMaterials?: ProductMaterial[];
  rating?: number;
  discountPrice?: number;
  createdAt?: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
} 