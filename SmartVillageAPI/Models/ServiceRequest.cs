using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartVillageAPI.Models
{
    public class ServiceRequest
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; } = null!;

        public int? AssignedToUserId { get; set; }

        [ForeignKey("AssignedToUserId")]
        public User? AssignedToUser { get; set; }

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
}