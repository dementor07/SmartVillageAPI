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
    public class CertificateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CertificateController> _logger;

        public CertificateController(ApplicationDbContext context, ILogger<CertificateController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get all certificates (admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCertificates([FromQuery] string? status)
        {
            try
            {
                var query = _context.Certificates
                    .Include(c => c.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(c => c.Status == status);
                }

                var certificates = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        id = c.Id,
                        applicantName = c.ApplicantName,
                        certificateType = c.CertificateType,
                        status = c.Status,
                        createdAt = c.CreatedAt,
                        reviewedAt = c.ReviewedAt,
                        referenceNumber = c.ReferenceNumber,
                        userName = c.User.FullName,
                        userContact = c.User.MobileNo
                    })
                    .ToListAsync();

                return Ok(certificates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving certificates");
                return StatusCode(500, new { message = "An error occurred while retrieving certificates" });
            }
        }

        // Get my certificates (authorized users)
        [HttpGet("my-certificates")]
        [Authorize]
        public async Task<IActionResult> GetMyCertificates()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var certificates = await _context.Certificates
                    .Where(c => c.UserId == id)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        id = c.Id,
                        applicantName = c.ApplicantName,
                        certificateType = c.CertificateType,
                        status = c.Status,
                        createdAt = c.CreatedAt,
                        reviewedAt = c.ReviewedAt,
                        referenceNumber = c.ReferenceNumber,
                        rejectionReason = c.RejectionReason
                    })
                    .ToListAsync();

                return Ok(certificates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user certificates");
                return StatusCode(500, new { message = "An error occurred while retrieving your certificates" });
            }
        }

        // Get certificate by ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetCertificateById(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                    return Unauthorized(new { message = "Invalid or expired token" });

                var certificate = await _context.Certificates
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (certificate == null)
                    return NotFound(new { message = "Certificate not found" });

                // Only allow admin or the certificate owner to view details
                if (certificate.UserId != uid && !User.IsInRole("Admin"))
                    return Forbid();

                return Ok(certificate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving certificate details for ID: {CertificateId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the certificate" });
            }
        }

        // Create certificate application
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCertificate([FromBody] CreateCertificateModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                // Basic input validation for certificate type
                if (string.IsNullOrWhiteSpace(model.CertificateType))
                    return BadRequest(new { message = "Certificate type is required" });

                if (string.IsNullOrWhiteSpace(model.ApplicantName))
                    return BadRequest(new { message = "Applicant name is required" });

                // Create new certificate entity from model
                var certificate = new Certificate
                {
                    UserId = id,
                    CertificateType = model.CertificateType,
                    ApplicantName = model.ApplicantName,
                    Gender = model.Gender,
                    Age = model.Age,
                    Address = model.Address,
                    FatherName = model.FatherName,
                    Religion = model.Religion,
                    Caste = model.Caste,
                    PostOffice = model.PostOffice,
                    PinCode = model.PinCode,
                    State = model.State,
                    District = model.District,
                    Village = model.Village,
                    Taluk = model.Taluk,
                    Location = model.Location,
                    FamilyMemberName = model.FamilyMemberName,
                    Relationship = model.Relationship,
                    AnnualIncome = model.AnnualIncome,
                    CompanyName = model.CompanyName,
                    CompanySector = model.CompanySector,
                    IdentificationMark1 = model.IdentificationMark1,
                    IdentificationMark2 = model.IdentificationMark2,
                    IdentificationMark3 = model.IdentificationMark3,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    ReferenceNumber = GenerateReferenceNumber()
                };

                _context.Certificates.Add(certificate);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = certificate.Id,
                    referenceNumber = certificate.ReferenceNumber,
                    message = "Certificate application submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating certificate application");
                return StatusCode(500, new { message = "An error occurred while creating the certificate application" });
            }
        }

        // Update certificate status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCertificateStatus(int id, [FromBody] UpdateCertificateStatusModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var certificate = await _context.Certificates.FindAsync(id);
                if (certificate == null)
                    return NotFound(new { message = "Certificate not found" });

                // Validate state transition
                if (certificate.Status != "Pending")
                    return BadRequest(new { message = "Only certificates with 'Pending' status can be updated" });

                // Validate the new status
                if (model.Status != "Approved" && model.Status != "Rejected")
                    return BadRequest(new { message = "Status must be either 'Approved' or 'Rejected'" });

                certificate.Status = model.Status;
                certificate.ReviewedAt = DateTime.UtcNow;

                if (model.Status == "Rejected")
                {
                    if (string.IsNullOrWhiteSpace(model.RejectionReason))
                        return BadRequest(new { message = "Rejection reason is required" });

                    certificate.RejectionReason = model.RejectionReason;
                }
                else if (model.Status == "Approved")
                {
                    certificate.ApprovalComments = model.ApprovalComments;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Certificate status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating certificate status for ID: {CertificateId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the certificate status" });
            }
        }

        private string GenerateReferenceNumber()
        {
            // Format: CERT-{Year}{Month}{Day}-{Random 4 digits}
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();
            return $"CERT-{dateComponent}-{randomComponent}";
        }
    }

    public class UpdateCertificateStatusModel
    {
        public required string Status { get; set; } // Approved or Rejected
        public string? RejectionReason { get; set; }
        public string? ApprovalComments { get; set; }
    }

    public class CreateCertificateModel
    {
        public required string CertificateType { get; set; }
        public required string ApplicantName { get; set; }
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public string? Address { get; set; }
        public string? FatherName { get; set; }
        public string? Religion { get; set; }
        public string? Caste { get; set; }
        public string? PostOffice { get; set; }
        public string? PinCode { get; set; }
        public string? State { get; set; }
        public string? District { get; set; }
        public string? Village { get; set; }
        public string? Taluk { get; set; }
        public string? Location { get; set; }
        public string? FamilyMemberName { get; set; }
        public string? Relationship { get; set; }
        public string? AnnualIncome { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanySector { get; set; }
        public string? IdentificationMark1 { get; set; }
        public string? IdentificationMark2 { get; set; }
        public string? IdentificationMark3 { get; set; }
    }
}