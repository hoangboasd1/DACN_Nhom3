import axios from 'axios';

// API service để lấy thông tin địa chỉ Việt Nam
const VIETNAM_API = axios.create({
  baseURL: "https://provinces.open-api.vn/api"
});

// Interface cho các loại địa chỉ
export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  district_code: string;
}

// Lấy danh sách tỉnh/thành phố
export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const response = await VIETNAM_API.get('/p/');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tỉnh:', error);
    throw error;
  }
};

// Lấy danh sách quận/huyện theo mã tỉnh
export const fetchDistricts = async (provinceCode: string): Promise<District[]> => {
  try {
    const response = await VIETNAM_API.get(`/p/${provinceCode}?depth=2`);
    return response.data.districts || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quận/huyện:', error);
    throw error;
  }
};

// Lấy danh sách phường/xã theo mã quận/huyện
export const fetchWards = async (districtCode: string): Promise<Ward[]> => {
  try {
    const response = await VIETNAM_API.get(`/d/${districtCode}?depth=2`);
    return response.data.wards || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phường/xã:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết địa chỉ từ mã
export const getAddressDetails = async (provinceCode?: string, districtCode?: string, wardCode?: string) => {
  try {
    let province = null;
    let district = null;
    let ward = null;

    if (provinceCode) {
      const provinceResponse = await VIETNAM_API.get(`/p/${provinceCode}`);
      province = provinceResponse.data;
    }

    if (districtCode) {
      const districtResponse = await VIETNAM_API.get(`/d/${districtCode}`);
      district = districtResponse.data;
    }

    if (wardCode) {
      const wardResponse = await VIETNAM_API.get(`/w/${wardCode}`);
      ward = wardResponse.data;
    }

    return { province, district, ward };
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết địa chỉ:', error);
    throw error;
  }
};

// Format địa chỉ đầy đủ
export const formatFullAddress = (province?: any, district?: any, ward?: any, detailAddress?: string) => {
  const parts = [];
  
  if (detailAddress) parts.push(detailAddress);
  if (ward?.name) parts.push(ward.name);
  if (district?.name) parts.push(district.name);
  if (province?.name) parts.push(province.name);
  
  return parts.join(', ');
};

export default VIETNAM_API;
