'use client';

import React, { useState, useEffect } from 'react';
import { fetchProvinces, fetchDistricts, fetchWards, formatFullAddress, Province, District, Ward } from '@/services/vietnamAddressService';

interface AddressSelectorProps {
  onSave: (fullAddress: string, addressDetails: any) => void;
  onCancel: () => void;
  initialAddress?: string;
  className?: string;
}

export default function AddressSelector({ onSave, onCancel, initialAddress, className = '' }: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false
  });

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Parse và điền thông tin từ initialAddress
  useEffect(() => {
    if (initialAddress && provinces.length > 0) {
      parseAndFillAddress(initialAddress);
    }
  }, [initialAddress, provinces]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict('');
      setSelectedWard('');
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  // Get current full address for preview
  const getCurrentFullAddress = () => {
    const parts = [];
    
    // Thêm địa chỉ chi tiết nếu có
    if (detailAddress.trim()) {
      parts.push(detailAddress.trim());
    }
    
    // Debug: Log để kiểm tra
    console.log('Debug AddressSelector:', {
      selectedProvince,
      selectedDistrict, 
      selectedWard,
      detailAddress,
      provinces: provinces.length,
      districts: districts.length,
      wards: wards.length
    });
    
    // Thêm phường/xã nếu đã chọn
    if (selectedWard) {
      const ward = wards.find(w => w.code === selectedWard);
      console.log('Found ward:', ward);
      if (ward && ward.name) {
        parts.push(ward.name);
      } else {
        // Fallback: sử dụng text từ dropdown nếu không tìm thấy object
        const wardOption = document.querySelector(`select[name="ward"] option[value="${selectedWard}"]`);
        if (wardOption) {
          parts.push(wardOption.textContent || selectedWard);
        }
      }
    }
    
    // Thêm quận/huyện nếu đã chọn
    if (selectedDistrict) {
      const district = districts.find(d => d.code === selectedDistrict);
      console.log('Found district:', district);
      if (district && district.name) {
        parts.push(district.name);
      } else {
        // Fallback: sử dụng text từ dropdown nếu không tìm thấy object
        const districtOption = document.querySelector(`select[name="district"] option[value="${selectedDistrict}"]`);
        if (districtOption) {
          parts.push(districtOption.textContent || selectedDistrict);
        }
      }
    }
    
    // Thêm tỉnh/thành phố nếu đã chọn
    if (selectedProvince) {
      const province = provinces.find(p => p.code === selectedProvince);
      console.log('Found province:', province);
      if (province && province.name) {
        parts.push(province.name);
      } else {
        // Fallback: sử dụng text từ dropdown nếu không tìm thấy object
        const provinceOption = document.querySelector(`select[name="province"] option[value="${selectedProvince}"]`);
        if (provinceOption) {
          parts.push(provinceOption.textContent || selectedProvince);
        }
      }
    }
    
    const result = parts.join(', ');
    console.log('Final address:', result);
    return result;
  };

  // Check if we have any address information
  const hasAnyAddressInfo = () => {
    return detailAddress.trim() || selectedProvince || selectedDistrict || selectedWard;
  };

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const data = await fetchProvinces();
      console.log('Loaded provinces:', data);
      setProvinces(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tỉnh:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const data = await fetchDistricts(provinceCode);
      console.log('Loaded districts for province', provinceCode, ':', data);
      setDistricts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách quận/huyện:', error);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadWards = async (districtCode: string) => {
    setLoading(prev => ({ ...prev, wards: true }));
    try {
      const data = await fetchWards(districtCode);
      console.log('Loaded wards for district', districtCode, ':', data);
      setWards(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phường/xã:', error);
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  // Hàm parse địa chỉ và điền vào form
  const parseAndFillAddress = async (addressText: string) => {
    try {
      // Parse địa chỉ: "123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh"
      const parts = addressText.split(',').map(part => part.trim());
      
      if (parts.length >= 4) {
        const [detail, wardName, districtName, provinceName] = parts;
        
        // Điền địa chỉ chi tiết
        setDetailAddress(detail);
        
        // Tìm và chọn tỉnh/thành phố
        const province = provinces.find(p => 
          p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
          provinceName.toLowerCase().includes(p.name.toLowerCase())
        );
        
        if (province) {
          setSelectedProvince(province.code);
          
          // Load districts và tìm quận/huyện
          const districtsData = await fetchDistricts(province.code);
          setDistricts(districtsData);
          
          const district = districtsData.find(d => 
            d.name.toLowerCase().includes(districtName.toLowerCase()) ||
            districtName.toLowerCase().includes(d.name.toLowerCase())
          );
          
          if (district) {
            setSelectedDistrict(district.code);
            
            // Load wards và tìm phường/xã
            const wardsData = await fetchWards(district.code);
            setWards(wardsData);
            
            const ward = wardsData.find(w => 
              w.name.toLowerCase().includes(wardName.toLowerCase()) ||
              wardName.toLowerCase().includes(w.name.toLowerCase())
            );
            
            if (ward) {
              setSelectedWard(ward.code);
            }
          }
        }
      } else {
        // Nếu không parse được, chỉ điền vào detail address
        setDetailAddress(addressText);
      }
    } catch (error) {
      console.error('Lỗi khi parse địa chỉ:', error);
      // Fallback: điền toàn bộ vào detail address
      setDetailAddress(addressText);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailAddress(e.target.value);
  };

  const handleSave = () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert('Vui lòng chọn đầy đủ tỉnh, huyện và xã');
      return;
    }

    // Lấy địa chỉ đầy đủ
    const fullAddress = getCurrentFullAddress();
    
    if (!fullAddress) {
      alert('Không thể tạo địa chỉ. Vui lòng thử lại.');
      return;
    }

    // Tìm thông tin chi tiết
    const province = provinces.find(p => p.code === selectedProvince);
    const district = districts.find(d => d.code === selectedDistrict);
    const ward = wards.find(w => w.code === selectedWard);
    
    console.log('Saving address:', {
      fullAddress,
      province,
      district,
      ward,
      detailAddress
    });
    
    // Gọi hàm lưu từ parent component
    onSave(fullAddress, {
      province,
      district,
      ward,
      detailAddress,
      provinceCode: selectedProvince,
      districtCode: selectedDistrict,
      wardCode: selectedWard
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Địa chỉ chi tiết */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ chi tiết (Số nhà, tên đường)
        </label>
        <input
          type="text"
          value={detailAddress}
          onChange={handleDetailAddressChange}
          placeholder="Ví dụ: 123 Đường ABC"
          className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
        />
      </div>

      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố *
        </label>
        <select
          name="province"
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
          required
        >
          <option value="">-- Chọn tỉnh/thành phố --</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
        {loading.provinces && (
          <p className="text-sm text-gray-500 mt-1">Đang tải...</p>
        )}
      </div>

      {/* Quận/Huyện */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện *
        </label>
        <select
          name="district"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
          disabled={!selectedProvince}
          required
        >
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
        {loading.districts && (
          <p className="text-sm text-gray-500 mt-1">Đang tải...</p>
        )}
      </div>

      {/* Phường/Xã */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phường/Xã *
        </label>
        <select
          name="ward"
          value={selectedWard}
          onChange={handleWardChange}
          className="p-2 w-full border border-gray-400 rounded bg-white text-gray-800"
          disabled={!selectedDistrict}
          required
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>
        {loading.wards && (
          <p className="text-sm text-gray-500 mt-1">Đang tải...</p>
        )}
      </div>

      {/* Hiển thị địa chỉ đầy đủ */}
      {hasAnyAddressInfo() && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Địa chỉ hiện tại:</p>
          <p className="text-sm text-blue-700 mt-1">
            {getCurrentFullAddress() || 'Chưa có thông tin địa chỉ'}
          </p>
          {(!selectedProvince || !selectedDistrict || !selectedWard) && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Vui lòng chọn đầy đủ tỉnh, huyện và xã để hoàn thành địa chỉ
            </p>
          )}
        </div>
      )}

      {/* Nút lưu và hủy */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedProvince || !selectedDistrict || !selectedWard}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          💾 Lưu địa chỉ
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          ❌ Hủy
        </button>
      </div>
    </div>
  );
}
