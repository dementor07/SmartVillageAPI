// SmartVillageAPI/Models/Certificate.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartVillageAPI.Models
{
    public class Certificate
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
        public string CertificateType { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ApplicantName { get; set; } = string.Empty;

        [StringLength(10)]
        public string? Gender { get; set; }

        public int? Age { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(200)]
        public string? FatherName { get; set; }

        [StringLength(50)]
        public string? Religion { get; set; }

        [StringLength(50)]
        public string? Caste { get; set; }

        [StringLength(100)]
        public string? PostOffice { get; set; }

        [StringLength(20)]
        public string? PinCode { get; set; }

        [StringLength(50)]
        public string? State { get; set; }

        [StringLength(50)]
        public string? District { get; set; }

        [StringLength(50)]
        public string? Village { get; set; }

        [StringLength(50)]
        public string? Taluk { get; set; }

        [StringLength(100)]
        public string? Location { get; set; }

        // Fields for Family Membership/Relationship Certificate
        [StringLength(200)]
        public string? FamilyMemberName { get; set; }

        [StringLength(50)]
        public string? Relationship { get; set; }

        // Fields for Income Certificate
        [StringLength(50)]
        public string? AnnualIncome { get; set; }

        [StringLength(200)]
        public string? CompanyName { get; set; }

        [StringLength(100)]
        public string? CompanySector { get; set; }

        // Fields for Identification Certificate
        [StringLength(200)]
        public string? IdentificationMark1 { get; set; }

        [StringLength(200)]
        public string? IdentificationMark2 { get; set; }

        [StringLength(200)]
        public string? IdentificationMark3 { get; set; }

        // Supporting documents
        public string? DocumentName { get; set; }
        public string? DocumentData { get; set; }
        public string? DocumentType { get; set; }

        // Status fields
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public string? RejectionReason { get; set; }

        public string? ApprovalComments { get; set; }

        public string? ReferenceNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }
    }
}