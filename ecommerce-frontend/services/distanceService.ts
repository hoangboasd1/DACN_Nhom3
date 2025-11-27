// services/distanceService.ts
import { getDistance } from 'geolib';

//Đại Học Công nghiệp Hà Nội cơ sở 1
const STORE_COORDINATES = {
  latitude: 21.0285,
  longitude: 105.8542
};

const parseAddressComponents = (address: string) => {
  console.log('Phân tích địa chỉ:', address);

  const normalizedAddress = address.toLowerCase().trim();


  const houseNumberMatch = normalizedAddress.match(/(\d+)/);
  const houseNumber = houseNumberMatch ? houseNumberMatch[1] : '';

  const wardMatch = normalizedAddress.match(/(xã|phường|thị trấn)\s+([^,]+)/);
  const wardNormalized = wardMatch ? wardMatch[2].trim() : '';

  const districtMatch = normalizedAddress.match(/(quận|huyện|thị xã)\s+([^,]+)/);
  const districtNormalized = districtMatch ? districtMatch[2].trim() : '';

  const provinceMatch = normalizedAddress.match(/(thành phố|tỉnh)\s+([^,]+)/);
  const provinceNormalized = provinceMatch ? provinceMatch[2].trim() : '';

  const getOriginalName = (normalizedName: string, originalAddress: string) => {
    if (!normalizedName) return '';

    const parts = originalAddress.split(',');
    for (const part of parts) {
      const normalizedPart = part.toLowerCase().trim();

      if (normalizedPart.includes(normalizedName) &&
        (normalizedPart.includes('quận') || normalizedPart.includes('huyện') ||
          normalizedPart.includes('xã') || normalizedPart.includes('phường') ||
          normalizedPart.includes('thành phố') || normalizedPart.includes('tỉnh'))) {
        const words = part.trim().split(/\s+/);

        const startIndex = normalizedPart.indexOf(normalizedName);
        if (startIndex !== -1) {

          let charCount = 0;
          for (let i = 0; i < words.length; i++) {
            charCount += words[i].length + 1;
            if (charCount > startIndex) {

              if (words[i] === '1' || words[i] === '2' || words[i] === '3' ||
                words[i] === '4' || words[i] === '5' || words[i] === '6' ||
                words[i] === '7' || words[i] === '8' || words[i] === '9' ||
                words[i] === '10' || words[i] === '11' || words[i] === '12') {
                return words[i];
              }

              const startIdx = i > 0 ? i : 0;
              return words.slice(startIdx).join(' ');
            }
          }
        }

        return words[words.length - 1];
      }
    }
    return normalizedName;
  };

  const ward = getOriginalName(wardNormalized, address);
  const district = getOriginalName(districtNormalized, address);
  const province = getOriginalName(provinceNormalized, address);

  console.log('🔍 Debug regex matching:');
  console.log('  - houseNumberMatch:', houseNumberMatch);
  console.log('  - wardMatch:', wardMatch);
  console.log('  - districtMatch:', districtMatch);
  console.log('  - provinceMatch:', provinceMatch);
  console.log('🔍 Tên gốc (có dấu):');
  console.log('  - ward:', ward);
  console.log('  - district:', district);
  console.log('  - province:', province);

  const components = {
    original: address,
    normalized: normalizedAddress,
    houseNumber,
    ward,
    district,
    province
  };

  console.log('Thành phần địa chỉ (4 phần):', components);
  return components;
};

// Hàm geocoding với OpenStreetMap - tìm kiếm theo xã/phường
export const geocodeAddressWithOSM = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    console.log('🌍 Đang geocoding với OpenStreetMap:', address);

    const components = parseAddressComponents(address);

    const searchQueries = [];

    if (components.district && components.province) {
      searchQueries.push(`${components.district}, ${components.province}, Vietnam`);
    }

    if (components.district) {
      searchQueries.push(`${components.district}, Vietnam`);
    }

    if (components.ward && components.district) {
      searchQueries.push(`${components.ward}, ${components.district}, Vietnam`);
    }

    if (components.ward) {
      searchQueries.push(`${components.ward}, Vietnam`);
    }

    if (components.province) {
      searchQueries.push(`${components.province}, Vietnam`);
    }

    // 6. Toàn bộ địa chỉ gốc (fallback cuối)
    searchQueries.push(address);

    console.log('🔍 Danh sách tìm kiếm:', searchQueries);

    // Thử từng query theo thứ tự ưu tiên
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`Thử tìm kiếm ${i + 1}/${searchQueries.length}:`, query);

      const cleanQuery = query
        .replace(/[^\w\s,.-]/g, '') // Loại bỏ ký tự đặc biệt
        .replace(/\s+/g, '+') // Thay thế khoảng trắng bằng +
        .trim();

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=vn&limit=1`;

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'EcommerceApp/1.0'
          }
        });

        if (!response.ok) {
          console.log(`❌ HTTP error ${response.status} cho query:`, query);
          continue;
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const coords = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          };

          console.log(`Tìm thấy tọa độ từ OSM (query ${i + 1}):`, coords, 'cho địa chỉ:', result.display_name);
          return coords;
        } else {
          console.log(`Không tìm thấy cho query:`, query);
        }

      } catch (error) {
        console.log(`Lỗi cho query "${query}":`, error);
        continue;
      }
    }

    console.log('Không tìm thấy địa chỉ trong OSM với tất cả queries');
    return null;

  } catch (error) {
    console.error(' Lỗi khi geocoding với OSM:', error);
    return null;
  }
};

// Mapping các địa chỉ phổ biến với tọa độ
const ADDRESS_COORDINATES: { [key: string]: { latitude: number; longitude: number } } = {
  // Hà Nội
  'hà nội': { latitude: 21.0285, longitude: 105.8542 },
  'hanoi': { latitude: 21.0285, longitude: 105.8542 },
  'quận ba đình': { latitude: 21.0333, longitude: 105.8333 },
  'quận hoàn kiếm': { latitude: 21.0333, longitude: 105.8500 },
  'quận tây hồ': { latitude: 21.0667, longitude: 105.8167 },
  'quận long biên': { latitude: 21.0333, longitude: 105.9000 },
  'long biên': { latitude: 21.0333, longitude: 105.9000 },
  'phường phúc đồng': { latitude: 21.0333, longitude: 105.9000 },
  'phúc đồng': { latitude: 21.0333, longitude: 105.9000 },
  'quận cầu giấy': { latitude: 21.0333, longitude: 105.8000 },
  'quận đống đa': { latitude: 21.0167, longitude: 105.8333 },
  'quận hai bà trưng': { latitude: 21.0167, longitude: 105.8500 },
  'quận hoàng mai': { latitude: 20.9833, longitude: 105.8500 },
  'quận thanh xuân': { latitude: 21.0000, longitude: 105.8000 },
  'quận hà đông': { latitude: 20.9667, longitude: 105.7667 },
  'quận bắc từ liêm': { latitude: 21.0667, longitude: 105.7500 },
  'quận nam từ liêm': { latitude: 21.0167, longitude: 105.7500 },

  // TP. Hồ Chí Minh
  'tp. hồ chí minh': { latitude: 10.8231, longitude: 106.6297 },
  'hồ chí minh': { latitude: 10.8231, longitude: 106.6297 },
  'ho chi minh': { latitude: 10.8231, longitude: 106.6297 },
  'quận 1': { latitude: 10.7667, longitude: 106.7000 },
  'quận 2': { latitude: 10.7833, longitude: 106.7500 },
  'quận 3': { latitude: 10.7833, longitude: 106.6833 },
  'quận 4': { latitude: 10.7500, longitude: 106.7000 },
  'quận 5': { latitude: 10.7500, longitude: 106.6667 },
  'quận 6': { latitude: 10.7500, longitude: 106.6333 },
  'quận 7': { latitude: 10.7333, longitude: 106.7167 },
  'quận 8': { latitude: 10.7333, longitude: 106.6333 },
  'quận 9': { latitude: 10.8333, longitude: 106.7667 },
  'quận 10': { latitude: 10.7667, longitude: 106.6667 },
  'quận 11': { latitude: 10.7667, longitude: 106.6333 },
  'quận 12': { latitude: 10.8667, longitude: 106.6500 },
  'quận thủ đức': { latitude: 10.8500, longitude: 106.7500 },
  'quận gò vấp': { latitude: 10.8333, longitude: 106.6833 },
  'quận bình thạnh': { latitude: 10.8167, longitude: 106.7000 },
  'quận tân bình': { latitude: 10.8000, longitude: 106.6500 },
  'quận tân phú': { latitude: 10.7833, longitude: 106.6167 },
  'quận phú nhuận': { latitude: 10.8000, longitude: 106.6833 },
  'quận bình tân': { latitude: 10.7500, longitude: 106.6000 },
  'huyện hóc môn': { latitude: 10.8833, longitude: 106.5833 },
  'huyện củ chi': { latitude: 10.9667, longitude: 106.4833 },
  'huyện bình chánh': { latitude: 10.7000, longitude: 106.5500 },
  'huyện nhà bè': { latitude: 10.7000, longitude: 106.7167 },
  'huyện cần giờ': { latitude: 10.4167, longitude: 106.9667 },

  // Các tỉnh khác
  'đà nẵng': { latitude: 16.0544, longitude: 108.2022 },
  'hải phòng': { latitude: 20.8449, longitude: 106.6881 },
  'cần thơ': { latitude: 10.0452, longitude: 105.7469 },
  'an giang': { latitude: 10.5216, longitude: 105.1259 },
  'bà rịa - vũng tàu': { latitude: 10.3469, longitude: 107.0843 },
  'bắc giang': { latitude: 21.2731, longitude: 106.1946 },
  'bắc kạn': { latitude: 22.1470, longitude: 105.8348 },
  'bạc liêu': { latitude: 9.2943, longitude: 105.7272 },
  'bắc ninh': { latitude: 21.1861, longitude: 106.0763 },
  'bến tre': { latitude: 10.2415, longitude: 106.3759 },
  'bình dương': { latitude: 11.3254, longitude: 106.4774 },
  'bình phước': { latitude: 11.6471, longitude: 106.6050 },
  'bình thuận': { latitude: 10.9289, longitude: 108.1020 },
  'cà mau': { latitude: 9.1768, longitude: 105.1524 },
  'cao bằng': { latitude: 22.6651, longitude: 106.2577 },
  'đắk lắk': { latitude: 12.6667, longitude: 108.0500 },
  'đắk nông': { latitude: 12.0042, longitude: 107.6907 },
  'điện biên': { latitude: 21.4064, longitude: 103.0322 },
  'đồng nai': { latitude: 11.0686, longitude: 106.7619 },
  'đồng tháp': { latitude: 10.5604, longitude: 105.6339 },
  'gia lai': { latitude: 13.9833, longitude: 108.0000 },
  'hà giang': { latitude: 22.7667, longitude: 104.9833 },
  'hà nam': { latitude: 20.5411, longitude: 105.9222 },
  'hà tĩnh': { latitude: 18.3333, longitude: 105.9000 },
  'hải dương': { latitude: 20.9371, longitude: 106.3245 },
  'hậu giang': { latitude: 9.7842, longitude: 105.4701 },
  'hòa bình': { latitude: 20.8175, longitude: 105.3372 },
  'hưng yên': { latitude: 20.6464, longitude: 106.0511 },
  'khánh hòa': { latitude: 12.2500, longitude: 109.1833 },
  'kiên giang': { latitude: 9.9189, longitude: 105.1224 },
  'kon tum': { latitude: 14.3500, longitude: 108.0000 },
  'lai châu': { latitude: 22.4000, longitude: 103.4500 },
  'lâm đồng': { latitude: 11.9465, longitude: 108.4419 },
  'lạng sơn': { latitude: 21.8333, longitude: 106.7500 },
  'lào cai': { latitude: 22.4833, longitude: 103.9500 },
  'long an': { latitude: 10.6089, longitude: 106.6714 },
  'nam định': { latitude: 20.4201, longitude: 106.1682 },
  'nghệ an': { latitude: 18.6792, longitude: 105.6919 },
  'ninh bình': { latitude: 20.2500, longitude: 105.9667 },
  'ninh thuận': { latitude: 11.5648, longitude: 108.9886 },
  'phú thọ': { latitude: 21.3081, longitude: 105.3119 },
  'phú yên': { latitude: 13.0883, longitude: 109.0922 },
  'quảng bình': { latitude: 17.4689, longitude: 106.6228 },
  'quảng nam': { latitude: 15.8801, longitude: 108.3380 },
  'quảng ngãi': { latitude: 15.1167, longitude: 108.8000 },
  'quảng ninh': { latitude: 21.0167, longitude: 107.3000 },
  'quảng trị': { latitude: 16.7500, longitude: 107.2000 },
  'sóc trăng': { latitude: 9.6000, longitude: 105.9833 },
  'sơn la': { latitude: 21.3167, longitude: 103.9167 },
  'tây ninh': { latitude: 11.3131, longitude: 106.0963 },
  'thái bình': { latitude: 20.4461, longitude: 106.3422 },
  'thái nguyên': { latitude: 21.5944, longitude: 105.8481 },
  'thanh hóa': { latitude: 19.8000, longitude: 105.7667 },
  'thừa thiên huế': { latitude: 16.4667, longitude: 107.6000 },
  'tiền giang': { latitude: 10.3600, longitude: 106.3600 },
  'trà vinh': { latitude: 9.9347, longitude: 106.3453 },
  'tuyên quang': { latitude: 21.8167, longitude: 105.2167 },
  'vĩnh long': { latitude: 10.2500, longitude: 105.9667 },
  'vĩnh phúc': { latitude: 21.3081, longitude: 105.6042 },
  'yên bái': { latitude: 21.7000, longitude: 104.8667 }
};

// Hàm tìm tọa độ từ địa chỉ (sử dụng mapping với tách thành phần)
export const getCoordinatesFromAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  console.log('Tìm tọa độ cho địa chỉ gốc:', address);

  // Tách thành phần địa chỉ
  const components = parseAddressComponents(address);
  console.log('Thành phần địa chỉ:', components);

  // Chuẩn hóa địa chỉ để tìm kiếm (chỉ lowercase, giữ nguyên dấu)
  const normalizedAddress = address.toLowerCase().trim();

  console.log('Địa chỉ chuẩn hóa:', normalizedAddress);

  // Tìm trong mapping theo thứ tự ưu tiên
  const searchTerms = [];

  // Logic khác nhau cho Hà Nội và các tỉnh khác
  if (components.province && components.province.toLowerCase().includes('hà nội')) {
    // Hà Nội: Ưu tiên tìm theo ward (phường/xã)
    console.log('Địa chỉ Hà Nội - tìm theo ward');

    // 1. Ưu tiên: Ward + District
    if (components.ward && components.district) {
      searchTerms.push(`${components.ward.toLowerCase()}, ${components.district.toLowerCase()}`);
    }

    // 2. Chỉ Ward
    if (components.ward) {
      searchTerms.push(components.ward.toLowerCase());
    }

    // 3. District + Province
    if (components.district && components.province) {
      searchTerms.push(`${components.district.toLowerCase()}, ${components.province.toLowerCase()}`);
    }

    // 4. Chỉ District
    if (components.district) {
      searchTerms.push(components.district.toLowerCase());
    }

    // 5. Chỉ Province
    if (components.province) {
      searchTerms.push(components.province.toLowerCase());
    }
  } else {
    // Các tỉnh khác: Ưu tiên tìm theo tỉnh
    console.log(' Địa chỉ tỉnh khác - tìm theo tỉnh');

    // 1. Ưu tiên: Province
    if (components.province) {
      searchTerms.push(components.province.toLowerCase());
    }

    // 2. District + Province
    if (components.district && components.province) {
      searchTerms.push(`${components.district.toLowerCase()}, ${components.province.toLowerCase()}`);
    }

    // 3. Chỉ District
    if (components.district) {
      searchTerms.push(components.district.toLowerCase());
    }

    // 4. Ward + District
    if (components.ward && components.district) {
      searchTerms.push(`${components.ward.toLowerCase()}, ${components.district.toLowerCase()}`);
    }

    // 5. Chỉ Ward
    if (components.ward) {
      searchTerms.push(components.ward.toLowerCase());
    }
  }

  // 6. Toàn bộ địa chỉ chuẩn hóa (fallback cuối)
  searchTerms.push(normalizedAddress);

  console.log('Danh sách tìm kiếm:', searchTerms);

  // Tìm trong mapping - tìm kiếm chính xác
  for (const searchTerm of searchTerms) {
    for (const [key, coords] of Object.entries(ADDRESS_COORDINATES)) {
      const normalizedKey = key.toLowerCase().trim();
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();

      // Tìm kiếm chính xác - phải khớp hoàn toàn
      if (normalizedKey === normalizedSearchTerm) {
        console.log('Tìm thấy tọa độ từ mapping:', key, 'với tọa độ:', coords);
        return coords;
      }
    }
  }

  console.log('Không tìm thấy trong mapping, dùng tọa độ mặc định Hà Nội');
  return { latitude: 21.0285, longitude: 105.8542 };
};

// Hàm tính khoảng cách giữa hai điểm (async với OSM)
export const calculateDistance = async (address: string): Promise<number> => {
  try {
    console.log('Tính khoảng cách cho địa chỉ:', address);

    const destinationCoords = await getCoordinatesFromAddress(address);
    console.log('Tọa độ đích:', destinationCoords);

    if (!destinationCoords) {
      console.log('Không tìm thấy tọa độ cho địa chỉ:', address);
      return 0;
    }

    // Tính khoảng cách bằng geolib (trả về mét)
    const distanceInMeters = getDistance(STORE_COORDINATES, destinationCoords);
    console.log('Khoảng cách (mét):', distanceInMeters);

    // Chuyển đổi sang km
    const distanceInKm = distanceInMeters / 1000;
    console.log('Khoảng cách (km):', distanceInKm);

    return distanceInKm;
  } catch (error) {
    console.error('Lỗi khi tính khoảng cách:', error);
    return 0;
  }
};

// Hàm tính phí ship dựa trên khoảng cách
export const calculateShippingFee = async (address: string): Promise<number> => {
  console.log(' Tính phí ship cho địa chỉ:', address);

  // Chuẩn hóa địa chỉ để kiểm tra (chỉ lowercase, giữ nguyên dấu)
  const normalizedAddress = address.toLowerCase().trim();

  // Kiểm tra xem có phải Hà Nội không
  if (normalizedAddress.includes('hà nội') || normalizedAddress.includes('hanoi')) {
    console.log(' Địa chỉ Hà Nội - Miễn phí ship');
    return 0; // Miễn phí ship cho Hà Nội
  }

  // Các tỉnh khác - tính theo khoảng cách
  console.log('Địa chỉ tỉnh khác - Tính phí ship theo khoảng cách');

  try {
    // Tính khoảng cách từ shop đến địa chỉ
    const distanceKm = await calculateDistance(address);
    console.log('Khoảng cách tính được:', distanceKm, 'km');

    // Tính phí ship dựa trên khoảng cách
    let shippingFee = 0;

    if (distanceKm <= 5)
      return 20000;
    if (distanceKm > 5 && distanceKm <= 10)
      return 30000;
    if (distanceKm > 10 && distanceKm <= 20)
      return 40000;
    if (distanceKm > 20 && distanceKm <= 50)
      return 50000;
    if (distanceKm > 50 && distanceKm <= 100)
      return 60000;
    else {
      // > 100km: 60,000đ + 10,000đ/50km
      var extraKm = Math.ceil((distanceKm - 100) / 50);
      return 60000 + extraKm * 10000;
    }

    console.log('Phí ship theo khoảng cách:', shippingFee, 'đ');
    return shippingFee;

  } catch (error) {
    console.error('Lỗi khi tính khoảng cách:', error);
    // Fallback: phí ship mặc định cho tỉnh khác
    console.log('Phí ship mặc định (fallback):', 20000, 'đ');
    return 20000;
  }
};
