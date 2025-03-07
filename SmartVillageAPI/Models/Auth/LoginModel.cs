using System.ComponentModel.DataAnnotations;

namespace SmartVillageAPI.Models.Auth
{
    public class LoginModel
    {
        [Required]
        [EmailAddress]
        public string EmailId { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}