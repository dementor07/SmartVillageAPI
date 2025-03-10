using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Models;
using System.Security.Cryptography;
using System.Text.Json;

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
            // Handle each seeding operation independently to prevent one failure from
            // stopping the entire initialization process

            // Seed Users
            SeedUsers(context);

            // Seed Service Categories with improved error handling
            try
            {
                SeedServiceCategories(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding service categories: {ex.Message}");
                // Detailed diagnostics
                if (TableExists(context, "ServiceCategories"))
                {
                    Console.WriteLine("ServiceCategories table exists but the query failed. Check permissions or schema.");
                }
                else
                {
                    Console.WriteLine("ServiceCategories table doesn't exist. Run migrations or use the MigrationFixUtility.");
                }
            }

            // Seed Land Revenue Service Types with improved error handling
            try
            {
                SeedLandRevenueServiceTypes(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding land revenue service types: {ex.Message}");
                // Detailed diagnostics
                if (TableExists(context, "LandRevenueServiceTypes"))
                {
                    Console.WriteLine("LandRevenueServiceTypes table exists but the query failed. Check permissions or schema.");
                }
                else
                {
                    Console.WriteLine("LandRevenueServiceTypes table doesn't exist. Run migrations or use the MigrationFixUtility.");
                }
            }

            // Seed Schemes - Try with proper error handling
            try
            {
                SeedSchemes(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding schemes: {ex.Message}");
                // Continue execution despite error
            }
        }

        private static bool TableExists(ApplicationDbContext context, string tableName)
        {
            try
            {
                var sql = $"IF OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL SELECT 1 ELSE SELECT 0";
                var connection = context.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                    connection.Open();

                using var command = connection.CreateCommand();
                command.CommandText = sql;
                var result = command.ExecuteScalar();
                return Convert.ToInt32(result) == 1;
            }
            catch
            {
                return false;
            }
        }

        private static void SeedUsers(ApplicationDbContext context)
        {
            try
            {
                // Only seed if no users exist
                if (!context.Users.Any())
                {
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
            }
            catch (Exception ex)
            {
                // Log the error but don't crash
                Console.WriteLine($"Error seeding users: {ex.Message}");
            }
        }

        private static void SeedServiceCategories(ApplicationDbContext context)
        {
            // Extra safety check if table exists
            if (!TableExists(context, "ServiceCategories"))
            {
                Console.WriteLine("ServiceCategories table does not exist. Skipping seed.");
                return;
            }

            try
            {
                // Check if any service categories exist using direct SQL
                var sql = "SELECT COUNT(*) FROM ServiceCategories";
                var connection = context.Database.GetDbConnection();

                if (connection.State != System.Data.ConnectionState.Open)
                    connection.Open();

                using var command = connection.CreateCommand();
                command.CommandText = sql;

                var result = command.ExecuteScalar();
                var count = Convert.ToInt32(result);

                if (count == 0)
                {
                    Console.WriteLine("Seeding service categories...");

                    var categories = new List<ServiceCategory>
                    {
                        new ServiceCategory
                        {
                            Name = "Public Dispute Resolution",
                            Description = "Mediation and resolution services for public disputes between residents.",
                            Icon = "fa-gavel",
                            ColorClass = "primary",
                            IsActive = true,
                            DisplayOrder = 1
                        },
                        new ServiceCategory
                        {
                            Name = "Disaster Management",
                            Description = "Emergency response and management services for natural disasters and calamities.",
                            Icon = "fa-house-damage",
                            ColorClass = "danger",
                            IsActive = true,
                            DisplayOrder = 2
                        },
                        new ServiceCategory
                        {
                            Name = "Land Revenue Services",
                            Description = "Services related to land records, ownership verification, tax payments, and other revenue department services.",
                            Icon = "fa-file-certificate",
                            ColorClass = "success",
                            IsActive = true,
                            DisplayOrder = 3
                        },
                        new ServiceCategory
                        {
                            Name = "Road Maintenance",
                            Description = "Report road damages, potholes, and request repairs for village roads.",
                            Icon = "fa-road",
                            ColorClass = "secondary",
                            IsActive = true,
                            DisplayOrder = 4
                        },
                        new ServiceCategory
                        {
                            Name = "Water Supply Issues",
                            Description = "Water supply disruptions, quality concerns, and new connection requests.",
                            Icon = "fa-faucet",
                            ColorClass = "info",
                            IsActive = true,
                            DisplayOrder = 5
                        },
                        new ServiceCategory
                        {
                            Name = "Electricity Problems",
                            Description = "Power outages, electrical hazards, and new electricity connection requests.",
                            Icon = "fa-bolt",
                            ColorClass = "warning",
                            IsActive = true,
                            DisplayOrder = 6
                        },
                        new ServiceCategory
                        {
                            Name = "Waste Management",
                            Description = "Garbage collection issues, waste disposal, and sanitation concerns.",
                            Icon = "fa-trash",
                            ColorClass = "success",
                            IsActive = true,
                            DisplayOrder = 7
                        }
                    };

                    context.ServiceCategories.AddRange(categories);
                    context.SaveChanges();
                    Console.WriteLine($"Successfully seeded {categories.Count} service categories");
                }
                else
                {
                    Console.WriteLine($"ServiceCategories already has {count} records. Skipping seed.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding service categories: {ex.Message}");
                throw; // Re-throw to be caught by the caller
            }
        }

        private static void SeedLandRevenueServiceTypes(ApplicationDbContext context)
        {
            // Extra safety check if table exists
            if (!TableExists(context, "LandRevenueServiceTypes"))
            {
                Console.WriteLine("LandRevenueServiceTypes table does not exist. Skipping seed.");
                return;
            }

            try
            {
                // Check if any land revenue service types exist using direct SQL
                var sql = "SELECT COUNT(*) FROM LandRevenueServiceTypes";
                var connection = context.Database.GetDbConnection();

                if (connection.State != System.Data.ConnectionState.Open)
                    connection.Open();

                using var command = connection.CreateCommand();
                command.CommandText = sql;

                var result = command.ExecuteScalar();
                var count = Convert.ToInt32(result);

                if (count == 0)
                {
                    Console.WriteLine("Seeding land revenue service types...");

                    var landServices = new List<LandRevenueServiceType>
                    {
                        new LandRevenueServiceType
                        {
                            ServiceName = "Land Tax Payment",
                            Description = "Pay your land tax online through the portal.",
                            RequiredDocuments = "Land deed, Previous tax receipt, Identity proof",
                            ProcessingTime = "Immediate",
                            Fees = 0,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Possession Certificate",
                            Description = "Certificate proving possession of land by the owner.",
                            RequiredDocuments = "Land deed, ID proof, Application form, Recent passport size photo",
                            ProcessingTime = "7-15 working days",
                            Fees = 100,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Land Conversion Certificate",
                            Description = "Certificate for converting land from one usage to another.",
                            RequiredDocuments = "Land deed, NOC from concerned departments, Conversion fee receipt, Site plan",
                            ProcessingTime = "30-45 working days",
                            Fees = 2000,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Income Certificate",
                            Description = "Certificate proving the annual income of a person or family.",
                            RequiredDocuments = "Salary slip, Bank statements, Tax returns, Residence proof",
                            ProcessingTime = "7-10 working days",
                            Fees = 50,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Location Certificate",
                            Description = "Certificate confirming the location/address of a property.",
                            RequiredDocuments = "Land deed, Site plan, Identity proof, Application form",
                            ProcessingTime = "15-20 working days",
                            Fees = 150,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Ownership Certificate",
                            Description = "Certificate confirming the ownership of a land or property.",
                            RequiredDocuments = "Original deed, Tax receipt, Identity proof, Application form",
                            ProcessingTime = "15-30 working days",
                            Fees = 200,
                            IsActive = true
                        },
                        new LandRevenueServiceType
                        {
                            ServiceName = "Mutation of Land Records",
                            Description = "Transfer of land ownership from one person to another in revenue records.",
                            RequiredDocuments = "Sale deed, Previous owner's documents, NOC, Tax receipts",
                            ProcessingTime = "30-60 working days",
                            Fees = 500,
                            IsActive = true
                        }
                    };

                    context.LandRevenueServiceTypes.AddRange(landServices);
                    context.SaveChanges();
                    Console.WriteLine($"Successfully seeded {landServices.Count} land revenue service types");
                }
                else
                {
                    Console.WriteLine($"LandRevenueServiceTypes already has {count} records. Skipping seed.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding land revenue service types: {ex.Message}");
                throw; // Re-throw to be caught by the caller
            }
        }

        private static void SeedSchemes(ApplicationDbContext context)
        {
            // Check if schemes exist using a safer method
            if (!TableExists(context, "Schemes"))
            {
                Console.WriteLine("Schemes table does not exist. Skipping seed.");
                return;
            }

            // Check if any schemes exist
            bool schemesExist = false;
            try
            {
                // Use direct SQL to check if any schemes exist
                var sql = "SELECT COUNT(*) FROM Schemes";
                var connection = context.Database.GetDbConnection();

                if (connection.State != System.Data.ConnectionState.Open)
                    connection.Open();

                using var command = connection.CreateCommand();
                command.CommandText = sql;

                var result = command.ExecuteScalar();
                schemesExist = Convert.ToInt32(result) > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking if schemes exist: {ex.Message}");
                schemesExist = false;
            }

            if (!schemesExist)
            {
                Console.WriteLine("No schemes found. Seeding schemes data...");

                // Create schemes objects directly
                var schemes = new List<Scheme>
                {
                    // 1. Indira Gandhi National Widow Pension
                    new Scheme
                    {
                        Name = "Indira Gandhi National Widow Pension",
                        Description = "Financial assistance scheme for widows aged 40-79 years who are below the poverty line.",
                        Category = "Pension",
                        EligibilityCriteria = "{\"age\":\"40-79 years\",\"status\":\"Widow\",\"income\":\"Below Poverty Line\",\"documents\":[\"Death certificate of spouse\",\"BPL card\",\"Ration card\",\"Aadhaar card\"]}",
                        Benefits = "Monthly pension of Rs. 500. Additional benefits include healthcare coverage under Ayushman Bharat.",
                        RequiredDocuments = "Death certificate of spouse, BPL card, Ration card, Aadhaar card, Bank account details",
                        Department = "Ministry of Rural Development",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Applicant Name\",\"type\":\"text\",\"required\":true},{\"key\":\"age\",\"label\":\"Age\",\"type\":\"number\",\"required\":true},{\"key\":\"address\",\"label\":\"Address\",\"type\":\"textarea\",\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    
                    // 2. MEDISEP Scheme (Medical Insurance for State Employees and Pensioners)
                    new Scheme
                    {
                        Name = "MEDISEP Scheme",
                        Description = "Medical Insurance scheme designed for state government employees, pensioners and their dependents.",
                        Category = "Healthcare",
                        EligibilityCriteria = "{\"employment\":\"Current or retired state government employees\",\"dependents\":\"Spouse, children under 25, dependent parents\",\"enrollment\":\"Mandatory for all state employees\"}",
                        Benefits = "Comprehensive cashless medical treatment up to Rs. 3 lakhs per family per annum. Coverage for over 1800 medical procedures.",
                        RequiredDocuments = "Service ID card, Aadhaar card, Pension certificate (for retirees), Proof of relationship (for dependents)",
                        Department = "Department of Health",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Applicant Name\",\"type\":\"text\",\"required\":true},{\"key\":\"employeeId\",\"label\":\"Employee ID\",\"type\":\"text\",\"required\":true},{\"key\":\"department\",\"label\":\"Department\",\"type\":\"text\",\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },

                    // 3. Snehapoorvam Scheme (Educational Support)
                    new Scheme
                    {
                        Name = "Snehapoorvam Scheme",
                        Description = "Educational and financial support for children who have lost one or both parents, or whose parents are unable to support them due to chronic illness or imprisonment.",
                        Category = "Education",
                        EligibilityCriteria = "{\"orphanStatus\":\"Children who have lost one or both parents\",\"parentalStatus\":\"Children with parents suffering from chronic illness or imprisonment\",\"educationStatus\":\"Currently enrolled in educational institution\"}",
                        Benefits = "Monthly financial assistance, Educational supplies, Counseling services, Career guidance",
                        RequiredDocuments = "Death certificate of parent(s), School enrollment certificate, Guardian's ID proof, Income certificate",
                        Department = "Department of Social Justice",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Student Name\",\"type\":\"text\",\"required\":true},{\"key\":\"schoolName\",\"label\":\"School Name\",\"type\":\"text\",\"required\":true},{\"key\":\"class\",\"label\":\"Class/Standard\",\"type\":\"text\",\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    
                    // 4. PM Kisan Samman Nidhi
                    new Scheme
                    {
                        Name = "PM Kisan Samman Nidhi",
                        Description = "Direct income support scheme for farmers to help them meet farming and domestic needs.",
                        Category = "Agriculture",
                        EligibilityCriteria = "{\"landholding\":\"All landholding farmers\",\"exclusions\":\"Institutional landholders, high-income farmers, government employees\"}",
                        Benefits = "Financial benefit of Rs. 6000 per year in three equal installments of Rs. 2000 each.",
                        RequiredDocuments = "Land records, Aadhaar card, Bank account details, Caste certificate if applicable",
                        Department = "Ministry of Agriculture & Farmers Welfare",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Farmer Name\",\"type\":\"text\",\"required\":true},{\"key\":\"landArea\",\"label\":\"Land Area (in acres)\",\"type\":\"number\",\"required\":true},{\"key\":\"bankAccount\",\"label\":\"Bank Account Number\",\"type\":\"text\",\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    
                    // 5. Pradhan Mantri Awas Yojana
                    new Scheme
                    {
                        Name = "Pradhan Mantri Awas Yojana",
                        Description = "Housing subsidy scheme to provide affordable housing for all by 2025.",
                        Category = "Housing",
                        EligibilityCriteria = "{\"income\":\"EWS/LIG/MIG categories as defined\",\"homeOwnership\":\"Should not own a pucca house\"}",
                        Benefits = "Interest subsidy on home loans, Direct financial assistance for house construction",
                        RequiredDocuments = "Income proof, Aadhaar card, Bank statements, Property documents",
                        Department = "Ministry of Housing and Urban Affairs",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Applicant Name\",\"type\":\"text\",\"required\":true},{\"key\":\"annualIncome\",\"label\":\"Annual Income\",\"type\":\"number\",\"required\":true},{\"key\":\"category\",\"label\":\"Category\",\"type\":\"select\",\"options\":[\"EWS\",\"LIG\",\"MIG-I\",\"MIG-II\"],\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    
                    // 6. Ayushman Bharat Yojana
                    new Scheme
                    {
                        Name = "Ayushman Bharat Yojana",
                        Description = "Health insurance scheme providing coverage for secondary and tertiary care hospitalization.",
                        Category = "Healthcare",
                        EligibilityCriteria = "{\"socioeconomic\":\"Poor and vulnerable families as per SECC database\",\"coverage\":\"Up to 5 family members\"}",
                        Benefits = "Health coverage up to Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization",
                        RequiredDocuments = "Aadhaar card, Ration card, Income certificate, SECC listing proof",
                        Department = "Ministry of Health and Family Welfare",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Applicant Name\",\"type\":\"text\",\"required\":true},{\"key\":\"familyMembers\",\"label\":\"Number of Family Members\",\"type\":\"number\",\"required\":true},{\"key\":\"isInSECC\",\"label\":\"Listed in SECC Database?\",\"type\":\"select\",\"options\":[\"Yes\",\"No\"],\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    
                    // 7. National Social Assistance Program
                    new Scheme
                    {
                        Name = "National Social Assistance Program",
                        Description = "Social security scheme providing financial assistance to elderly, widows and persons with disabilities.",
                        Category = "Pension",
                        EligibilityCriteria = "{\"age\":\"60 years and above for elderly pension\",\"income\":\"Below poverty line\"}",
                        Benefits = "Monthly pension ranging from Rs. 300 to Rs. 500 depending on age and category",
                        RequiredDocuments = "Age proof, Identity proof, BPL card, Bank account details",
                        Department = "Ministry of Rural Development",
                        FormFields = "[{\"key\":\"applicantName\",\"label\":\"Applicant Name\",\"type\":\"text\",\"required\":true},{\"key\":\"age\",\"label\":\"Age\",\"type\":\"number\",\"required\":true},{\"key\":\"category\",\"label\":\"Category\",\"type\":\"select\",\"options\":[\"Elderly\",\"Widow\",\"Disability\"],\"required\":true}]",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                try
                {
                    // Add all schemes to context
                    context.Schemes.AddRange(schemes);

                    // Save changes
                    context.SaveChanges();
                    Console.WriteLine($"Successfully seeded {schemes.Count} schemes");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding schemes to database: {ex.Message}");

                    // Try adding schemes one by one to identify problematic ones
                    foreach (var scheme in schemes)
                    {
                        try
                        {
                            context.Schemes.Add(scheme);
                            context.SaveChanges();
                            Console.WriteLine($"Added scheme: {scheme.Name}");
                        }
                        catch (Exception innerEx)
                        {
                            Console.WriteLine($"Failed to add scheme {scheme.Name}: {innerEx.Message}");
                        }
                    }
                }
            }
            else
            {
                Console.WriteLine("Schemes already exist in database, skipping seed");
            }
        }
    }
}