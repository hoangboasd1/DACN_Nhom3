'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, 
    deleteProduct, fetchCategories, 
    uploadImage} from '@/app/services/api';
import Modal from '@/components/Modal';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  instock: number;
  imageUrl?: string;
  categoryId: number;
  category?: any;
  createdAt?: string;
};

type Category = {
  id: number;
  name: string;
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState<Omit<Product, 'id' | 'category' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    instock: 0,
    imageUrl: '',
    categoryId: 0,
  });

  // Load data
  useEffect(() => {
    fetchProducts().then(res => setProducts(res.data));
    fetchCategories().then(res => setCategories(res.data));
  }, []);

  // Xử lý mở form thêm mới
  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: 0, instock: 0, imageUrl: '', categoryId: categories[0]?.id || 0 });
    setModalOpen(true);
  };

  // Xử lý mở form sửa
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price,
      instock: product.instock,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
    });
    setModalOpen(true);
  };

  // Xử lý đóng form
  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  // Xử lý input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Lưu sản phẩm (thêm/sửa)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Sửa
      updateProduct(editingProduct.id, form)
        .then(() => {
          setProducts(products.map(p => (p.id === editingProduct.id ? { ...editingProduct, ...form } : p)));
          closeModal();
        });
    } else {
      // Thêm mới
      createProduct(form)
        .then(res => {
          setProducts([...products, res.data]);
          closeModal();
        });
    }
  };

  // Xóa sản phẩm
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteProduct(id).then(() => setProducts(products.filter(p => p.id !== id)));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý Sản phẩm</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={openAddModal}>
        Thêm mới sản phẩm
      </button>
      {/* Bảng danh sách sản phẩm */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow text-gray-900">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Tên sản phẩm</th>
              <th className="border p-2">Mô tả</th>
              <th className="border p-2">Giá</th>
              <th className="border p-2">Tồn kho</th>
              <th className="border p-2">Danh mục</th>
              <th className="border p-2">Ảnh</th>
              <th className="border p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-100">
                <td className="border p-2">{p.id}</td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.description}</td>
                <td className="border p-2">{p.price.toLocaleString()}</td>
                <td className="border p-2">{p.instock}</td>
                <td className="border p-2">{p.category?.name}</td>
                <td className="border p-2">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover" />}
                </td>
                <td className="border p-2 flex gap-2">
                  <button className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500" onClick={() => openEditModal(p)}>
                    Sửa
                  </button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(p.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">{editingProduct ? "Sửa sản phẩm" : "Thêm mới sản phẩm"}</h2>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tên sản phẩm"
            className="w-full border p-2"
            required
          />
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả"
            className="w-full border p-2"
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Giá"
            min={0}
            step="0.01"
            className="w-full border p-2"
            required
          />
          <input
            type="number"
            name="instock"
            value={form.instock}
            onChange={handleChange}
            placeholder="Tồn kho"
            min={0}
            className="w-full border p-2"
            required
          />
          <input
            type="file"
            accept='image/*'
            onChange = {async (e) => {
              if (e.target.files && e.target.files[0]) {
                setUploading(true);
                try{
                  const res = await uploadImage(e.target.files[0]);
                  setForm({ ...form, imageUrl: res.data.imageUrl });
                } catch (error) {
                  alert("Tải ảnh lên thất bại!");
                }
                setUploading(false);
              }
            }}
            className="w-full border p-2"
          />
          { form.imageUrl && (
            <img src={form.imageUrl} alt="Product" className="w-32 h-32 object-cover my-2" />
          )}
          { uploading && <p className='text-sm text-blue-500'>Đang tải ảnh lên...</p> }
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border p-2"
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingProduct ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
