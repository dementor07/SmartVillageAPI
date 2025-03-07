using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using SmartVillageAPI.Models;
using SmartVillageAPI.Models.Auth;
using SmartVillageAPI.Services;
using System.Security.Claims;
using System.Security.Cryptography;

namespace SmartVillageAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public UserController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // Register new user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.EmailId == model.EmailId))
                return BadRequest(new { message = "Email is already registered." });

            // Generate salt
            byte[] salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // Hash password
            string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: model.Password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            // Create new user
            var user = new User
            {
                FullName = model.FullName,
                EmailId = model.EmailId,
                MobileNo = model.MobileNo,
                State = model.State,
                District = model.District,
                Village = model.Village,
                Address = model.Address,
                PasswordHash = hashedPassword,
                PasswordSalt = Convert.ToBase64String(salt),
                RoleName = "Resident" // Default role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful!" });
        }

        // User login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailId == model.EmailId);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            // Verify password
            byte[] salt = Convert.FromBase64String(user.PasswordSalt);
            string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: model.Password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            if (hashedPassword != user.PasswordHash)
                return Unauthorized(new { message = "Invalid email or password." });

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.EmailId,
                role = user.RoleName,
                token = token
            });
        }

        // Get user profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.EmailId,
                mobileNo = user.MobileNo,
                state = user.State,
                district = user.District,
                village = user.Village,
                address = user.Address,
                role = user.RoleName,
                createdAt = user.CreatedAt,
                lastLogin = user.LastLoginAt
            });
        }

        // Update user profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Update fields
            user.FullName = model.FullName ?? user.FullName;
            user.MobileNo = model.MobileNo ?? user.MobileNo;
            user.Address = model.Address ?? user.Address;

            // Only update if provided
            if (!string.IsNullOrEmpty(model.State))
                user.State = model.State;
            if (!string.IsNullOrEmpty(model.District))
                user.District = model.District;
            if (!string.IsNullOrEmpty(model.Village))
                user.Village = model.Village;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully!" });
        }
    }

    public class UpdateProfileModel
    {
        public string? FullName { get; set; }
        public string? MobileNo { get; set; }
        public string? State { get; set; }
        public string? District { get; set; }
        public string? Village { get; set; }
        public string? Address { get; set; }
    }
}