using Microsoft.EntityFrameworkCore;
using Models;

namespace EcommerceBackend
{
    public class DataSeeder
    {
        public static async Task SeedData(AppDbContext context)
        {
            // Kiểm tra xem đã có dữ liệu chưa
            if (await context.Materials.AnyAsync() || await context.ClothingTypes.AnyAsync() || await context.Colors.AnyAsync() || await context.Sizes.AnyAsync())
            {
                Console.WriteLine("Dữ liệu đã tồn tại, bỏ qua seeding.");
                return;
            }

            // Thêm Materials (Chất liệu)
            var materials = new List<Material>
            {
                new Material { Name = "Cotton", Description = "Vải cotton tự nhiên, thoáng mát" },
                new Material { Name = "Polyester", Description = "Vải polyester tổng hợp, bền màu" },
                new Material { Name = "Silk", Description = "Lụa cao cấp, mềm mại" },
                new Material { Name = "Wool", Description = "Len tự nhiên, giữ ấm tốt" },
                new Material { Name = "Linen", Description = "Vải lanh tự nhiên, thoáng khí" },
                new Material { Name = "Denim", Description = "Vải jean bền chắc" },
                new Material { Name = "Leather", Description = "Da thật cao cấp" },
                new Material { Name = "Suede", Description = "Da lộn mềm mại" },
                new Material { Name = "Cashmere", Description = "Len cashmere cao cấp" },
                new Material { Name = "Rayon", Description = "Vải rayon tổng hợp" },
                new Material { Name = "Spandex", Description = "Vải co giãn" },
                new Material { Name = "Nylon", Description = "Vải nylon nhẹ, khô nhanh" },
                new Material { Name = "Acrylic", Description = "Vải acrylic tổng hợp" },
                new Material { Name = "Bamboo", Description = "Vải sợi tre thân thiện môi trường" },
                new Material { Name = "Hemp", Description = "Vải gai dầu tự nhiên" },
                new Material { Name = "Tencel", Description = "Vải tencel từ gỗ" },
                new Material { Name = "Modal", Description = "Vải modal mềm mại" },
                new Material { Name = "Viscose", Description = "Vải viscose từ cellulose" },
                new Material { Name = "Chiffon", Description = "Vải chiffon mỏng nhẹ" },
                new Material { Name = "Satin", Description = "Vải satin bóng mượt" },
                new Material { Name = "Crepe", Description = "Vải crepe có độ nhăn" },
                new Material { Name = "Jersey", Description = "Vải jersey co giãn" },
                new Material { Name = "Fleece", Description = "Vải fleece ấm áp" },
                new Material { Name = "Canvas", Description = "Vải canvas dày dặn" },
                new Material { Name = "Tweed", Description = "Vải tweed có hoa văn" },
                new Material { Name = "Corduroy", Description = "Vải corduroy có sọc" },
                new Material { Name = "Velvet", Description = "Vải nhung mềm mại" },
                new Material { Name = "Organza", Description = "Vải organza trong suốt" },
                new Material { Name = "Georgette", Description = "Vải georgette mỏng" },
                new Material { Name = "Tulle", Description = "Vải tulle mỏng như lưới" }
            };

            context.Materials.AddRange(materials);

            // Thêm ClothingTypes (Loại quần áo)
            var clothingTypes = new List<ClothingType>
            {
                new ClothingType { Name = "Áo thun", Description = "Áo thun cơ bản" },
                new ClothingType { Name = "Áo sơ mi", Description = "Áo sơ mi công sở" },
                new ClothingType { Name = "Áo polo", Description = "Áo polo thể thao" },
                new ClothingType { Name = "Áo hoodie", Description = "Áo hoodie có mũ" },
                new ClothingType { Name = "Áo sweater", Description = "Áo len dài tay" },
                new ClothingType { Name = "Áo cardigan", Description = "Áo cardigan có nút" },
                new ClothingType { Name = "Áo blazer", Description = "Áo blazer trang trọng" },
                new ClothingType { Name = "Áo vest", Description = "Áo vest không tay" },
                new ClothingType { Name = "Áo jacket", Description = "Áo jacket ngoài" },
                new ClothingType { Name = "Áo coat", Description = "Áo coat dài" },
                new ClothingType { Name = "Áo trench", Description = "Áo trench coat" },
                new ClothingType { Name = "Áo bomber", Description = "Áo bomber jacket" },
                new ClothingType { Name = "Áo denim", Description = "Áo khoác denim" },
                new ClothingType { Name = "Áo windbreaker", Description = "Áo chống gió" },
                new ClothingType { Name = "Áo parka", Description = "Áo parka có mũ" },
                new ClothingType { Name = "Quần jean", Description = "Quần jean denim" },
                new ClothingType { Name = "Quần kaki", Description = "Quần kaki công sở" },
                new ClothingType { Name = "Quần short", Description = "Quần short ngắn" },
                new ClothingType { Name = "Quần jogger", Description = "Quần jogger thể thao" },
                new ClothingType { Name = "Quần chinos", Description = "Quần chinos casual" },
                new ClothingType { Name = "Quần cargo", Description = "Quần cargo có túi" },
                new ClothingType { Name = "Quần sweatpants", Description = "Quần sweatpants" },
                new ClothingType { Name = "Quần leggings", Description = "Quần leggings nữ" },
                new ClothingType { Name = "Quần yoga", Description = "Quần yoga tập luyện" },
                new ClothingType { Name = "Váy maxi", Description = "Váy maxi dài" },
                new ClothingType { Name = "Váy midi", Description = "Váy midi dài vừa" },
                new ClothingType { Name = "Váy mini", Description = "Váy mini ngắn" },
                new ClothingType { Name = "Váy A-line", Description = "Váy A-line" },
                new ClothingType { Name = "Váy bodycon", Description = "Váy bodycon ôm" },
                new ClothingType { Name = "Váy wrap", Description = "Váy wrap có dây" },
                new ClothingType { Name = "Váy shift", Description = "Váy shift thẳng" },
                new ClothingType { Name = "Váy slip", Description = "Váy slip mỏng" },
                new ClothingType { Name = "Váy skater", Description = "Váy skater xòe" },
                new ClothingType { Name = "Váy pencil", Description = "Váy pencil bút chì" },
                new ClothingType { Name = "Váy pleated", Description = "Váy pleated có nếp" },
                new ClothingType { Name = "Váy tiered", Description = "Váy tiered nhiều tầng" },
                new ClothingType { Name = "Váy tulle", Description = "Váy tulle xòe" },
                new ClothingType { Name = "Váy sequin", Description = "Váy sequin lấp lánh" },
                new ClothingType { Name = "Váy lace", Description = "Váy lace ren" },
                new ClothingType { Name = "Váy chiffon", Description = "Váy chiffon mỏng" },
                new ClothingType { Name = "Váy satin", Description = "Váy satin bóng" },
                new ClothingType { Name = "Váy velvet", Description = "Váy velvet nhung" },
                new ClothingType { Name = "Váy organza", Description = "Váy organza trong" },
                new ClothingType { Name = "Váy taffeta", Description = "Váy taffeta cứng" },
                new ClothingType { Name = "Váy crepe", Description = "Váy crepe nhăn" },
                new ClothingType { Name = "Váy georgette", Description = "Váy georgette mỏng" },
                new ClothingType { Name = "Váy jersey", Description = "Váy jersey co giãn" },
                new ClothingType { Name = "Váy knit", Description = "Váy knit đan" },
                new ClothingType { Name = "Váy sweater", Description = "Váy sweater len" },
                new ClothingType { Name = "Váy cardigan", Description = "Váy cardigan có nút" },
                new ClothingType { Name = "Váy wrap", Description = "Váy wrap có dây" },
                new ClothingType { Name = "Váy shirt", Description = "Váy shirt áo sơ mi" },
                new ClothingType { Name = "Váy tunic", Description = "Váy tunic dài" },
                new ClothingType { Name = "Váy caftan", Description = "Váy caftan rộng" },
                new ClothingType { Name = "Váy kimono", Description = "Váy kimono Nhật" },
                new ClothingType { Name = "Váy sarong", Description = "Váy sarong Indonesia" },
                new ClothingType { Name = "Váy maxi", Description = "Váy maxi dài" },
                new ClothingType { Name = "Váy midi", Description = "Váy midi dài vừa" },
                new ClothingType { Name = "Váy mini", Description = "Váy mini ngắn" },
                new ClothingType { Name = "Váy A-line", Description = "Váy A-line" },
                new ClothingType { Name = "Váy bodycon", Description = "Váy bodycon ôm" },
                new ClothingType { Name = "Váy wrap", Description = "Váy wrap có dây" },
                new ClothingType { Name = "Váy shift", Description = "Váy shift thẳng" },
                new ClothingType { Name = "Váy slip", Description = "Váy slip mỏng" },
                new ClothingType { Name = "Váy skater", Description = "Váy skater xòe" },
                new ClothingType { Name = "Váy pencil", Description = "Váy pencil bút chì" },
                new ClothingType { Name = "Váy pleated", Description = "Váy pleated có nếp" },
                new ClothingType { Name = "Váy tiered", Description = "Váy tiered nhiều tầng" },
                new ClothingType { Name = "Váy tulle", Description = "Váy tulle xòe" },
                new ClothingType { Name = "Váy sequin", Description = "Váy sequin lấp lánh" },
                new ClothingType { Name = "Váy lace", Description = "Váy lace ren" },
                new ClothingType { Name = "Váy chiffon", Description = "Váy chiffon mỏng" },
                new ClothingType { Name = "Váy satin", Description = "Váy satin bóng" },
                new ClothingType { Name = "Váy velvet", Description = "Váy velvet nhung" },
                new ClothingType { Name = "Váy organza", Description = "Váy organza trong" },
                new ClothingType { Name = "Váy taffeta", Description = "Váy taffeta cứng" },
                new ClothingType { Name = "Váy crepe", Description = "Váy crepe nhăn" },
                new ClothingType { Name = "Váy georgette", Description = "Váy georgette mỏng" },
                new ClothingType { Name = "Váy jersey", Description = "Váy jersey co giãn" },
                new ClothingType { Name = "Váy knit", Description = "Váy knit đan" },
                new ClothingType { Name = "Váy sweater", Description = "Váy sweater len" },
                new ClothingType { Name = "Váy cardigan", Description = "Váy cardigan có nút" },
                new ClothingType { Name = "Váy wrap", Description = "Váy wrap có dây" },
                new ClothingType { Name = "Váy shirt", Description = "Váy shirt áo sơ mi" },
                new ClothingType { Name = "Váy tunic", Description = "Váy tunic dài" },
                new ClothingType { Name = "Váy caftan", Description = "Váy caftan rộng" },
                new ClothingType { Name = "Váy kimono", Description = "Váy kimono Nhật" },
                new ClothingType { Name = "Váy sarong", Description = "Váy sarong Indonesia" }
            };

            // Loại bỏ trùng lặp
            var uniqueClothingTypes = clothingTypes
                .GroupBy(ct => ct.Name)
                .Select(g => g.First())
                .ToList();

            context.ClothingTypes.AddRange(uniqueClothingTypes);

            // Thêm Colors (Màu sắc)
            var colors = new List<Color>
            {
                new Color { Name = "Đen", HexCode = "#000000", Description = "Màu đen cơ bản" },
                new Color { Name = "Trắng", HexCode = "#FFFFFF", Description = "Màu trắng tinh khiết" },
                new Color { Name = "Xám", HexCode = "#808080", Description = "Màu xám trung tính" },
                new Color { Name = "Xám đậm", HexCode = "#404040", Description = "Màu xám đậm" },
                new Color { Name = "Xám nhạt", HexCode = "#C0C0C0", Description = "Màu xám nhạt" },
                new Color { Name = "Đỏ", HexCode = "#FF0000", Description = "Màu đỏ tươi" },
                new Color { Name = "Đỏ đậm", HexCode = "#8B0000", Description = "Màu đỏ đậm" },
                new Color { Name = "Hồng", HexCode = "#FFC0CB", Description = "Màu hồng nhạt" },
                new Color { Name = "Hồng đậm", HexCode = "#FF1493", Description = "Màu hồng đậm" },
                new Color { Name = "Xanh dương", HexCode = "#0000FF", Description = "Màu xanh dương" },
                new Color { Name = "Xanh navy", HexCode = "#000080", Description = "Màu xanh navy" },
                new Color { Name = "Xanh sky", HexCode = "#87CEEB", Description = "Màu xanh sky" },
                new Color { Name = "Xanh lá", HexCode = "#00FF00", Description = "Màu xanh lá" },
                new Color { Name = "Xanh olive", HexCode = "#808000", Description = "Màu xanh olive" },
                new Color { Name = "Vàng", HexCode = "#FFFF00", Description = "Màu vàng tươi" },
                new Color { Name = "Vàng đậm", HexCode = "#FFD700", Description = "Màu vàng đậm" },
                new Color { Name = "Cam", HexCode = "#FFA500", Description = "Màu cam" },
                new Color { Name = "Tím", HexCode = "#800080", Description = "Màu tím" },
                new Color { Name = "Tím nhạt", HexCode = "#DDA0DD", Description = "Màu tím nhạt" },
                new Color { Name = "Nâu", HexCode = "#A52A2A", Description = "Màu nâu" },
                new Color { Name = "Nâu nhạt", HexCode = "#D2B48C", Description = "Màu nâu nhạt" },
                new Color { Name = "Be", HexCode = "#F5F5DC", Description = "Màu be" },
                new Color { Name = "Kem", HexCode = "#FFF8DC", Description = "Màu kem" },
                new Color { Name = "Xanh mint", HexCode = "#98FB98", Description = "Màu xanh mint" },
                new Color { Name = "Xanh turquoise", HexCode = "#40E0D0", Description = "Màu xanh turquoise" },
                new Color { Name = "Đỏ burgundy", HexCode = "#800020", Description = "Màu đỏ burgundy" },
                new Color { Name = "Xanh forest", HexCode = "#228B22", Description = "Màu xanh forest" },
                new Color { Name = "Vàng gold", HexCode = "#FFD700", Description = "Màu vàng gold" },
                new Color { Name = "Bạc", HexCode = "#C0C0C0", Description = "Màu bạc" },
                new Color { Name = "Đồng", HexCode = "#B87333", Description = "Màu đồng" }
            };

            context.Colors.AddRange(colors);

            // Thêm Sizes (Kích cỡ)
            var sizes = new List<Size>
            {
                // Kích cỡ áo thun, áo sơ mi
                new Size { Name = "XS", Code = "XS", Description = "Extra Small" },
                new Size { Name = "S", Code = "S", Description = "Small" },
                new Size { Name = "M", Code = "M", Description = "Medium" },
                new Size { Name = "L", Code = "L", Description = "Large" },
                new Size { Name = "XL", Code = "XL", Description = "Extra Large" },
                new Size { Name = "XXL", Code = "XXL", Description = "Double Extra Large" },
                new Size { Name = "XXXL", Code = "XXXL", Description = "Triple Extra Large" },
                
                // Kích cỡ quần (inch)
                new Size { Name = "28", Code = "28", Description = "28 inch" },
                new Size { Name = "29", Code = "29", Description = "29 inch" },
                new Size { Name = "30", Code = "30", Description = "30 inch" },
                new Size { Name = "31", Code = "31", Description = "31 inch" },
                new Size { Name = "32", Code = "32", Description = "32 inch" },
                new Size { Name = "33", Code = "33", Description = "33 inch" },
                new Size { Name = "34", Code = "34", Description = "34 inch" },
                new Size { Name = "35", Code = "35", Description = "35 inch" },
                new Size { Name = "36", Code = "36", Description = "36 inch" },
                new Size { Name = "38", Code = "38", Description = "38 inch" },
                new Size { Name = "40", Code = "40", Description = "40 inch" },
                new Size { Name = "42", Code = "42", Description = "42 inch" },
                new Size { Name = "44", Code = "44", Description = "44 inch" },
                
                // Kích cỡ giày
                new Size { Name = "35", Code = "35", Description = "Size giày 35" },
                new Size { Name = "36", Code = "36", Description = "Size giày 36" },
                new Size { Name = "37", Code = "37", Description = "Size giày 37" },
                new Size { Name = "38", Code = "38", Description = "Size giày 38" },
                new Size { Name = "39", Code = "39", Description = "Size giày 39" },
                new Size { Name = "40", Code = "40", Description = "Size giày 40" },
                new Size { Name = "41", Code = "41", Description = "Size giày 41" },
                new Size { Name = "42", Code = "42", Description = "Size giày 42" },
                new Size { Name = "43", Code = "43", Description = "Size giày 43" },
                new Size { Name = "44", Code = "44", Description = "Size giày 44" },
                new Size { Name = "45", Code = "45", Description = "Size giày 45" },
                
                // Kích cỡ đặc biệt
                new Size { Name = "Free Size", Code = "FS", Description = "Kích cỡ tự do" },
                new Size { Name = "One Size", Code = "OS", Description = "Một kích cỡ" },
                new Size { Name = "Plus Size", Code = "PS", Description = "Kích cỡ lớn" }
            };

            context.Sizes.AddRange(sizes);

            await context.SaveChangesAsync();
            Console.WriteLine($"Đã thêm {materials.Count} chất liệu, {uniqueClothingTypes.Count} loại quần áo, {colors.Count} màu sắc và {sizes.Count} kích cỡ vào database.");
        }
    }
}
