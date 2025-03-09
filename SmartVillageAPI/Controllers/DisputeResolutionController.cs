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
    public class DisputeResolutionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DisputeResolutionController> _logger;

        public DisputeResolutionController(ApplicationDbContext context, ILogger<DisputeResolutionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get dispute types
        [HttpGet("dispute-types")]
        public IActionResult GetDisputeTypes()
        {
            var disputeTypes = new List<string>
            {
                "Land Dispute",
                "Property Boundary Dispute",
                "Inheritance Dispute",
                "Family Dispute",
                "Neighborhood Dispute",
                "Water Rights Dispute",
                "Tenant-Landlord Dispute",
                "Commercial Dispute",
                "Consumer Dispute",
                "Other"
            };

            return Ok(disputeTypes);
        }

        // Get all dispute resolution cases (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCases([FromQuery] string? status)
        {
            try
            {
                var query = _context.DisputeResolutions
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
                        disputeType = d.DisputeType,
                        partiesInvolved = d.PartiesInvolved,
                        location = d.Location,
                        status = d.Status,
                        mediaterAssigned = d.MediaterAssigned,
                        hearingDate = d.HearingDate,
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
                _logger.LogError(ex, "Error occurred while retrieving dispute resolution cases");
                return StatusCode(500, new { message = "An error occurred while retrieving cases" });
            }
        }

        // Get my dispute resolution cases
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

                var cases = await _context.DisputeResolutions
                    .Where(d => d.UserId == id)
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        id = d.Id,
                        title = d.Title,
                        disputeType = d.DisputeType,
                        partiesInvolved = d.PartiesInvolved,
                        location = d.Location,
                        status = d.Status,
                        mediaterAssigned = d.MediaterAssigned,
                        hearingDate = d.HearingDate,
                        referenceNumber = d.ReferenceNumber,
                        createdAt = d.CreatedAt,
                        resolvedAt = d.ResolvedAt
                    })
                    .ToListAsync();

                return Ok(cases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user's dispute resolution cases");
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

                var disputeCase = await _context.DisputeResolutions
                    .Include(d => d.User)
                    .Include(d => d.ReviewedByUser)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (disputeCase == null)
                {
                    return NotFound(new { message = "Case not found" });
                }

                // Only allow admin or the case owner to view details
                if (disputeCase.UserId != uid && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                return Ok(new
                {
                    id = disputeCase.Id,
                    title = disputeCase.Title,
                    description = disputeCase.Description,
                    disputeType = disputeCase.DisputeType,
                    partiesInvolved = disputeCase.PartiesInvolved,
                    location = disputeCase.Location,
                    disputeDate = disputeCase.DisputeDate,
                    priorResolutionAttempts = disputeCase.PriorResolutionAttempts,
                    status = disputeCase.Status,
                    resolution = disputeCase.Resolution,
                    mediaterAssigned = disputeCase.MediaterAssigned,
                    hearingDate = disputeCase.HearingDate,
                    referenceNumber = disputeCase.ReferenceNumber,
                    createdAt = disputeCase.CreatedAt,
                    resolvedAt = disputeCase.ResolvedAt,
                    reviewedBy = disputeCase.ReviewedByUser != null ? disputeCase.ReviewedByUser.FullName : null,
                    documentData = disputeCase.DocumentData,
                    userName = disputeCase.User?.FullName,
                    userContact = disputeCase.User?.MobileNo,
                    userEmail = disputeCase.User?.EmailId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving dispute resolution case details for ID: {CaseId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving case details" });
            }
        }

        // Create a new dispute resolution case
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCase([FromBody] CreateDisputeResolutionModel model)
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
                string referenceNumber = GenerateReferenceNumber(model.DisputeType);

                // Create new case
                var disputeCase = new DisputeResolution
                {
                    UserId = id,
                    Title = model.Title,
                    Description = model.Description,
                    DisputeType = model.DisputeType,
                    PartiesInvolved = model.PartiesInvolved,
                    Location = model.Location,
                    DisputeDate = model.DisputeDate,
                    PriorResolutionAttempts = model.PriorResolutionAttempts,
                    Status = "Pending",
                    ReferenceNumber = referenceNumber,
                    CreatedAt = DateTime.UtcNow,
                    DocumentData = model.DocumentData
                };

                _context.DisputeResolutions.Add(disputeCase);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = disputeCase.Id,
                    referenceNumber = disputeCase.ReferenceNumber,
                    message = "Dispute resolution case submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating dispute resolution case");
                return StatusCode(500, new { message = "An error occurred while submitting your case" });
            }
        }

        // Update case status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCaseStatus(int id, [FromBody] UpdateDisputeStatusModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var disputeCase = await _context.DisputeResolutions.FindAsync(id);
                if (disputeCase == null)
                {
                    return NotFound(new { message = "Case not found" });
                }

                // Validate the new status
                if (model.Status != "In Review" && model.Status != "Scheduled" &&
                    model.Status != "In Progress" && model.Status != "Resolved" && model.Status != "Rejected")
                {
                    return BadRequest(new { message = "Invalid status provided" });
                }

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out int reviewerId))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                disputeCase.Status = model.Status;
                disputeCase.ReviewedByUserId = reviewerId;

                if (model.Status == "Scheduled" && model.HearingDate.HasValue)
                {
                    disputeCase.HearingDate = model.HearingDate;
                }

                if (model.Status == "Resolved" || model.Status == "Rejected")
                {
                    disputeCase.ResolvedAt = DateTime.UtcNow;
                    disputeCase.Resolution = model.Resolution;
                }

                if (!string.IsNullOrEmpty(model.MediaterAssigned))
                {
                    disputeCase.MediaterAssigned = model.MediaterAssigned;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Case status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating dispute resolution case status for ID: {CaseId}", id);
                return StatusCode(500, new { message = "An error occurred while updating case status" });
            }
        }

        // Helper method to generate reference number
        private string GenerateReferenceNumber(string disputeType)
        {
            // Extract first 3 characters from dispute type and remove spaces
            string prefix = new string(disputeType.Replace(" ", "").Take(3).ToArray()).ToUpper();

            // Format: DR-{Prefix}-{Year}{Month}{Day}-{Random 4 digits}
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();

            return $"DR-{prefix}-{dateComponent}-{randomComponent}";
        }
    }

    // Model for creating a dispute resolution case
    public class CreateDisputeResolutionModel
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string DisputeType { get; set; }
        public required string PartiesInvolved { get; set; }
        public string? Location { get; set; }
        public DateTime DisputeDate { get; set; } = DateTime.UtcNow;
        public string? PriorResolutionAttempts { get; set; }
        public string? DocumentData { get; set; }
    }

    // Model for updating case status
    public class UpdateDisputeStatusModel
    {
        public required string Status { get; set; } // In Review, Scheduled, In Progress, Resolved, Rejected
        public DateTime? HearingDate { get; set; }
        public string? MediaterAssigned { get; set; }
        public string? Resolution { get; set; }
    }
}