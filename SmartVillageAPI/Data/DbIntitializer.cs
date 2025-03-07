﻿using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Models;
using System.Security.Cryptography;

namespace SmartVillageAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.Migrate();

            // Check if we already have users
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
            context.SaveChanges();
        }
    }
}