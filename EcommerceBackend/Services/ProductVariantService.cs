using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class ProductVariantService
    {
        private readonly AppDbContext _context;

        public ProductVariantService(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả biến thể của một sản phẩm
        public async Task<List<ProductVariant>> GetProductVariantsAsync(int productId)
        {
            return await _context.ProductVariants
                .Include(pv => pv.Color)
                .Include(pv => pv.Size)
                .Where(pv => pv.ProductId == productId && pv.IsActive)
                .ToListAsync();
        }

        // Lấy biến thể theo ID
        public async Task<ProductVariant?> GetProductVariantByIdAsync(int variantId)
        {
            return await _context.ProductVariants
                .Include(pv => pv.Product)
                .Include(pv => pv.Color)
                .Include(pv => pv.Size)
                .FirstOrDefaultAsync(pv => pv.Id == variantId);
        }

        // Tạo biến thể mới
        public async Task<ProductVariant> CreateProductVariantAsync(ProductVariant variant)
        {
            // Note: Removed duplicate check to allow multiple variants with same Product+Color+Size
            // This allows for scenarios like: Product1-Red-SizeM can have multiple entries
            
            _context.ProductVariants.Add(variant);
            await _context.SaveChangesAsync();
            return variant;
        }

        // Cập nhật biến thể
        public async Task<ProductVariant> UpdateProductVariantAsync(int variantId, ProductVariant updatedVariant)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null)
            {
                throw new ArgumentException("Không tìm thấy biến thể sản phẩm.");
            }

            // Note: Removed duplicate check to allow multiple variants with same Product+Color+Size
            // This allows for scenarios like: Product1-Red-SizeM can have multiple entries

            // Cập nhật tất cả các trường
            variant.ProductId = updatedVariant.ProductId;
            variant.ColorId = updatedVariant.ColorId;
            variant.SizeId = updatedVariant.SizeId;
            variant.StockQuantity = updatedVariant.StockQuantity;
            variant.PriceAdjustment = updatedVariant.PriceAdjustment;
            variant.ImageUrl = updatedVariant.ImageUrl;
            variant.SKU = updatedVariant.SKU;
            variant.IsActive = updatedVariant.IsActive;

            await _context.SaveChangesAsync();
            return variant;
        }

        // Xóa biến thể (soft delete)
        public async Task<bool> DeleteProductVariantAsync(int variantId)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null)
            {
                return false;
            }

            variant.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        // Cập nhật số lượng tồn kho
        public async Task<bool> UpdateStockAsync(int variantId, int newStock)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null)
            {
                return false;
            }

            variant.StockQuantity = newStock;
            await _context.SaveChangesAsync();
            return true;
        }

        // Giảm số lượng tồn kho (khi đặt hàng)
        public async Task<bool> ReduceStockAsync(int variantId, int quantity)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null || variant.StockQuantity < quantity)
            {
                return false;
            }

            variant.StockQuantity -= quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        // Tăng số lượng tồn kho (khi hủy đơn hàng)
        public async Task<bool> IncreaseStockAsync(int variantId, int quantity)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null)
            {
                return false;
            }

            variant.StockQuantity += quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        // Lấy tổng số lượng tồn kho của một sản phẩm (tổng tất cả biến thể)
        public async Task<int> GetTotalStockAsync(int productId)
        {
            return await _context.ProductVariants
                .Where(pv => pv.ProductId == productId && pv.IsActive)
                .SumAsync(pv => pv.StockQuantity);
        }

        // Lấy các màu sắc có sẵn cho một sản phẩm
        public async Task<List<Color>> GetAvailableColorsAsync(int productId)
        {
            return await _context.ProductVariants
                .Include(pv => pv.Color)
                .Where(pv => pv.ProductId == productId && pv.IsActive && pv.StockQuantity > 0)
                .Select(pv => pv.Color)
                .Distinct()
                .ToListAsync();
        }

        // Lấy các kích cỡ có sẵn cho một sản phẩm và màu sắc
        public async Task<List<Size>> GetAvailableSizesAsync(int productId, int colorId)
        {
            return await _context.ProductVariants
                .Include(pv => pv.Size)
                .Where(pv => pv.ProductId == productId 
                    && pv.ColorId == colorId 
                    && pv.IsActive 
                    && pv.StockQuantity > 0)
                .Select(pv => pv.Size)
                .Distinct()
                .ToListAsync();
        }

        // Lấy biến thể theo sản phẩm, màu sắc và kích cỡ
        public async Task<ProductVariant?> GetVariantByProductColorSizeAsync(int productId, int colorId, int sizeId)
        {
            return await _context.ProductVariants
                .Include(pv => pv.Product)
                .Include(pv => pv.Color)
                .Include(pv => pv.Size)
                .FirstOrDefaultAsync(pv => pv.ProductId == productId 
                    && pv.ColorId == colorId 
                    && pv.SizeId == sizeId 
                    && pv.IsActive);
        }
    }
}
