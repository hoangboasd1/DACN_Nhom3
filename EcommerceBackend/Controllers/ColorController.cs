using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ColorController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Color
        [HttpGet]
        public async Task<ActionResult<List<Color>>> GetColors()
        {
            var colors = await _context.Colors.ToListAsync();
            return Ok(colors);
        }

        // GET: api/Color/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Color>> GetColor(int id)
        {
            var color = await _context.Colors.FindAsync(id);
            if (color == null)
            {
                return NotFound(new { message = "Không tìm thấy màu sắc." });
            }
            return Ok(color);
        }

        // POST: api/Color
        [HttpPost]
        public async Task<ActionResult<Color>> CreateColor([FromBody] Color color)
        {
            if (string.IsNullOrWhiteSpace(color.Name))
            {
                return BadRequest(new { message = "Tên màu sắc không được để trống." });
            }

            // Kiểm tra hex code đã tồn tại chưa (ưu tiên hex code hơn tên)
            if (!string.IsNullOrWhiteSpace(color.HexCode))
            {
                var existingColorByHex = await _context.Colors
                    .FirstOrDefaultAsync(c => c.HexCode != null && c.HexCode.ToLower() == color.HexCode.ToLower());
                
                if (existingColorByHex != null)
                {
                    return Ok(existingColorByHex); // Trả về màu đã tồn tại
                }
            }

            // Kiểm tra tên màu đã tồn tại chưa (chỉ khi hex code khác nhau)
            var existingColorByName = await _context.Colors
                .FirstOrDefaultAsync(c => c.Name.ToLower() == color.Name.ToLower() && 
                                    (c.HexCode == null || (color.HexCode != null && c.HexCode.ToLower() != color.HexCode.ToLower())));
            
            if (existingColorByName != null)
            {
                // Tạo tên mới với số thứ tự
                var counter = 1;
                var newName = color.Name;
                while (await _context.Colors.AnyAsync(c => c.Name.ToLower() == newName.ToLower()))
                {
                    newName = $"{color.Name} {counter}";
                    counter++;
                }
                color.Name = newName;
            }

            _context.Colors.Add(color);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetColor), new { id = color.Id }, color);
        }

        // PUT: api/Color/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Color>> UpdateColor(int id, [FromBody] Color updatedColor)
        {
            var color = await _context.Colors.FindAsync(id);
            if (color == null)
            {
                return NotFound(new { message = "Không tìm thấy màu sắc." });
            }

            if (string.IsNullOrWhiteSpace(updatedColor.Name))
            {
                return BadRequest(new { message = "Tên màu sắc không được để trống." });
            }

            // Kiểm tra tên màu đã tồn tại chưa (trừ màu hiện tại)
            var existingColor = await _context.Colors
                .FirstOrDefaultAsync(c => c.Name.ToLower() == updatedColor.Name.ToLower() && c.Id != id);
            
            if (existingColor != null)
            {
                return BadRequest(new { message = "Màu sắc này đã tồn tại." });
            }

            color.Name = updatedColor.Name;
            color.HexCode = updatedColor.HexCode;
            color.Description = updatedColor.Description;

            await _context.SaveChangesAsync();
            return Ok(color);
        }

        // DELETE: api/Color/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteColor(int id)
        {
            var color = await _context.Colors.FindAsync(id);
            if (color == null)
            {
                return NotFound(new { message = "Không tìm thấy màu sắc." });
            }

            // Kiểm tra xem màu có đang được sử dụng trong biến thể sản phẩm không
            var isUsed = await _context.ProductVariants
                .AnyAsync(pv => pv.ColorId == id);

            if (isUsed)
            {
                return BadRequest(new { message = "Không thể xóa màu sắc này vì đang được sử dụng trong sản phẩm." });
            }

            _context.Colors.Remove(color);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa màu sắc thành công." });
        }
    }
}
