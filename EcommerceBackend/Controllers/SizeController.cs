using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SizeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SizeController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Size
        [HttpGet]
        public async Task<ActionResult<List<Size>>> GetSizes()
        {
            var sizes = await _context.Sizes.ToListAsync();
            return Ok(sizes);
        }

        // GET: api/Size/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Size>> GetSize(int id)
        {
            var size = await _context.Sizes.FindAsync(id);
            if (size == null)
            {
                return NotFound(new { message = "Không tìm thấy kích cỡ." });
            }
            return Ok(size);
        }

        // POST: api/Size
        [HttpPost]
        public async Task<ActionResult<Size>> CreateSize([FromBody] Size size)
        {
            if (string.IsNullOrWhiteSpace(size.Name))
            {
                return BadRequest(new { message = "Tên kích cỡ không được để trống." });
            }

            // Kiểm tra tên kích cỡ đã tồn tại chưa
            var existingSize = await _context.Sizes
                .FirstOrDefaultAsync(s => s.Name.ToLower() == size.Name.ToLower());
            
            if (existingSize != null)
            {
                return BadRequest(new { message = "Kích cỡ này đã tồn tại." });
            }

            _context.Sizes.Add(size);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSize), new { id = size.Id }, size);
        }

        // PUT: api/Size/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Size>> UpdateSize(int id, [FromBody] Size updatedSize)
        {
            var size = await _context.Sizes.FindAsync(id);
            if (size == null)
            {
                return NotFound(new { message = "Không tìm thấy kích cỡ." });
            }

            if (string.IsNullOrWhiteSpace(updatedSize.Name))
            {
                return BadRequest(new { message = "Tên kích cỡ không được để trống." });
            }

            // Kiểm tra tên kích cỡ đã tồn tại chưa (trừ kích cỡ hiện tại)
            var existingSize = await _context.Sizes
                .FirstOrDefaultAsync(s => s.Name.ToLower() == updatedSize.Name.ToLower() && s.Id != id);
            
            if (existingSize != null)
            {
                return BadRequest(new { message = "Kích cỡ này đã tồn tại." });
            }

            size.Name = updatedSize.Name;
            size.Code = updatedSize.Code;
            size.Description = updatedSize.Description;

            await _context.SaveChangesAsync();
            return Ok(size);
        }

        // DELETE: api/Size/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSize(int id)
        {
            var size = await _context.Sizes.FindAsync(id);
            if (size == null)
            {
                return NotFound(new { message = "Không tìm thấy kích cỡ." });
            }

            // Kiểm tra xem kích cỡ có đang được sử dụng trong biến thể sản phẩm không
            var isUsed = await _context.ProductVariants
                .AnyAsync(pv => pv.SizeId == id);

            if (isUsed)
            {
                return BadRequest(new { message = "Không thể xóa kích cỡ này vì đang được sử dụng trong sản phẩm." });
            }

            _context.Sizes.Remove(size);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa kích cỡ thành công." });
        }
    }
}
