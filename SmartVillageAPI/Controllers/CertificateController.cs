// SmartVillageAPI/Controllers/CertificateController.cs
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

        public CertificateController(ApplicationDbContext context)
        {
            _context = context;
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
                return StatusCode(500, new { message = "An error occurred while retrieving certificates", error = ex.Message });
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
                return StatusCode(500, new { message = "An error occurred while retrieving your certificates", error = ex.Message });
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
                return StatusCode(500, new { message = "An error occurred while retrieving the certificate", error = ex.Message });
            }
        }

        // Create certificate application
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCertificate([FromBody] Certificate model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                    return Unauthorized(new { message = "Invalid or expired token" });

                model.UserId = id;
                model.Status = "Pending";
                model.CreatedAt = DateTime.UtcNow;
                model.ReferenceNumber = GenerateReferenceNumber();

                _context.Certificates.Add(model);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = model.Id,
                    referenceNumber = model.ReferenceNumber,
                    message = "Certificate application submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the certificate application", error = ex.Message });
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

                certificate.Status = model.Status;
                certificate.ReviewedAt = DateTime.UtcNow;

                if (model.Status == "Rejected")
                {
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
                return StatusCode(500, new { message = "An error occurred while updating the certificate status", error = ex.Message });
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
}