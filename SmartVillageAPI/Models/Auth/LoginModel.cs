using System.ComponentModel.DataAnnotations;

namespace SmartVillageAPI.Models.Auth
{
    public class LoginModel
    {
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }

        [Required]
        public string Password { get; set; }
    }
}