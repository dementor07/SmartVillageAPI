using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using SmartVillageAPI.Models;
using System.Security.Claims;
using System.Text.Json;

namespace SmartVillageAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CertificateController> _logger;
        private readonly IWebHostEnvironment _environment;

        public CertificateController(
            ApplicationDbContext context,
            ILogger<CertificateController> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        // Helper method to get current user ID
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }

        // Generate unique reference number
        private string GenerateReferenceNumber()
        {
            string prefix = "CERT";
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();
            return $"{prefix}-{dateComponent}-{randomComponent}";
        }

        // Validate certificate application based on type
        private void ValidateCertificateApplication(Certificate certificate)
        {
            switch (certificate.CertificateType)
            {
                case CertificateType.IncomeCertificate:
                    if (string.IsNullOrWhiteSpace(certificate.AnnualIncome))
                        throw new ValidationException("Annual Income is required for Income Certificate");
                    break;

                case CertificateType.CasteCertificate:
                    if (string.IsNullOrWhiteSpace(certificate.Caste))
                        throw new ValidationException("Caste is required for Caste Certificate");
                    break;

                case CertificateType.FamilyMembershipCertificate:
                    if (string.IsNullOrWhiteSpace(certificate.FamilyMemberName) ||
                        string.IsNullOrWhiteSpace(certificate.Relationship))
                        throw new ValidationException("Family Member Name and Relationship are required for Family Membership Certificate");
                    break;
            }

            // Validate document upload for all certificate types
            if (string.IsNullOrWhiteSpace(certificate.DocumentContent))
                throw new ValidationException("Supporting document is required");
        }

        // Get all certificates (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCertificates(
            [FromQuery] CertificateType? type = null,
            [FromQuery] CertificateStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Certificates
                    .Include(c => c.User)
                    .AsQueryable();

                if (type.HasValue)
                    query = query.Where(c => c.CertificateType == type.Value);

                if (status.HasValue)
                    query = query.Where(c => c.Status == status.Value);

                var totalCount = await query.CountAsync();

                var certificates = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        id = c.Id,
                        referenceNumber = c.ReferenceNumber,
                        certificateType = c.CertificateType,
                        applicantName = c.ApplicantName,
                        status = c.Status,
                        createdAt = c.CreatedAt,
                        userName = c.User != null ? c.User.FullName : "Unknown"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = certificates,
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving certificates");
                return StatusCode(500, new { message = "Error retrieving certificates" });
            }
        }

        // Get user's certificates
        [HttpGet("my-certificates")]
        public async Task<IActionResult> GetMyCertificates(
            [FromQuery] CertificateType? type = null,
            [FromQuery] CertificateStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = GetCurrentUserId();

                var query = _context.Certificates
                    .Where(c => c.UserId == userId);

                if (type.HasValue)
                    query = query.Where(c => c.CertificateType == type.Value);

                if (status.HasValue)
                    query = query.Where(c => c.Status == status.Value);

                var totalCount = await query.CountAsync();

                var certificates = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        id = c.Id,
                        referenceNumber = c.ReferenceNumber,
                        certificateType = c.CertificateType,
                        status = c.Status,
                        createdAt = c.CreatedAt,
                        lastUpdatedAt = c.LastUpdatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = certificates,
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user certificates");
                return StatusCode(500, new { message = "Error retrieving certificates" });
            }
        }

        // Get certificate details
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCertificateDetails(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                var certificate = await _context.Certificates
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (certificate == null)
                    return NotFound(new { message = "Certificate not found" });

                // Check authorization
                if (!isAdmin && certificate.UserId != userId)
                    return Forbid();

                // Remove sensitive document content for non-admin users
                if (!isAdmin)
                {
                    certificate.DocumentContent = null;
                }

                return Ok(certificate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving certificate {id}");
                return StatusCode(500, new { message = "Error retrieving certificate details" });
            }
        }

        // Create certificate application
        [HttpPost]
        public async Task<IActionResult> CreateCertificate([FromBody] Certificate model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetCurrentUserId();

                // Validate certificate type-specific requirements
                ValidateCertificateApplication(model);

                // Prepare certificate object
                var certificate = new Certificate
                {
                    UserId = userId,
                    CertificateType = model.CertificateType,
                    ApplicantName = model.ApplicantName,
                    Gender = model.Gender,
                    Age = model.Age,
                    Address = model.Address,
                    FatherName = model.FatherName,

                    // Copy type-specific fields
                    AnnualIncome = model.AnnualIncome,
                    Caste = model.Caste,
                    FamilyMemberName = model.FamilyMemberName,
                    Relationship = model.Relationship,

                    // Document details
                    DocumentFileName = model.DocumentFileName,
                    DocumentFileSize = model.DocumentFileSize,
                    DocumentFileType = model.DocumentFileType,
                    DocumentContent = model.DocumentContent,

                    // Set initial status
                    Status = CertificateStatus.Pending,
                    ReferenceNumber = GenerateReferenceNumber()
                };

                _context.Certificates.Add(certificate);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Certificate application created: {certificate.Id}");

                return Ok(new
                {
                    id = certificate.Id,
                    referenceNumber = certificate.ReferenceNumber,
                    message = "Certificate application submitted successfully"
                });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating certificate application");
                return StatusCode(500, new { message = "Error submitting certificate application" });
            }
        }

        // Update certificate status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCertificateStatus(
            int id,
            [FromBody] Certificate statusUpdate)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var certificate = await _context.Certificates.FindAsync(id);

                if (certificate == null)
                    return NotFound(new { message = "Certificate not found" });

                // Validate status transition
                if (certificate.Status == CertificateStatus.Approved ||
                    certificate.Status == CertificateStatus.Rejected)
                {
                    return BadRequest(new { message = "Cannot modify a finalized certificate" });
                }

                // Update status and related fields
                certificate.Status = statusUpdate.Status;
                certificate.RejectionReason = statusUpdate.RejectionReason;
                certificate.ApprovalComments = statusUpdate.ApprovalComments;
                certificate.ReviewedAt = DateTime.UtcNow;
                certificate.LastUpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Certificate {id} status updated to {certificate.Status}");

                return Ok(new
                {
                    message = "Certificate status updated successfully",
                    status = certificate.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating certificate {id} status");
                return StatusCode(500, new { message = "Error updating certificate status" });
            }
        }

        // Get available certificate types
        [HttpGet("types")]
        public IActionResult GetCertificateTypes()
        {
            return Ok(Enum.GetValues(typeof(CertificateType))
                .Cast<CertificateType>()
                .Select(t => new
                {
                    value = (int)t,
                    name = t.ToString(),
                    displayName = GetCertificateTypeDisplayName(t)
                }));
        }

        // Helper method to get user-friendly certificate type names
        private string GetCertificateTypeDisplayName(CertificateType type)
        {
            return type switch
            {
                CertificateType.NonCreamyLayerCertificate => "Non-Creamy Layer Certificate",
                CertificateType.FamilyMembershipCertificate => "Family Membership Certificate",
                CertificateType.RelationshipCertificate => "Relationship Certificate",
                CertificateType.DomicileCertificate => "Domicile Certificate",
                CertificateType.CommunityCertificate => "Community Certificate",
                CertificateType.NativityCertificate => "Nativity Certificate",
                CertificateType.IncomeCertificate => "Income Certificate",
                CertificateType.CasteCertificate => "Caste Certificate",
                CertificateType.IdentificationCertificate => "Identification Certificate",
                _ => type.ToString()
            };
        }
    }

    // Custom exception for validation errors
    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
    }
}