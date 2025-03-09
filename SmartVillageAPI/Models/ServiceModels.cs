using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartVillageAPI.Models
{
    public class ServiceCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string Icon { get; set; } = string.Empty;

        [StringLength(50)]
        public string ColorClass { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;
    }

    public class ServiceRequest
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(500)]
        public string? Resolution { get; set; }

        // Location details
        [StringLength(200)]
        public string? Location { get; set; }

        [StringLength(50)]
        public string? Ward { get; set; }

        [StringLength(50)]
        public string? Landmark { get; set; }

        // For priority and assignment
        [StringLength(20)]
        public string? Priority { get; set; } = "Normal";

        public int? AssignedToUserId { get; set; }

        [ForeignKey("AssignedToUserId")]
        public User? AssignedToUser { get; set; }

        // Reference number for tracking
        [StringLength(50)]
        public string? ReferenceNumber { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public DateTime? LastUpdatedAt { get; set; }

        // Document attachment (simplified)
        public string? AttachmentUrl { get; set; }
    }

    public class LandRevenue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [StringLength(100)]
        public string ServiceType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SurveyNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Village { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Taluk { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string District { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string LandOwnerName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? LandArea { get; set; }

        [StringLength(50)]
        public string? LandType { get; set; }

        [StringLength(100)]
        public string? PattaNumber { get; set; }

        [StringLength(100)]
        public string? TaxReceiptNumber { get; set; }

        [StringLength(1000)]
        public string? AdditionalDetails { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(1000)]
        public string? RejectionReason { get; set; }

        [StringLength(1000)]
        public string? ApprovalComments { get; set; }

        public string? ReferenceNumber { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public int? ReviewedByUserId { get; set; }

        [ForeignKey("ReviewedByUserId")]
        public User? ReviewedByUser { get; set; }

        // Digital documents (base64 encoded data or URL)
        public string? DocumentData { get; set; }

        // Fee and payment details
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? FeesAmount { get; set; }

        [StringLength(50)]
        public string? PaymentStatus { get; set; }

        [StringLength(50)]
        public string? TransactionId { get; set; }

        public DateTime? PaymentDate { get; set; }
    }

    public class LandRevenueServiceType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(1000)]
        public string RequiredDocuments { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProcessingTime { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Fees { get; set; } = 0;

        [Required]
        public bool IsActive { get; set; } = true;
    }

    public class DisputeResolution
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string DisputeType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string PartiesInvolved { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Location { get; set; }

        [Required]
        public DateTime DisputeDate { get; set; }

        [StringLength(1000)]
        public string? PriorResolutionAttempts { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(1000)]
        public string? Resolution { get; set; }

        [StringLength(50)]
        public string? MediaterAssigned { get; set; }

        public DateTime? HearingDate { get; set; }

        public string? ReferenceNumber { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public int? ReviewedByUserId { get; set; }

        [ForeignKey("ReviewedByUserId")]
        public User? ReviewedByUser { get; set; }

        public string? DocumentData { get; set; }
    }

    public class DisasterManagement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string DisasterType { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime OccurrenceDate { get; set; }

        [StringLength(20)]
        public string? Severity { get; set; }

        [StringLength(50)]
        public string? ImpactedArea { get; set; }

        [StringLength(20)]
        public string? AffectedCount { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(1000)]
        public string? Response { get; set; }

        [StringLength(100)]
        public string? AssignedTeam { get; set; }

        public string? ReferenceNumber { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        public int? ReviewedByUserId { get; set; }

        [ForeignKey("ReviewedByUserId")]
        public User? ReviewedByUser { get; set; }

        public string? ImageData { get; set; }
    }
}