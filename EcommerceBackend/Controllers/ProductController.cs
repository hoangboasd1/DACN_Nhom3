using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models; 
namespace Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ClothingType)
                .Include(p => p.ProductMaterials)
                    .ThenInclude(pm => pm.Material)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            return Ok(products);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ClothingType)
                .Include(p => p.ProductMaterials)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return NotFound();
            return Ok(product);
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra CategoryId hợp lệ
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                return BadRequest("CategoryId không hợp lệ!");

            // Kiểm tra ClothingTypeId nếu có
            ClothingType? clothingType = null;
            if (request.ClothingTypeId.HasValue)
            {
                clothingType = await _context.ClothingTypes.FindAsync(request.ClothingTypeId.Value);
                if (clothingType == null)
                    return BadRequest("ClothingTypeId không hợp lệ!");
            }

            // Kiểm tra MaterialIds
            var materials = new List<Material>();
            if (request.MaterialIds.Any())
            {
                materials = await _context.Materials
                    .Where(m => request.MaterialIds.Contains(m.Id))
                    .ToListAsync();
                
                if (materials.Count != request.MaterialIds.Count)
                    return BadRequest("Một hoặc nhiều MaterialId không hợp lệ!");
            }

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Instock = request.Instock,
                ImageUrl = request.ImageUrl,
                Gender = request.Gender,
                CategoryId = request.CategoryId,
                ClothingTypeId = request.ClothingTypeId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Thêm materials vào ProductMaterial
            if (materials.Any())
            {
                var productMaterials = materials.Select(material => new ProductMaterial
                {
                    ProductId = product.Id,
                    MaterialId = material.Id
                }).ToList();

                _context.ProductMaterials.AddRange(productMaterials);
                await _context.SaveChangesAsync();
            }

            // Load lại thông tin để trả về đầy đủ
            product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ClothingType)
                .Include(p => p.ProductMaterials)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            return Ok(product);
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request)
        {
            var product = await _context.Products
                .Include(p => p.ProductMaterials)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null)
                return NotFound();

            // Kiểm tra CategoryId
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                return BadRequest("CategoryId không hợp lệ!");

            // Kiểm tra ClothingTypeId nếu có
            ClothingType? clothingType = null;
            if (request.ClothingTypeId.HasValue)
            {
                clothingType = await _context.ClothingTypes.FindAsync(request.ClothingTypeId.Value);
                if (clothingType == null)
                    return BadRequest("ClothingTypeId không hợp lệ!");
            }

            // Kiểm tra MaterialIds
            var materials = new List<Material>();
            if (request.MaterialIds.Any())
            {
                materials = await _context.Materials
                    .Where(m => request.MaterialIds.Contains(m.Id))
                    .ToListAsync();
                
                if (materials.Count != request.MaterialIds.Count)
                    return BadRequest("Một hoặc nhiều MaterialId không hợp lệ!");
            }

            // Cập nhật thông tin sản phẩm
            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.Instock = request.Instock;
            product.ImageUrl = request.ImageUrl;
            product.Gender = request.Gender;
            product.CategoryId = request.CategoryId;
            product.ClothingTypeId = request.ClothingTypeId;

            // Xóa materials cũ và thêm materials mới
            if (product.ProductMaterials.Any())
            {
                _context.ProductMaterials.RemoveRange(product.ProductMaterials);
            }

            if (materials.Any())
            {
                var productMaterials = materials.Select(material => new ProductMaterial
                {
                    ProductId = product.Id,
                    MaterialId = material.Id
                }).ToList();

                _context.ProductMaterials.AddRange(productMaterials);
            }

            await _context.SaveChangesAsync();

            // Load lại thông tin để trả về đầy đủ
            product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ClothingType)
                .Include(p => p.ProductMaterials)
                    .ThenInclude(pm => pm.Material)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            return Ok(product);
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sản phẩm thành công." });
        }
        // GET: api/products/by-category/{categoryId}
        [HttpGet("by-category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var products = await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category)
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            if (products == null || !products.Any())
                return NotFound(new { message = "Không tìm thấy sản phẩm nào trong nhóm này." });

            return Ok(products);
        }

        // GET: api/products/weekly-bestsellers
        [HttpGet("weekly-bestsellers")]
        public async Task<IActionResult> GetWeeklyBestSellers()
        {
            try
            {
                var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
                
                // Kiểm tra xem có OrderDetails nào trong 7 ngày qua không
                var hasRecentOrders = await _context.OrderDetails
                    .Include(od => od.Order)
                    .AnyAsync(od => od.Order.OrderDate >= oneWeekAgo);
                
                if (!hasRecentOrders)
                {
                    // Nếu không có đơn hàng trong 7 ngày qua, trả về 5 sản phẩm mới nhất
                    var fallbackProducts = await _context.Products
                        .Include(p => p.Category)
                        .OrderByDescending(p => p.Id)
                        .Take(5)
                        .ToListAsync();
                    
                    return Ok(fallbackProducts);
                }
                
                var weeklyBestSellers = await _context.OrderDetails
                    .Include(od => od.Product)
                    .ThenInclude(p => p.Category)
                    .Include(od => od.Order)
                    .Where(od => od.Order.OrderDate >= oneWeekAgo)
                    .GroupBy(od => od.ProductId)
                    .Select(g => new
                    {
                        Product = g.First().Product,
                        TotalQuantity = g.Sum(od => od.Quantity)
                    })
                    .OrderByDescending(x => x.TotalQuantity)
                    .Take(5)
                    .Select(x => x.Product)
                    .ToListAsync();

                return Ok(weeklyBestSellers);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, trả về 5 sản phẩm mới nhất
                var fallbackProducts = await _context.Products
                    .Include(p => p.Category)
                    .OrderByDescending(p => p.Id)
                    .Take(5)
                    .ToListAsync();
                
                return Ok(fallbackProducts);
            }
        }

        // GET: api/products/featured
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts()
        {
            try
            {
                // Kiểm tra xem có dữ liệu OrderDetails không
                var hasOrderDetails = await _context.OrderDetails.AnyAsync();
                
                if (!hasOrderDetails)
                {
                    // Nếu không có dữ liệu đơn hàng, trả về 5 sản phẩm mới nhất
                    var fallbackProducts = await _context.Products
                        .Include(p => p.Category)
                        .OrderByDescending(p => p.Id)
                        .Take(5)
                        .ToListAsync();
                    
                    return Ok(fallbackProducts);
                }

                // Nếu có dữ liệu đơn hàng, lấy sản phẩm bán chạy nhất
                var featuredProducts = await _context.OrderDetails
                    .Include(od => od.Product)
                    .ThenInclude(p => p.Category)
                    .GroupBy(od => od.ProductId)
                    .Select(g => new
                    {
                        Product = g.First().Product,
                        TotalQuantity = g.Sum(od => od.Quantity)
                    })
                    .OrderByDescending(x => x.TotalQuantity)
                    .Take(5)
                    .Select(x => x.Product)
                    .ToListAsync();

                return Ok(featuredProducts);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, trả về 5 sản phẩm mới nhất
                var fallbackProducts = await _context.Products
                    .Include(p => p.Category)
                    .OrderByDescending(p => p.Id)
                    .Take(5)
                    .ToListAsync();
                
                return Ok(fallbackProducts);
            }
        }

        // GET: api/products/materials
        [HttpGet("materials")]
        public async Task<IActionResult> GetMaterials()
        {
            var materials = await _context.Materials
                .OrderBy(m => m.Name)
                .ToListAsync();
            return Ok(materials);
        }

        // GET: api/products/clothing-types
        [HttpGet("clothing-types")]
        public async Task<IActionResult> GetClothingTypes()
        {
            var clothingTypes = await _context.ClothingTypes
                .OrderBy(ct => ct.Name)
                .ToListAsync();
            return Ok(clothingTypes);
        }

        // POST: api/products/seed-data
        [HttpPost("seed-data")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                await EcommerceBackend.DataSeeder.SeedData(_context);
                return Ok(new { message = "Seeding hoàn thành thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi seeding: {ex.Message}" });
            }
        }
    }
}
