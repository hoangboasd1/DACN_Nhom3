using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Models;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/addresses")]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
            _context = context;
        }

        // Tạo địa chỉ mới cho người dùng
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Address>> CreateAddress([FromBody] CreateAddressRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var address = new Address
            {
                UserId = userId.Value,
                AddressText = request.AddressText,
                IsDefault = request.IsDefault
            };

            // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
            if (request.IsDefault)
            {
                var existingAddresses = await _context.Addresses
                    .Where(a => a.UserId == userId.Value)
                    .ToListAsync();

                foreach (var existingAddress in existingAddresses)
                {
                    existingAddress.IsDefault = false;
                }
            }

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
        }

        // Lấy địa chỉ theo ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Address>> GetAddress(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var address = await _context.Addresses
                .Where(a => a.Id == id && a.UserId == userId.Value)
                .FirstOrDefaultAsync();

            if (address == null)
                return NotFound("Không tìm thấy địa chỉ.");

            return address;
        }

        // Lấy tất cả địa chỉ của người dùng hiện tại
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Address>>> GetUserAddresses()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId.Value)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return addresses;
        }

        // Cập nhật địa chỉ
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var address = await _context.Addresses
                .Where(a => a.Id == id && a.UserId == userId.Value)
                .FirstOrDefaultAsync();

            if (address == null)
                return NotFound("Không tìm thấy địa chỉ.");

            address.AddressText = request.AddressText;

            // Nếu đây được đặt làm địa chỉ mặc định
            if (request.IsDefault && !address.IsDefault)
            {
                var existingAddresses = await _context.Addresses
                    .Where(a => a.UserId == userId.Value && a.Id != id)
                    .ToListAsync();

                foreach (var existingAddress in existingAddresses)
                {
                    existingAddress.IsDefault = false;
                }

                address.IsDefault = true;
            }
            else if (!request.IsDefault)
            {
                address.IsDefault = false;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Xóa địa chỉ
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var address = await _context.Addresses
                .Where(a => a.Id == id && a.UserId == userId.Value)
                .FirstOrDefaultAsync();

            if (address == null)
                return NotFound("Không tìm thấy địa chỉ.");

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Đặt địa chỉ làm mặc định
        [HttpPut("{id}/set-default")]
        [Authorize]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized("Không thể xác định người dùng.");

            var address = await _context.Addresses
                .Where(a => a.Id == id && a.UserId == userId.Value)
                .FirstOrDefaultAsync();

            if (address == null)
                return NotFound("Không tìm thấy địa chỉ.");

            // Bỏ mặc định tất cả địa chỉ khác
            var existingAddresses = await _context.Addresses
                .Where(a => a.UserId == userId.Value)
                .ToListAsync();

            foreach (var existingAddress in existingAddresses)
            {
                existingAddress.IsDefault = existingAddress.Id == id;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }

    // Request DTOs
    public class CreateAddressRequest
    {
        public string AddressText { get; set; }
        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressRequest
    {
        public string AddressText { get; set; }
        public bool IsDefault { get; set; }
    }
}
