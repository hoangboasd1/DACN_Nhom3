using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Services;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductVariantController : ControllerBase
    {
        private readonly ProductVariantService _productVariantService;
        private readonly AppDbContext _context;

        public ProductVariantController(ProductVariantService productVariantService, AppDbContext context)
        {
            _productVariantService = productVariantService;
            _context = context;
        }

        // GET: api/ProductVariant/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<ProductVariant>>> GetProductVariants(int productId)
        {
            try
            {
                var variants = await _productVariantService.GetProductVariantsAsync(productId);
                return Ok(variants);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/ProductVariant/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductVariant>> GetProductVariant(int id)
        {
            try
            {
                var variant = await _productVariantService.GetProductVariantByIdAsync(id);
                if (variant == null)
                {
                    return NotFound(new { message = "Không tìm thấy biến thể sản phẩm." });
                }
                return Ok(variant);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/ProductVariant
        [HttpPost]
        public async Task<ActionResult<ProductVariant>> CreateProductVariant([FromBody] ProductVariant variant)
        {
            try
            {
                // Log dữ liệu nhận được
                Console.WriteLine($"Received variant data: ProductId={variant.ProductId}, ColorId={variant.ColorId}, SizeId={variant.SizeId}, StockQuantity={variant.StockQuantity}");

                // Kiểm tra sản phẩm có tồn tại không
                var product = await _context.Products.FindAsync(variant.ProductId);
                if (product == null)
                {
                    Console.WriteLine($"Product not found: {variant.ProductId}");
                    return BadRequest(new { message = "Sản phẩm không tồn tại." });
                }

                // Kiểm tra màu sắc có tồn tại không
                var color = await _context.Colors.FindAsync(variant.ColorId);
                if (color == null)
                {
                    Console.WriteLine($"Color not found: {variant.ColorId}");
                    return BadRequest(new { message = "Màu sắc không tồn tại." });
                }

                // Kiểm tra kích cỡ có tồn tại không
                var size = await _context.Sizes.FindAsync(variant.SizeId);
                if (size == null)
                {
                    Console.WriteLine($"Size not found: {variant.SizeId}");
                    return BadRequest(new { message = "Kích cỡ không tồn tại." });
                }

                var createdVariant = await _productVariantService.CreateProductVariantAsync(variant);
                return CreatedAtAction(nameof(GetProductVariant), new { id = createdVariant.Id }, createdVariant);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/ProductVariant/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductVariant>> UpdateProductVariant(int id, [FromBody] ProductVariant updatedVariant)
        {
            try
            {
                var variant = await _productVariantService.UpdateProductVariantAsync(id, updatedVariant);
                return Ok(variant);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/ProductVariant/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProductVariant(int id)
        {
            try
            {
                var result = await _productVariantService.DeleteProductVariantAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Không tìm thấy biến thể sản phẩm." });
                }
                return Ok(new { message = "Xóa biến thể sản phẩm thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/ProductVariant/{id}/stock
        [HttpPut("{id}/stock")]
        public async Task<ActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest request)
        {
            try
            {
                var result = await _productVariantService.UpdateStockAsync(id, request.Stock);
                if (!result)
                {
                    return NotFound(new { message = "Không tìm thấy biến thể sản phẩm." });
                }
                return Ok(new { message = "Cập nhật số lượng tồn kho thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/ProductVariant/product/{productId}/total-stock
        [HttpGet("product/{productId}/total-stock")]
        public async Task<ActionResult<int>> GetTotalStock(int productId)
        {
            try
            {
                var totalStock = await _productVariantService.GetTotalStockAsync(productId);
                return Ok(new { totalStock });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/ProductVariant/product/{productId}/colors
        [HttpGet("product/{productId}/colors")]
        public async Task<ActionResult<List<Color>>> GetAvailableColors(int productId)
        {
            try
            {
                var colors = await _productVariantService.GetAvailableColorsAsync(productId);
                return Ok(colors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/ProductVariant/product/{productId}/color/{colorId}/sizes
        [HttpGet("product/{productId}/color/{colorId}/sizes")]
        public async Task<ActionResult<List<Size>>> GetAvailableSizes(int productId, int colorId)
        {
            try
            {
                var sizes = await _productVariantService.GetAvailableSizesAsync(productId, colorId);
                return Ok(sizes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/ProductVariant/find
        [HttpGet("find")]
        public async Task<ActionResult<ProductVariant>> FindVariant([FromQuery] int productId, [FromQuery] int colorId, [FromQuery] int sizeId)
        {
            try
            {
                var variant = await _productVariantService.GetVariantByProductColorSizeAsync(productId, colorId, sizeId);
                if (variant == null)
                {
                    return NotFound(new { message = "Không tìm thấy biến thể sản phẩm." });
                }
                return Ok(variant);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateStockRequest
    {
        public int Stock { get; set; }
    }
}
