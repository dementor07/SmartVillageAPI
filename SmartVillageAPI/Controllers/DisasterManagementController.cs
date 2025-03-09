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
    public class DisasterManagementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DisasterManagementController> _logger;

        public DisasterManagementController(ApplicationDbContext context, ILogger<DisasterManagementController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get disaster types
        [HttpGet("disaster-types")]
        public IActionResult GetDisasterTypes()
        {
            var disasterTypes = new List<string>
            {
                "Flood",
                "Drought",
                "Cyclone",
                "Earthquake",
                "Landslide",
                "Fire",
                "Chemical Spill",
                "Building Collapse",
                "Disease Outbreak",
                "Other"
            };

            return Ok(disasterTypes);
        }

        // Get all disaster management cases (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCases([FromQuery] string? status)
        {
            try
            {
                var query = _context.DisasterManagements
                    .Include(d => d.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(d => d.Status == status);
                }

                var cases = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        id = d.Id,
                        title = d.Title,
                        disasterType = d.DisasterType,
                        location = d.Location,
                        occurrenceDate = d.OccurrenceDate,
                        severity = d.Severity,
                        status = d.Status,
                        assignedTeam = d.AssignedTeam,
                        referenceNumber = d.ReferenceNumber,
                        createdAt = d.CreatedAt,
                        resolvedAt = d.ResolvedAt,
                        userName = d.User != null ? d.User.FullName : "Unknown",
                        userContact = d.User != null ? d.User.MobileNo : "Unknown"
                    })
                    .ToListAsync();

                return Ok(cases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving disaster management cases");
                return StatusCode(500, new { message = "An error occurred while retrieving cases" });
            }
        }

        // Get my disaster management cases
        [HttpGet("my-cases")]
        [Authorize]
        public async Task<IActionResult> GetMyCases()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var cases = await _context.DisasterManagements
                    .Where(d => d.UserId == id)
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        id = d.Id,
                        title = d.Title,
                        disasterType = d.DisasterType,
                        location = d.Location,
                        occurrenceDate = d.OccurrenceDate,
                        severity = d.Severity,
                        status = d.Status,
                        assignedTeam = d.AssignedTeam,
                        referenceNumber = d.ReferenceNumber,
                        createdAt = d.CreatedAt,
                        resolvedAt = d.ResolvedAt
                    })
                    .ToListAsync();

                return Ok(cases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user's disaster management cases");
                return StatusCode(500, new { message = "An error occurred while retrieving your cases" });
            }
        }

        // Get case by ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetCaseById(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var disasterCase = await _context.DisasterManagements
                    .Include(d => d.User)
                    .Include(d => d.ReviewedByUser)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (disasterCase == null)
                {
                    return NotFound(new { message = "Case not found" });
                }

                // Only allow admin or the case owner to view details
                if (disasterCase.UserId != uid && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                return Ok(new
                {
                    id = disasterCase.Id,
                    title = disasterCase.Title,
                    description = disasterCase.Description,
                    disasterType = disasterCase.DisasterType,
                    location = disasterCase.Location,
                    occurrenceDate = disasterCase.OccurrenceDate,
                    severity = disasterCase.Severity,
                    impactedArea = disasterCase.ImpactedArea,
                    affectedCount = disasterCase.AffectedCount,
                    status = disasterCase.Status,
                    response = disasterCase.Response,
                    assignedTeam = disasterCase.AssignedTeam,
                    referenceNumber = disasterCase.ReferenceNumber,
                    createdAt = disasterCase.CreatedAt,
                    resolvedAt = disasterCase.ResolvedAt,
                    reviewedBy = disasterCase.ReviewedByUser != null ? disasterCase.ReviewedByUser.FullName : null,
                    imageData = disasterCase.ImageData,
                    userName = disasterCase.User?.FullName,
                    userContact = disasterCase.User?.MobileNo,
                    userEmail = disasterCase.User?.EmailId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving disaster management case details for ID: {CaseId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving case details" });
            }
        }

        // Create a new disaster management case
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCase([FromBody] CreateDisasterManagementModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                // Generate reference number
                string referenceNumber = GenerateReferenceNumber(model.DisasterType);

                // Create new case
                var disasterCase = new DisasterManagement
                {
                    UserId = id,
                    Title = model.Title,
                    Description = model.Description,
                    DisasterType = model.DisasterType,
                    Location = model.Location,
                    OccurrenceDate = model.OccurrenceDate,
                    Severity = model.Severity,
                    ImpactedArea = model.ImpactedArea,
                    AffectedCount = model.AffectedCount,
                    Status = "Pending",
                    ReferenceNumber = referenceNumber,
                    CreatedAt = DateTime.UtcNow,
                    ImageData = model.ImageData
                };

                _context.DisasterManagements.Add(disasterCase);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = disasterCase.Id,
                    referenceNumber = disasterCase.ReferenceNumber,
                    message = "Disaster management case submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating disaster management case");
                return StatusCode(500, new { message = "An error occurred while submitting your case" });
            }
        }

        // Update case status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCaseStatus(int id, [FromBody] UpdateDisasterStatusModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var disasterCase = await _context.DisasterManagements.FindAsync(id);
                if (disasterCase == null)
                {
                    return NotFound(new { message = "Case not found" });
                }

                // Validate the new status
                if (model.Status != "In Progress" && model.Status != "Resolved" &&
                    model.Status != "Monitoring" && model.Status != "Rejected")
                {
                    return BadRequest(new { message = "Invalid status provided" });
                }

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out int reviewerId))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                disasterCase.Status = model.Status;
                disasterCase.ReviewedByUserId = reviewerId;

                if (model.Status == "Resolved")
                {
                    disasterCase.ResolvedAt = DateTime.UtcNow;
                    disasterCase.Response = model.Response;
                }

                if (!string.IsNullOrEmpty(model.AssignedTeam))
                {
                    disasterCase.AssignedTeam = model.AssignedTeam;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Case status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating disaster management case status for ID: {CaseId}", id);
                return StatusCode(500, new { message = "An error occurred while updating case status" });
            }
        }

        // Helper method to generate reference number
        private string GenerateReferenceNumber(string disasterType)
        {
            // Extract first 3 characters from disaster type and remove spaces
            string prefix = new string(disasterType.Replace(" ", "").Take(3).ToArray()).ToUpper();

            // Format: DM-{Prefix}-{Year}{Month}{Day}-{Random 4 digits}
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();

            return $"DM-{prefix}-{dateComponent}-{randomComponent}";
        }
    }

    // Model for creating a disaster management case
    public class CreateDisasterManagementModel
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string DisasterType { get; set; }
        public required string Location { get; set; }
        public DateTime OccurrenceDate { get; set; } = DateTime.UtcNow;
        public string? Severity { get; set; }
        public string? ImpactedArea { get; set; }
        public string? AffectedCount { get; set; }
        public string? ImageData { get; set; }
    }

    // Model for updating case status
    public class UpdateDisasterStatusModel
    {
        public required string Status { get; set; } // In Progress, Monitoring, Resolved, Rejected
        public string? Response { get; set; }
        public string? AssignedTeam { get; set; }
    }
}