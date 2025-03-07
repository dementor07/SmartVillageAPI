using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using SmartVillageAPI.Models;
using System.Security.Claims;

namespace SmartVillageAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all published announcements
        [HttpGet]
        public async Task<IActionResult> GetAnnouncements()
        {
            try
            {
                var announcements = await _context.Announcements
                    .Where(a => a.IsPublished && (!a.ExpiresAt.HasValue || a.ExpiresAt > DateTime.UtcNow))
                    .OrderByDescending(a => a.CreatedAt)
                    .Include(a => a.User)
                    .Select(a => new
                    {
                        id = a.Id,
                        title = a.Title,
                        content = a.Content,
                        category = a.Category,
                        createdAt = a.CreatedAt,
                        publishedBy = a.User != null ? a.User.FullName : "Unknown"
                    })
                    .ToListAsync();

                return Ok(announcements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving announcements", error = ex.Message });
            }
        }

        // Get announcement by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnnouncementById(int id)
        {
            try
            {
                var announcement = await _context.Announcements
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (announcement == null)
                    return NotFound(new { message = "Announcement not found" });

                if (announcement.User == null)
                    return BadRequest(new { message = "Announcement data is corrupted" });

                // If not published, only admin can view
                if (!announcement.IsPublished && !User.IsInRole("Admin"))
                    return Forbid();

                return Ok(new
                {
                    id = announcement.Id,
                    title = announcement.Title,
                    content = announcement.Content,
                    category = announcement.Category,
                    createdAt = announcement.CreatedAt,
                    expiresAt = announcement.ExpiresAt,
                    isPublished = announcement.IsPublished,
                    publishedBy = announcement.User.FullName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the announcement", error = ex.Message });
            }
        }

        // Create announcement (admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var announcement = new Announcement
                {
                    UserId = id,
                    Title = model.Title,
                    Content = model.Content,
                    Category = model.Category,
                    IsPublished = model.IsPublished,
                    ExpiresAt = model.ExpiresAt
                };

                _context.Announcements.Add(announcement);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = announcement.Id,
                    message = "Announcement created successfully!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the announcement", error = ex.Message });
            }
        }

        // Update announcement (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] UpdateAnnouncementModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var announcement = await _context.Announcements.FindAsync(id);
                if (announcement == null)
                    return NotFound(new { message = "Announcement not found" });

                announcement.Title = model.Title ?? announcement.Title;
                announcement.Content = model.Content ?? announcement.Content;
                announcement.Category = model.Category ?? announcement.Category;
                announcement.IsPublished = model.IsPublished ?? announcement.IsPublished;
                announcement.ExpiresAt = model.ExpiresAt;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Announcement updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the announcement", error = ex.Message });
            }
        }

        // Delete announcement (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            try
            {
                var announcement = await _context.Announcements.FindAsync(id);
                if (announcement == null)
                    return NotFound(new { message = "Announcement not found" });

                _context.Announcements.Remove(announcement);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Announcement deleted successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the announcement", error = ex.Message });
            }
        }
    }

    public class CreateAnnouncementModel
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required string Category { get; set; }
        public bool IsPublished { get; set; } = true;
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateAnnouncementModel
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Category { get; set; }
        public bool? IsPublished { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}