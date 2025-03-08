using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartVillageAPI.Models
{
    public class SchemeApplication
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Foreign keys for related entities
        [Required]
        public int SchemeId { get; set; }

        [ForeignKey("SchemeId")]
        public Scheme? Scheme { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Application data stored as JSON
        [Required]
        public string ApplicationData { get; set; } = string.Empty;

        // Application status
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        // Reference number for the application
        public string? ReferenceNumber { get; set; }

        // Notes for rejection or conditional approval
        public string? Notes { get; set; }

        // Document references (can be extended to a separate table if needed)
        public string? SupportingDocuments { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        // Reviewer information (if admin review is implemented)
        public int? ReviewedByUserId { get; set; }

        [ForeignKey("ReviewedByUserId")]
        public User? ReviewedByUser { get; set; }
    }
}