using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartVillageAPI.Models
{
    public class Scheme
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        // Eligibility criteria stored as JSON
        public string EligibilityCriteria { get; set; } = string.Empty;

        // Form fields and their configurations stored as JSON
        public string FormFields { get; set; } = string.Empty;

        // Benefits of the scheme
        [StringLength(1000)]
        public string Benefits { get; set; } = string.Empty;

        // Required documents
        [StringLength(1000)]
        public string RequiredDocuments { get; set; } = string.Empty;

        // Ministry or department that manages this scheme
        [StringLength(200)]
        public string Department { get; set; } = string.Empty;

        // URL for more details if available
        [StringLength(255)]
        public string? MoreInfoUrl { get; set; }

        // Is this scheme active
        public bool IsActive { get; set; } = true;

        // Creation and modification timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}