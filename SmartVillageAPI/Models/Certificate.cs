using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SmartVillageAPI.Models
{
    public enum CertificateType
    {
        NonCreamyLayerCertificate,
        FamilyMembershipCertificate,
        RelationshipCertificate,
        DomicileCertificate,
        CommunityCertificate,
        NativityCertificate,
        IncomeCertificate,
        CasteCertificate,
        IdentificationCertificate
    }

    public enum CertificateStatus
    {
        Draft,
        Pending,
        UnderReview,
        RequiresAdditionalDocuments,
        Approved,
        Rejected
    }

    public class RequiredIfAttribute : ValidationAttribute
    {
        private readonly string _dependentProperty;
        private readonly object _targetValue;
        private readonly string _errorMessage;

        public RequiredIfAttribute(
            string dependentProperty,
            object targetValue,
            string? errorMessage = null)
            : base(string.Empty) // Pass empty string to base constructor
        {
            _dependentProperty = dependentProperty;
            _targetValue = targetValue;

            // Generate a default error message if not provided
            _errorMessage = errorMessage ??
                $"The {dependentProperty} field is required when {dependentProperty} is {targetValue}.";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var instance = validationContext.ObjectInstance;
            var type = instance.GetType();
            var dependentPropertyInfo = type.GetProperty(_dependentProperty);

            if (dependentPropertyInfo == null)
                return new ValidationResult($"Unknown property {_dependentProperty}");

            var dependentValue = dependentPropertyInfo.GetValue(instance);

            if (Equals(dependentValue, _targetValue) &&
                (value == null || string.IsNullOrWhiteSpace(value.ToString())))
            {
                return new ValidationResult(_errorMessage);
            }

            return ValidationResult.Success;
        }
    }

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
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public CertificateType CertificateType { get; set; }

        [Required]
        [StringLength(200)]
        public string ApplicantName { get; set; } = string.Empty;

        [StringLength(10)]
        public string? Gender { get; set; }

        [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
        public int? Age { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(200)]
        public string? FatherName { get; set; }

        // Type-specific fields with custom validation
        [RequiredIf(
            nameof(CertificateType),
            CertificateType.IncomeCertificate,
            "Annual Income is required for Income Certificate")]
        [StringLength(50)]
        public string? AnnualIncome { get; set; }

        [RequiredIf(
            nameof(CertificateType),
            CertificateType.CasteCertificate,
            "Caste is required for Caste Certificate")]
        [StringLength(50)]
        public string? Caste { get; set; }

        [RequiredIf(
            nameof(CertificateType),
            CertificateType.FamilyMembershipCertificate,
            "Family Member Name is required for Family Membership Certificate")]
        [StringLength(200)]
        public string? FamilyMemberName { get; set; }

        [RequiredIf(
            nameof(CertificateType),
            CertificateType.FamilyMembershipCertificate,
            "Relationship is required for Family Membership Certificate")]
        [StringLength(50)]
        public string? Relationship { get; set; }

        // Document Upload Metadata
        [StringLength(255)]
        public string? DocumentFileName { get; set; }

        public long? DocumentFileSize { get; set; }

        [StringLength(50)]
        public string? DocumentFileType { get; set; }

        // Additional Fields
        [StringLength(50)]
        public string? Religion { get; set; }

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

        [StringLength(200)]
        public string? CompanyName { get; set; }

        [StringLength(100)]
        public string? CompanySector { get; set; }

        [StringLength(200)]
        public string? IdentificationMark1 { get; set; }

        [StringLength(200)]
        public string? IdentificationMark2 { get; set; }

        [StringLength(200)]
        public string? IdentificationMark3 { get; set; }

        // Document Content (Base64 encoded)
        public string? DocumentContent { get; set; }

        // Status Management
        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public CertificateStatus Status { get; set; } = CertificateStatus.Draft;

        [StringLength(1000)]
        public string? RejectionReason { get; set; }

        [StringLength(1000)]
        public string? ApprovalComments { get; set; }

        // Tracking
        [StringLength(50)]
        public string? ReferenceNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        public DateTime? LastUpdatedAt { get; set; }
    }
}