using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Models;
using System.Security.Cryptography;

namespace SmartVillageAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            SeedData(context);
        }

        public static void SeedData(ApplicationDbContext context)
        {
            try
            {
                // Only seed if no users exist
                if (context.Users.Any())
                    return;

                // Create admin user
                byte[] salt = new byte[16];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(salt);
                }

                string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: "Admin@123",
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                var admin = new User
                {
                    FullName = "Admin User",
                    EmailId = "admin@smartvillage.com",
                    PasswordHash = hashedPassword,
                    PasswordSalt = Convert.ToBase64String(salt),
                    MobileNo = "9876543210",
                    State = "Admin State",
                    District = "Admin District",
                    Village = "Admin Village",
                    Address = "Smart Village Admin Office",
                    RoleName = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                context.Users.Add(admin);

                // Also add a sample resident user for testing
                byte[] residentSalt = new byte[16];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(residentSalt);
                }

                string residentHashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: "Resident@123",
                    salt: residentSalt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                var resident = new User
                {
                    FullName = "Sample Resident",
                    EmailId = "resident@smartvillage.com",
                    PasswordHash = residentHashedPassword,
                    PasswordSalt = Convert.ToBase64String(residentSalt),
                    MobileNo = "9876543211",
                    State = "Demo State",
                    District = "Demo District",
                    Village = "Demo Village",
                    Address = "123 Demo Street",
                    RoleName = "Resident",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                context.Users.Add(resident);
                context.SaveChanges();

                // Add a sample announcement
                var announcement = new Announcement
                {
                    UserId = admin.Id,
                    Title = "Welcome to Smart Village Portal",
                    Content = "This is a sample announcement to welcome all residents to our new Smart Village Portal. Stay connected and enjoy the digital services!",
                    Category = "General",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Announcements.Add(announcement);
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                // Log the error but don't crash
                Console.WriteLine($"Database seeding error: {ex.Message}");
            }
        }
    }
}