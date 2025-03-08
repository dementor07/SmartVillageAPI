using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SmartVillageAPI.Models;
using SmartVillageAPI.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartVillageAPI.Services
{
    public class JwtService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<JwtService> _logger;

        public JwtService(IOptions<JwtSettings> jwtSettings, ILogger<JwtService> logger)
        {
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        public string GenerateToken(User user)
        {
            try
            {
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.EmailId),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.RoleName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var tokenExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

                var token = new JwtSecurityToken(
                    issuer: _jwtSettings.Issuer,
                    audience: _jwtSettings.Audience,
                    claims: claims,
                    expires: tokenExpiry,
                    signingCredentials: credentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                _logger.LogInformation("Generated token for user {UserId} with expiry {Expiry}",
                    user.Id, tokenExpiry);

                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating token for user {UserId}", user.Id);
                throw;
            }
        }
    }
}