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
    public class LandRevenueController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LandRevenueController> _logger;

        public LandRevenueController(ApplicationDbContext context, ILogger<LandRevenueController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get all land revenue service types (public endpoint)
        [HttpGet("services")]
        public async Task<IActionResult> GetServiceTypes()
        {
            try
            {
                var serviceTypes = await _context.LandRevenueServiceTypes
                    .Where(s => s.IsActive)
                    .Select(s => new
                    {
                        id = s.Id,
                        serviceName = s.ServiceName,
                        description = s.Description,
                        requiredDocuments = s.RequiredDocuments,
                        processingTime = s.ProcessingTime,
                        fees = s.Fees
                    })
                    .ToListAsync();

                return Ok(serviceTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving land revenue service types");
                return StatusCode(500, new { message = "An error occurred while retrieving service types" });
            }
        }

        // Get single service type details by ID
        [HttpGet("services/{id}")]
        public async Task<IActionResult> GetServiceTypeById(int id)
        {
            try
            {
                var serviceType = await _context.LandRevenueServiceTypes
                    .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);

                if (serviceType == null)
                {
                    return NotFound(new { message = "Service type not found" });
                }

                return Ok(new
                {
                    id = serviceType.Id,
                    serviceName = serviceType.ServiceName,
                    description = serviceType.Description,
                    requiredDocuments = serviceType.RequiredDocuments,
                    processingTime = serviceType.ProcessingTime,
                    fees = serviceType.Fees
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving land revenue service type by ID: {ServiceTypeId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving service type details" });
            }
        }

        // Get all land revenue applications (admin only)
        [HttpGet("applications")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllApplications([FromQuery] string? status)
        {
            try
            {
                var query = _context.LandRevenues
                    .Include(l => l.User)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(l => l.Status == status);
                }

                var applications = await query
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new
                    {
                        id = l.Id,
                        serviceType = l.ServiceType,
                        landOwnerName = l.LandOwnerName,
                        surveyNumber = l.SurveyNumber,
                        village = l.Village,
                        district = l.District,
                        status = l.Status,
                        createdAt = l.CreatedAt,
                        resolvedAt = l.ResolvedAt,
                        referenceNumber = l.ReferenceNumber,
                        userName = l.User != null ? l.User.FullName : "Unknown",
                        userContact = l.User != null ? l.User.MobileNo : "Unknown"
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving land revenue applications");
                return StatusCode(500, new { message = "An error occurred while retrieving applications" });
            }
        }

        // Get my land revenue applications
        [HttpGet("my-applications")]
        [Authorize]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var applications = await _context.LandRevenues
                    .Where(l => l.UserId == id)
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new
                    {
                        id = l.Id,
                        serviceType = l.ServiceType,
                        landOwnerName = l.LandOwnerName,
                        surveyNumber = l.SurveyNumber,
                        village = l.Village,
                        district = l.District,
                        status = l.Status,
                        createdAt = l.CreatedAt,
                        resolvedAt = l.ResolvedAt,
                        referenceNumber = l.ReferenceNumber,
                        rejectionReason = l.RejectionReason,
                        feesAmount = l.FeesAmount,
                        paymentStatus = l.PaymentStatus
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user's land revenue applications");
                return StatusCode(500, new { message = "An error occurred while retrieving your applications" });
            }
        }

        // Get application by ID
        [HttpGet("applications/{id}")]
        [Authorize]
        public async Task<IActionResult> GetApplicationById(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var application = await _context.LandRevenues
                    .Include(l => l.User)
                    .Include(l => l.ReviewedByUser)
                    .FirstOrDefaultAsync(l => l.Id == id);

                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                // Only allow admin or the application owner to view details
                if (application.UserId != uid && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                return Ok(new
                {
                    id = application.Id,
                    userId = application.UserId,
                    serviceType = application.ServiceType,
                    surveyNumber = application.SurveyNumber,
                    village = application.Village,
                    taluk = application.Taluk,
                    district = application.District,
                    landOwnerName = application.LandOwnerName,
                    landArea = application.LandArea,
                    landType = application.LandType,
                    pattaNumber = application.PattaNumber,
                    taxReceiptNumber = application.TaxReceiptNumber,
                    additionalDetails = application.AdditionalDetails,
                    status = application.Status,
                    rejectionReason = application.RejectionReason,
                    approvalComments = application.ApprovalComments,
                    referenceNumber = application.ReferenceNumber,
                    createdAt = application.CreatedAt,
                    resolvedAt = application.ResolvedAt,
                    reviewedBy = application.ReviewedByUser != null ? application.ReviewedByUser.FullName : null,
                    documentData = application.DocumentData,
                    feesAmount = application.FeesAmount,
                    paymentStatus = application.PaymentStatus,
                    transactionId = application.TransactionId,
                    paymentDate = application.PaymentDate,
                    userName = application.User?.FullName,
                    userContact = application.User?.MobileNo,
                    userEmail = application.User?.EmailId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving land revenue application details for ID: {ApplicationId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving application details" });
            }
        }

        // Create a new land revenue application
        [HttpPost("applications")]
        [Authorize]
        public async Task<IActionResult> CreateApplication([FromBody] CreateLandRevenueModel model)
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

                // Check if service type exists
                var serviceType = await _context.LandRevenueServiceTypes
                    .FirstOrDefaultAsync(s => s.ServiceName == model.ServiceType && s.IsActive);

                if (serviceType == null)
                {
                    return BadRequest(new { message = "Invalid service type" });
                }

                // Generate reference number
                string referenceNumber = GenerateReferenceNumber(model.ServiceType);

                // Create new application
                var application = new LandRevenue
                {
                    UserId = id,
                    ServiceType = model.ServiceType,
                    SurveyNumber = model.SurveyNumber,
                    Village = model.Village,
                    Taluk = model.Taluk,
                    District = model.District,
                    LandOwnerName = model.LandOwnerName,
                    LandArea = model.LandArea,
                    LandType = model.LandType,
                    PattaNumber = model.PattaNumber,
                    TaxReceiptNumber = model.TaxReceiptNumber,
                    AdditionalDetails = model.AdditionalDetails,
                    Status = "Pending",
                    ReferenceNumber = referenceNumber,
                    CreatedAt = DateTime.UtcNow,
                    FeesAmount = serviceType.Fees,
                    PaymentStatus = serviceType.Fees > 0 ? "Pending" : "Not Required",
                    DocumentData = model.DocumentData
                };

                _context.LandRevenues.Add(application);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = application.Id,
                    referenceNumber = application.ReferenceNumber,
                    feesAmount = application.FeesAmount,
                    message = "Land revenue application submitted successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating land revenue application");
                return StatusCode(500, new { message = "An error occurred while submitting your application" });
            }
        }

        // Update application status (admin only)
        [HttpPut("applications/{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateLandRevenueStatusModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var application = await _context.LandRevenues.FindAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                // Validate state transition
                if (application.Status != "Pending" && model.Status != "Rejected")
                {
                    return BadRequest(new { message = "Only pending applications can be updated" });
                }

                // Validate the new status
                if (model.Status != "Approved" && model.Status != "Rejected" && model.Status != "In Process")
                {
                    return BadRequest(new { message = "Status must be either 'Approved', 'Rejected', or 'In Process'" });
                }

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId) || !int.TryParse(adminId, out int reviewerId))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                application.Status = model.Status;
                application.ReviewedByUserId = reviewerId;

                if (model.Status == "Approved" || model.Status == "Rejected")
                {
                    application.ResolvedAt = DateTime.UtcNow;
                }

                if (model.Status == "Rejected" && !string.IsNullOrEmpty(model.RejectionReason))
                {
                    application.RejectionReason = model.RejectionReason;
                }

                if (model.Status == "Approved" && !string.IsNullOrEmpty(model.ApprovalComments))
                {
                    application.ApprovalComments = model.ApprovalComments;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Application status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating land revenue application status for ID: {ApplicationId}", id);
                return StatusCode(500, new { message = "An error occurred while updating application status" });
            }
        }

        // Update payment status
        [HttpPut("applications/{id}/payment")]
        [Authorize]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int uid))
                {
                    return Unauthorized(new { message = "Invalid or expired token" });
                }

                var application = await _context.LandRevenues.FindAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Application not found" });
                }

                // Only allow application owner or admin to update payment
                if (application.UserId != uid && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                // Only allow payment update if payment is pending
                if (application.PaymentStatus != "Pending")
                {
                    return BadRequest(new { message = "Payment status can only be updated when it's pending" });
                }

                application.PaymentStatus = "Paid";
                application.TransactionId = model.TransactionId;
                application.PaymentDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Payment status updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating payment status for land revenue application ID: {ApplicationId}", id);
                return StatusCode(500, new { message = "An error occurred while updating payment status" });
            }
        }

        // Helper method to generate reference number
        private string GenerateReferenceNumber(string serviceType)
        {
            // Extract first 3 characters from service type and remove spaces
            string prefix = new string(serviceType.Replace(" ", "").Take(3).ToArray()).ToUpper();

            // Format: LR-{Prefix}-{Year}{Month}{Day}-{Random 4 digits}
            string dateComponent = DateTime.UtcNow.ToString("yyyyMMdd");
            string randomComponent = new Random().Next(1000, 9999).ToString();

            return $"LR-{prefix}-{dateComponent}-{randomComponent}";
        }
    }

    // Model for creating a land revenue application
    public class CreateLandRevenueModel
    {
        public required string ServiceType { get; set; }
        public required string SurveyNumber { get; set; }
        public required string Village { get; set; }
        public required string Taluk { get; set; }
        public required string District { get; set; }
        public required string LandOwnerName { get; set; }
        public string? LandArea { get; set; }
        public string? LandType { get; set; }
        public string? PattaNumber { get; set; }
        public string? TaxReceiptNumber { get; set; }
        public string? AdditionalDetails { get; set; }
        public string? DocumentData { get; set; }
    }

    // Model for updating application status
    public class UpdateLandRevenueStatusModel
    {
        public required string Status { get; set; } // Approved, Rejected, or In Process
        public string? RejectionReason { get; set; }
        public string? ApprovalComments { get; set; }
    }

    // Model for updating payment status
    public class UpdatePaymentModel
    {
        public required string TransactionId { get; set; }
    }
}