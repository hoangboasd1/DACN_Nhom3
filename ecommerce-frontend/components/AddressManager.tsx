'use client';

import React, { useState, useEffect } from 'react';
import { fetchUserAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/app/services/api';
import AddressSelector from './AddressSelector';

interface Address {
  id: number;
  userId: number;
  addressText: string;
  createdAt: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  className?: string;
}

export default function AddressManager({ className = '' }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetchUserAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách địa chỉ:', error);
      setMessage('❌ Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (fullAddress: string, addressDetails: any) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ Bạn cần đăng nhập để lưu địa chỉ');
        return;
      }

      if (editingAddress) {
        // Cập nhật địa chỉ
        await updateAddress(editingAddress.id, {
          addressText: fullAddress,
          isDefault: editingAddress.isDefault
        });
        setMessage('✅ Cập nhật địa chỉ thành công!');
        setEditingAddress(null);
      } else {
        // Tạo địa chỉ mới
        await createAddress({
          addressText: fullAddress,
          isDefault: addresses.length === 0 // Địa chỉ đầu tiên sẽ là mặc định
        });
        setMessage('✅ Thêm địa chỉ thành công!');
        setShowAddForm(false);
      }
      loadAddresses();
    } catch (error: any) {
      console.error('Lỗi khi lưu địa chỉ:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setMessage('❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response.status === 404) {
          setMessage('❌ Không tìm thấy API endpoint. Vui lòng kiểm tra kết nối.');
        } else {
          setMessage(`❌ Lỗi server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setMessage('❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setMessage('❌ Lỗi không xác định: ' + error.message);
      }
    }
  };

  const handleCancelAddress = () => {
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    
    try {
      await deleteAddress(id);
      setMessage('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      setMessage('❌ Lỗi khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      setMessage('✅ Đặt địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      setMessage('❌ Lỗi khi đặt địa chỉ mặc định');
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(false);
  };

  // Hàm parse địa chỉ để tách thành các thành phần
  const parseAddress = (addressText: string) => {

    const parts = addressText.split(',').map(part => part.trim());
    
    if (parts.length >= 4) {
      return {
        detailAddress: parts[0], 
        ward: parts[1],        
        district: parts[2],      
        province: parts[3]       
      };
    }
    
    // Fallback nếu không parse được
    return {
      detailAddress: addressText,
      ward: '',
      district: '',
      province: ''
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">📍 Quản lý địa chỉ</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Thêm địa chỉ
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Danh sách địa chỉ */}
      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có địa chỉ nào</p>
          <p className="text-sm">Nhấn "Thêm địa chỉ" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className={`p-4 border rounded-lg ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{address.addressText}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tạo lúc: {new Date(address.createdAt).toLocaleString('vi-VN')}
                  </p>
                  {address.isDefault && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Địa chỉ mặc định
                    </span>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(address)}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form thêm/sửa địa chỉ */}
      {(showAddForm || editingAddress) && (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            {editingAddress ? ' Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h4>
          
          <AddressSelector
            onSave={handleSaveAddress}
            onCancel={handleCancelAddress}
            initialAddress={editingAddress ? editingAddress.addressText : undefined}
            className="mb-4"
          />
        </div>
      )}
    </div>
  );
}
