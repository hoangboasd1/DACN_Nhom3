using System.Text.RegularExpressions;

namespace EcommerceBackend.Services
{
    public static class ShippingService
    {
        // Địa chỉ cửa hàng (Hà Nội)
        private const double SHOP_LATITUDE = 21.0285;
        private const double SHOP_LONGITUDE = 105.8542;

        /// <summary>
        /// Tính phí ship dựa trên địa chỉ giao hàng
        /// </summary>
        /// <param name="deliveryAddress">Địa chỉ giao hàng</param>
        /// <returns>Phí ship (đồng)</returns>
        public static async Task<decimal> CalculateShippingFee(string deliveryAddress)
        {
           
            Console.WriteLine($" Tính phí ship cho địa chỉ: {deliveryAddress}");

            // Chuẩn hóa địa chỉ để kiểm tra (chỉ lowercase, giữ nguyên dấu)
            var normalizedAddress = deliveryAddress.ToLower().Trim();

            // Kiểm tra xem có phải Hà Nội không
            if (normalizedAddress.Contains("hà nội") || normalizedAddress.Contains("hanoi"))
            {
                Console.WriteLine(" Địa chỉ Hà Nội - Miễn phí ship");
                return 0; // Miễn phí ship cho Hà Nội
            }

            // Các tỉnh khác - tính theo khoảng cách
            Console.WriteLine("Địa chỉ tỉnh khác - Tính phí ship theo khoảng cách");

            try
            {
                // Tính khoảng cách từ shop đến địa chỉ
                var distanceKm = await CalculateDistance(deliveryAddress);
                Console.WriteLine($" Khoảng cách tính được: {distanceKm} km");

                // Tính phí ship dựa trên khoảng cách
                decimal shippingFee = CalculateFeeByDistance(distanceKm);

                Console.WriteLine($"Phí ship theo khoảng cách: {shippingFee} đ");
                return shippingFee;
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Lỗi khi tính khoảng cách: {ex.Message}");
                // Fallback: phí ship mặc định cho tỉnh khác
                Console.WriteLine(" Phí ship mặc định (fallback): 25000 đ");
                return 25000;
            }
        }

        /// <summary>
        /// Tính khoảng cách từ cửa hàng đến địa chỉ giao hàng
        /// </summary>
        /// <param name="address">Địa chỉ giao hàng</param>
        /// <returns>Khoảng cách (km)</returns>
        private static async Task<double> CalculateDistance(string address)
        {
            // Mapping các địa chỉ phổ biến với tọa độ
            var addressCoordinates = GetAddressCoordinates();

            // Tìm tọa độ cho địa chỉ
            var coordinates = FindCoordinatesForAddress(address, addressCoordinates);

            if (coordinates.HasValue)
            {
                // Tính khoảng cách bằng công thức Haversine
                return CalculateHaversineDistance(
                    SHOP_LATITUDE, SHOP_LONGITUDE,
                    coordinates.Value.Latitude, coordinates.Value.Longitude
                );
            }

            // Nếu không tìm thấy tọa độ, ước tính dựa trên tỉnh
            return EstimateDistanceByProvince(address);
        }

        /// <summary>
        /// Tính phí ship dựa trên khoảng cách
        /// </summary>
        /// <param name="distanceKm">Khoảng cách (km)</param>
        /// <returns>Phí ship (đồng)</returns>
        private static decimal CalculateFeeByDistance(double distanceKm)
        {
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
            else
            {
                // > 100km: 60,000đ + 10,000đ/50km
                var extraKm = Math.Ceiling((distanceKm - 100) / 50);
                return 60000 + (decimal)(extraKm * 10000);
            }
        }

        /// <summary>
        /// Tính khoảng cách bằng công thức Haversine
        /// </summary>
        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Bán kính Trái Đất (km)

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }

        /// <summary>
        /// Mapping các địa chỉ phổ biến với tọa độ
        /// </summary>
        private static Dictionary<string, (double Latitude, double Longitude)> GetAddressCoordinates()
        {
            return new Dictionary<string, (double, double)>
            {
                // Hà Nội
                {"hà nội", (21.0285, 105.8542)},
                {"hanoi", (21.0285, 105.8542)},
                
                // TP.HCM
                {"hồ chí minh", (10.8231, 106.6297)},
                {"tp hcm", (10.8231, 106.6297)},
                {"ho chi minh", (10.8231, 106.6297)},
                
                // Đà Nẵng
                {"đà nẵng", (16.0544, 108.2022)},
                {"da nang", (16.0544, 108.2022)},
                
                // Hải Phòng
                {"hải phòng", (20.8449, 106.6881)},
                {"hai phong", (20.8449, 106.6881)},
                
                // Cần Thơ
                {"cần thơ", (10.0452, 105.7469)},
                {"can tho", (10.0452, 105.7469)},
                
                // An Giang
                {"an giang", (10.5216, 105.1259)},
                
                // Bà Rịa - Vũng Tàu
                {"bà rịa vũng tàu", (10.5419, 107.2420)},
                {"vũng tàu", (10.3459, 107.0843)},
                
                // Bắc Giang
                {"bắc giang", (21.2737, 106.1946)},
                
                // Bắc Kạn
                {"bắc kạn", (22.1470, 105.8348)},
                
                // Bạc Liêu
                {"bạc liêu", (9.2943, 105.7212)},
                
                // Bắc Ninh
                {"bắc ninh", (21.1861, 106.0763)},
                
                // Bến Tre
                {"bến tre", (10.2415, 106.3754)},
                
                // Bình Định
                {"bình định", (13.7750, 109.2236)},
                
                // Bình Dương
                {"bình dương", (11.3254, 106.4774)},
                
                // Bình Phước
                {"bình phước", (11.6471, 106.6056)},
                
                // Bình Thuận
                {"bình thuận", (10.9289, 108.1021)},
                
                // Cà Mau
                {"cà mau", (9.1768, 105.1520)},
                
                // Cao Bằng
                {"cao bằng", (22.6657, 106.2577)},
                
                // Đắk Lắk
                {"đắk lắk", (12.6662, 108.0503)},
                
                // Đắk Nông
                {"đắk nông", (12.0027, 107.6874)},
                
                // Điện Biên
                {"điện biên", (21.3862, 103.0230)},
                
                // Đồng Nai
                {"đồng nai", (11.0686, 107.1676)},
                
                // Đồng Tháp
                {"đồng tháp", (10.5604, 105.6339)},
                
                // Gia Lai
                {"gia lai", (13.8078, 108.1094)},
                
                // Hà Giang
                {"hà giang", (22.7662, 104.9386)},
                
                // Hà Nam
                {"hà nam", (20.5411, 105.9229)},
                
                // Hà Tĩnh
                {"hà tĩnh", (18.3428, 105.9059)},
                
                // Hải Dương
                {"hải dương", (20.9373, 106.3146)},
                
                // Hậu Giang
                {"hậu giang", (9.7842, 105.4701)},
                
                // Hòa Bình
                {"hòa bình", (20.6861, 105.3131)},
                
                // Hưng Yên
                {"hưng yên", (20.6464, 106.0512)},
                
                // Khánh Hòa
                {"khánh hòa", (12.2388, 109.1967)},
                
                // Kiên Giang
                {"kiên giang", (9.9580, 105.1234)},
                
                // Kon Tum
                {"kon tum", (14.3545, 108.0076)},
                
                // Lai Châu
                {"lai châu", (22.3868, 103.4550)},
                
                // Lâm Đồng
                {"lâm đồng", (11.9404, 108.4583)},
                
                // Lạng Sơn
                {"lạng sơn", (21.8537, 106.7615)},
                
                // Lào Cai
                {"lào cai", (22.3381, 103.8444)},
                
                // Long An
                {"long an", (10.6086, 106.6718)},
                
                // Nam Định
                {"nam định", (20.4388, 106.1621)},
                
                // Nghệ An
                {"nghệ an", (18.6792, 105.6882)},
                
                // Ninh Bình
                {"ninh bình", (20.2506, 105.9744)},
                
                // Ninh Thuận
                {"ninh thuận", (11.5648, 108.9881)},
                
                // Phú Thọ
                {"phú thọ", (21.3087, 105.3119)},
                
                // Phú Yên
                {"phú yên", (13.0880, 109.0929)},
                
                // Quảng Bình
                {"quảng bình", (17.4683, 106.6227)},
                
                // Quảng Nam
                {"quảng nam", (15.8801, 108.3380)},
                
                // Quảng Ngãi
                {"quảng ngãi", (15.1214, 108.8048)},
                
                // Quảng Ninh
                {"quảng ninh", (21.0064, 107.2925)},
                
                // Quảng Trị
                {"quảng trị", (16.8170, 107.1003)},
                
                // Sóc Trăng
                {"sóc trăng", (9.6002, 105.9804)},
                
                // Sơn La
                {"sơn la", (21.3257, 103.9160)},
                
                // Tây Ninh
                {"tây ninh", (11.3144, 106.1093)},
                
                // Thái Bình
                {"thái bình", (20.4465, 106.3421)},
                
                // Thái Nguyên
                {"thái nguyên", (21.5944, 105.8481)},
                
                // Thanh Hóa
                {"thanh hóa", (19.8076, 105.7842)},
                
                // Thừa Thiên Huế
                {"thừa thiên huế", (16.4637, 107.5909)},
                {"huế", (16.4637, 107.5909)},
                
                // Tiền Giang
                {"tiền giang", (10.3605, 106.3600)},
                
                // Trà Vinh
                {"trà vinh", (9.9347, 106.3481)},
                
                // Tuyên Quang
                {"tuyên quang", (21.7767, 105.2280)},
                
                // Vĩnh Long
                {"vĩnh long", (10.2536, 105.9752)},
                
                // Vĩnh Phúc
                {"vĩnh phúc", (21.3089, 105.6044)},
                
                // Yên Bái
                {"yên bái", (21.7226, 104.9113)}
            };
        }

        /// <summary>
        /// Tìm tọa độ cho địa chỉ
        /// </summary>
        private static (double Latitude, double Longitude)? FindCoordinatesForAddress(
            string address, 
            Dictionary<string, (double Latitude, double Longitude)> coordinates)
        {
            var normalizedAddress = address.ToLower().Trim();

            // Tìm kiếm trực tiếp
            if (coordinates.ContainsKey(normalizedAddress))
            {
                return coordinates[normalizedAddress];
            }

            // Tìm kiếm theo từ khóa
            foreach (var kvp in coordinates)
            {
                if (normalizedAddress.Contains(kvp.Key))
                {
                    return kvp.Value;
                }
            }

            return null;
        }

        /// <summary>
        /// Ước tính khoảng cách dựa trên tỉnh
        /// </summary>
        private static double EstimateDistanceByProvince(string address)
        {
            var normalizedAddress = address.ToLower();

            // Mapping khoảng cách ước tính từ Hà Nội đến các tỉnh
            var provinceDistances = new Dictionary<string, double>
            {
                {"hà nội", 0},
                {"hanoi", 0},
                {"hải phòng", 100},
                {"hai phong", 100},
                {"hồ chí minh", 1200},
                {"tp hcm", 1200},
                {"ho chi minh", 1200},
                {"đà nẵng", 650},
                {"da nang", 650},
                {"cần thơ", 1100},
                {"can tho", 1100},
                {"an giang", 1000},
                {"bà rịa vũng tàu", 1200},
                {"vũng tàu", 1200},
                {"bắc giang", 50},
                {"bắc kạn", 200},
                {"bạc liêu", 1000},
                {"bắc ninh", 30},
                {"bến tre", 1100},
                {"bình định", 700},
                {"bình dương", 1200},
                {"bình phước", 1200},
                {"bình thuận", 1000},
                {"cà mau", 1000},
                {"cao bằng", 300},
                {"đắk lắk", 800},
                {"đắk nông", 800},
                {"điện biên", 400},
                {"đồng nai", 1200},
                {"đồng tháp", 1100},
                {"gia lai", 800},
                {"hà giang", 300},
                {"hà nam", 60},
                {"hà tĩnh", 300},
                {"hải dương", 80},
                {"hậu giang", 1100},
                {"hòa bình", 80},
                {"hưng yên", 50},
                {"khánh hòa", 800},
                {"kiên giang", 1000},
                {"kon tum", 800},
                {"lai châu", 400},
                {"lâm đồng", 1000},
                {"lạng sơn", 150},
                {"lào cai", 300},
                {"long an", 1200},
                {"nam định", 100},
                {"nghệ an", 300},
                {"ninh bình", 100},
                {"ninh thuận", 1000},
                {"phú thọ", 80},
                {"phú yên", 700},
                {"quảng bình", 400},
                {"quảng nam", 700},
                {"quảng ngãi", 700},
                {"quảng ninh", 150},
                {"quảng trị", 500},
                {"sóc trăng", 1100},
                {"sơn la", 200},
                {"tây ninh", 1200},
                {"thái bình", 100},
                {"thái nguyên", 80},
                {"thanh hóa", 200},
                {"thừa thiên huế", 600},
                {"huế", 600},
                {"tiền giang", 1100},
                {"trà vinh", 1100},
                {"tuyên quang", 100},
                {"vĩnh long", 1100},
                {"vĩnh phúc", 50},
                {"yên bái", 150}
            };

            foreach (var kvp in provinceDistances)
            {
                if (normalizedAddress.Contains(kvp.Key))
                {
                    return kvp.Value;
                }
            }

            // Mặc định: 200km cho các tỉnh không xác định
            return 200;
        }
    }
}
