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
    [Authorize]
    public class ServiceRequestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServiceRequestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all service requests (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRequests()
        {
            try
            {
                var requests = await _context.ServiceRequests
                    .Include(r => r.User)
                    .Select(r => new
                    {
                        id = r.Id,
                        title = r.Title,
                        description = r.Description,
                        category = r.Category,
                        status = r.Status,
                        createdAt = r.CreatedAt,
                        resolvedAt = r.ResolvedAt,
                        userName = r.User != null ? r.User.FullName : "Unknown",
                        userContact = r.User != null ? r.User.MobileNo : "Unknown"
                    })
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving service requests", error = ex.Message });
            }
        }

        // Get my service requests
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var requests = await _context.ServiceRequests
                    .Where(r => r.UserId == id)
                    .Select(r => new
                    {
                        id = r.Id,
                        title = r.Title,
                        description = r.Description,
                        category = r.Category,
                        status = r.Status,
                        resolution = r.Resolution,
                        createdAt = r.CreatedAt,
                        resolvedAt = r.ResolvedAt
                    })
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving your service requests", error = ex.Message });
            }
        }

        // Get service request by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestById(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var request = await _context.ServiceRequests
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                    return NotFound(new { message = "Service request not found" });

                // Only allow admin or the request owner to view details
                if (request.UserId != uid && !User.IsInRole("Admin"))
                    return Forbid();

                if (request.User == null)
                    return BadRequest(new { message = "Service request data is corrupted" });

                return Ok(new
                {
                    id = request.Id,
                    title = request.Title,
                    description = request.Description,
                    category = request.Category,
                    status = request.Status,
                    resolution = request.Resolution,
                    createdAt = request.CreatedAt,
                    resolvedAt = request.ResolvedAt,
                    userName = request.User.FullName,
                    userContact = request.User.MobileNo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the service request", error = ex.Message });
            }
        }

        // Create service request
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var request = new ServiceRequest
                {
                    UserId = id,
                    Title = model.Title,
                    Description = model.Description,
                    Category = model.Category,
                    Status = "Pending"
                };

                _context.ServiceRequests.Add(request);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = request.Id,
                    message = "Service request created successfully!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the service request", error = ex.Message });
            }
        }

        // Update service request status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateStatusModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var request = await _context.ServiceRequests.FindAsync(id);
                if (request == null)
                    return NotFound(new { message = "Service request not found" });

                request.Status = model.Status;

                if (model.Status == "Resolved")
                {
                    request.Resolution = model.Resolution;
                    request.ResolvedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Service request status updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the service request status", error = ex.Message });
            }
        }
    }

    public class CreateRequestModel
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
    }

    public class UpdateStatusModel
    {
        public required string Status { get; set; }
        public string? Resolution { get; set; }
    }
}