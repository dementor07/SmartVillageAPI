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
    public class SchemeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SchemeController> _logger;

        public SchemeController(ApplicationDbContext context, ILogger<SchemeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get all active schemes (public endpoint)
        [HttpGet]
        public async Task<IActionResult> GetSchemes([FromQuery] string? category)
        {
            try
            {
                var query = _context.Schemes
                    .Where(s => s.IsActive);

                // Filter by category if provided
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(s => s.Category == category);
                }

                var schemes = await query
                    .Select(s => new
                    {
                        id = s.Id,
                        name = s.Name,
                        description = s.Description,
                        category = s.Category,
                        benefits = s.Benefits,
                        department = s.Department,
                        moreInfoUrl = s.MoreInfoUrl
                    })
                    .ToListAsync();

                return Ok(schemes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving schemes");
                return StatusCode(500, new { message = "An error occurred while retrieving schemes" });
            }
        }

        // Get scheme by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSchemeById(int id)
        {
            try
            {
                var scheme = await _context.Schemes
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);

                if (scheme == null)
                    return NotFound(new { message = "Scheme not found" });

                return Ok(new
                {
                    id = scheme.Id,
                    name = scheme.Name,
                    description = scheme.Description,
                    category = scheme.Category,
                    eligibilityCriteria = scheme.EligibilityCriteria,
                    formFields = scheme.FormFields,
                    benefits = scheme.Benefits,
                    requiredDocuments = scheme.RequiredDocuments,
                    department = scheme.Department,
                    moreInfoUrl = scheme.MoreInfoUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving scheme details for ID: {SchemeId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the scheme" });
            }
        }

        // Get scheme categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.Schemes
                    .Where(s => s.IsActive)
                    .Select(s => s.Category)
                    .Distinct()
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving scheme categories");
                return StatusCode(500, new { message = "An error occurred while retrieving scheme categories" });
            }
        }

        // Create a new scheme application
        [HttpPost("apply")]
        [Authorize]
        public async Task<IActionResult> ApplyForScheme([FromBody] CreateSchemeApplicationModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                // Check if scheme exists
                var scheme = await _context.Schemes.FindAsync(model.SchemeId);
                if (scheme == null || !scheme.IsActive)
                    return BadRequest(new { message = "Invalid scheme selected" });

                // Generate reference number
                string referenceNumber = GenerateReferenceNumber(scheme.Name);

                // Create new application
                var application = new SchemeApplication
                {
                    SchemeId = model.SchemeId,
                    UserId = id,
                    ApplicationData = model.ApplicationData,
                    Status = "Pending",
                    ReferenceNumber = referenceNumber,
                    CreatedAt = DateTime.UtcNow,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.SchemeApplications.Add(application);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = application.Id,
                    referenceNumber = application.ReferenceNumber,
                    message = "Application submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating scheme application");
                return StatusCode(500, new { message = "An error occurred while submitting your application" });
            }
        }

        // Get user's scheme applications
        [HttpGet("my-applications")]
        [Authorize]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var applications = await _context.SchemeApplications
                    .Include(a => a.Scheme)
                    .Where(a => a.UserId == id)
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        schemeName = a.Scheme!.Name,
                        schemeCategory = a.Scheme!.Category,
                        referenceNumber = a.ReferenceNumber,
                        status = a.Status,
                        submittedAt = a.SubmittedAt,
                        reviewedAt = a.ReviewedAt,
                        notes = a.Notes
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user's scheme applications");
                return StatusCode(500, new { message = "An error occurred while retrieving your applications" });
            }
        }

        // Get specific application details
        [HttpGet("applications/{id}")]
        [Authorize]
        public async Task<IActionResult> GetApplicationDetails(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var application = await _context.SchemeApplications
                    .Include(a => a.Scheme)
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (application == null)
                    return NotFound(new { message = "Application not found" });

                // Only allow admin or the application owner to view details
                if (application.UserId != uid && !User.IsInRole("Admin"))
                    return Forbid();

                return Ok(new
                {
                    id = application.Id,
                    schemeId = application.SchemeId,
                    schemeName = application.Scheme!.Name,
                    schemeCategory = application.Scheme!.Category,
                    referenceNumber = application.ReferenceNumber,
                    applicationData = application.ApplicationData,
                    status = application.Status,
                    submittedAt = application.SubmittedAt,
                    reviewedAt = application.ReviewedAt,
                    notes = application.Notes,
                    applicantName = application.User!.FullName,
                    applicantEmail = application.User!.EmailId,
                    applicantMobile = application.User!.MobileNo
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving application details for ID: {ApplicationId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the application details" });
            }
        }

        // Admin: Get all applications
        [HttpGet("admin/applications")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllApplications([FromQuery] string? status, [FromQuery] int? schemeId)
        {
            try
            {
                var query = _context.SchemeApplications
                    .Include(a => a.Scheme)
                    .Include(a => a.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(a => a.Status == status);
                }

                if (schemeId.HasValue)
                {
                    query = query.Where(a => a.SchemeId == schemeId.Value);
                }

                var applications = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        schemeName = a.Scheme!.Name,
                        schemeCategory = a.Scheme!.Category,
                        referenceNumber = a.ReferenceNumber,
                        status = a.Status,
                        submittedAt = a.SubmittedAt,
                        reviewedAt = a.ReviewedAt,
                        applicantName = a.User!.FullName,
                        applicantContact = a.User!.MobileNo
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving all scheme applications");
                return StatusCode(500, new { message = "An error occurred while retrieving applications" });
            }
        }

        // Admin: Update application status
        [HttpPut("admin/applications/{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var application = await _context.SchemeApplications.FindAsync(id);
                if (application == null)
                    return NotFound(new { message = "Application not found" });

                // Validate state transition
                if (application.Status != "Pending")
                    return BadRequest(new { message = "Only applications with 'Pending' status can be updated" });

                // Validate the new status
                if (model.Status != "Approved" && model.Status != "Rejected")
                    return BadRequest(new { message = "Status must be either 'Approved' or 'Rejected'" });

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out int reviewerId))
                    return Unauthorized(new { message = "Invalid or expired token" });

                application.Status = model.Status;
                application.Notes = model.Notes;
                application.ReviewedAt = DateTime.UtcNow;
                application.ReviewedByUserId = reviewerId;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Application status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating application status for ID: {ApplicationId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the application status" });
            }
        }

        // Admin: Create new scheme
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateScheme([FromBody] CreateSchemeModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scheme = new Scheme
                {
                    Name = model.Name,
                    Description = model.Description,
                    Category = model.Category,
                    EligibilityCriteria = model.EligibilityCriteria,
                    FormFields = model.FormFields,
                    Benefits = model.Benefits,
                    RequiredDocuments = model.RequiredDocuments,
                    Department = model.Department,
                    MoreInfoUrl = model.MoreInfoUrl,
                    IsActive = model.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Schemes.Add(scheme);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = scheme.Id,
                    message = "Scheme created successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating scheme");
                return StatusCode(500, new { message = "An error occurred while creating the scheme" });
            }
        }

        // Admin: Update scheme
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateScheme(int id, [FromBody] UpdateSchemeModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var scheme = await _context.Schemes.FindAsync(id);
                if (scheme == null)
                    return NotFound(new { message = "Scheme not found" });

                // Update fields if provided
                if (!string.IsNullOrEmpty(model.Name))
                    scheme.Name = model.Name;
                if (!string.IsNullOrEmpty(model.Description))
                    scheme.Description = model.Description;
                if (!string.IsNullOrEmpty(model.Category))
                    scheme.Category = model.Category;
                if (!string.IsNullOrEmpty(model.EligibilityCriteria))
                    scheme.EligibilityCriteria = model.EligibilityCriteria;
                if (!string.IsNullOrEmpty(model.FormFields))
                    scheme.FormFields = model.FormFields;
                if (!string.IsNullOrEmpty(model.Benefits))
                    scheme.Benefits = model.Benefits;
                if (!string.IsNullOrEmpty(model.RequiredDocuments))
                    scheme.RequiredDocuments = model.RequiredDocuments;
                if (!string.IsNullOrEmpty(model.Department))
                    scheme.Department = model.Department;
                if (!string.IsNullOrEmpty(model.MoreInfoUrl))
                    scheme.MoreInfoUrl = model.MoreInfoUrl;
                if (model.IsActive.HasValue)
                    scheme.IsActive = model.IsActive.Value;

                scheme.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Scheme updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating scheme for ID: {SchemeId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the scheme" });
            }
        }

        // Helper method to generate reference number
        private string GenerateReferenceNumber(string schemeName)
        {
            // Extract first 3 characters from scheme name
            string prefix = new string(schemeName.Take(3).ToArray()).ToUpper();

            // Format: {Prefix}-{Year}{Month}{Day}-{Random 4 digits}
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();

            return $"{prefix}-{dateComponent}-{randomComponent}";
        }
    }

    // Model for creating a scheme application
    public class CreateSchemeApplicationModel
    {
        public required int SchemeId { get; set; }
        public required string ApplicationData { get; set; }
    }

    // Model for updating application status
    public class UpdateApplicationStatusModel
    {
        public required string Status { get; set; } // Approved or Rejected
        public string? Notes { get; set; }
    }

    // Model for creating a scheme (admin only)
    public class CreateSchemeModel
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
        public string EligibilityCriteria { get; set; } = string.Empty;
        public string FormFields { get; set; } = string.Empty;
        public string Benefits { get; set; } = string.Empty;
        public string RequiredDocuments { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? MoreInfoUrl { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // Model for updating a scheme (admin only)
    public class UpdateSchemeModel
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string? EligibilityCriteria { get; set; }
        public string? FormFields { get; set; }
        public string? Benefits { get; set; }
        public string? RequiredDocuments { get; set; }
        public string? Department { get; set; }
        public string? MoreInfoUrl { get; set; }
        public bool? IsActive { get; set; }
    }
}