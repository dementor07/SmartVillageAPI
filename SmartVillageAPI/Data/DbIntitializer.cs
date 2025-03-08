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

                // Only seed if no schemes exist
                if (!context.Schemes.Any())
                {
                    // Add sample schemes based on the provided templates
                    var schemes = new List<Scheme>
                    {
                        // 1. Indira Gandhi National Widow Pension
                        new Scheme
                        {
                            Name = "Indira Gandhi National Widow Pension",
                            Description = "Financial assistance scheme for widows aged 40-79 years who are below the poverty line.",
                            Category = "Pension",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                age = "40-79 years",
                                status = "Widow",
                                income = "Below Poverty Line",
                                documents = new[] { "Death certificate of spouse", "BPL card", "Ration card", "Aadhaar card" }
                            }),
                            Benefits = "Monthly pension of Rs. 500. Additional benefits include healthcare coverage under Ayushman Bharat.",
                            RequiredDocuments = "Death certificate of spouse, BPL card, Ration card, Aadhaar card, Bank account details",
                            Department = "Ministry of Rural Development",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "pensionCode", label = "Pension Code", type = "text", required = true },
                                new { key = "applicantName", label = "Applicant Name", type = "text", required = true },
                                new { key = "gender", label = "Gender", type = "select", options = new[] { "Female" }, required = true },
                                new { key = "wardNumber", label = "Ward Number", type = "text", required = true },
                                new { key = "address", label = "Address", type = "textarea", required = true },
                                new { key = "postOffice", label = "Post Office", type = "text", required = true },
                                new { key = "rationCardNumber", label = "Ration Card Number", type = "text", required = true },
                                new { key = "wardMemberName", label = "Ward Member Name", type = "text", required = true },
                                new { key = "annualIncome", label = "Annual Income", type = "number", required = true },
                                new { key = "residingYears", label = "Residing Years", type = "number", required = true },
                                new { key = "modeOfPayment", label = "Mode of Payment", type = "select", options = new[] { "Bank Transfer", "Money Order", "Post Office" }, required = true },
                                new { key = "servicePensionHolder", label = "Service Pension Holder", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "incomeTaxPayable", label = "Income Tax Payable", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "providentPensionTaker", label = "Provident Pension Taker", type = "select", options = new[] { "Yes", "No" }, required = true }
                            })
                        },
                        
                        // 2. MEDISEP Scheme (Medical Insurance for State Employees and Pensioners)
                        new Scheme
                        {
                            Name = "MEDISEP Scheme",
                            Description = "Medical Insurance scheme designed for state government employees, pensioners and their dependents.",
                            Category = "Healthcare",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                employment = "Current or retired state government employees",
                                dependents = "Spouse, children under 25, dependent parents",
                                enrollment = "Mandatory for all state employees"
                            }),
                            Benefits = "Comprehensive cashless medical treatment up to Rs. 3 lakhs per family per annum. Coverage for over 1800 medical procedures.",
                            RequiredDocuments = "Service ID card, Aadhaar card, Pension certificate (for retirees), Proof of relationship (for dependents)",
                            Department = "Department of Health",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "dateOfBirth", label = "Date of Birth", type = "date", required = true },
                                new { key = "age", label = "Age", type = "number", required = true },
                                new { key = "mobileNumber", label = "Mobile Number", type = "text", required = true },
                                new { key = "aadharNumber", label = "Aadhar Number", type = "text", required = true },
                                new { key = "panNumber", label = "PAN Number", type = "text", required = true },
                                new { key = "retirementDate", label = "Retirement Date", type = "date", required = false },
                                new { key = "post", label = "Post", type = "text", required = true },
                                new { key = "office", label = "Office", type = "text", required = true },
                                new { key = "pensionNumber", label = "Pension Number", type = "text", required = false },
                                new { key = "pensionSchemeAvailed", label = "Pension Scheme Availed", type = "text", required = false },
                                new { key = "bloodGroup", label = "Blood Group", type = "text", required = true },
                                new { key = "permanentAddress", label = "Permanent Address", type = "textarea", required = true },
                                new { key = "state", label = "State", type = "text", required = true },
                                new { key = "isSchemeUser", label = "Is Scheme User?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "schemeNumber", label = "Scheme Number", type = "text", required = false },
                                new { key = "isAllowanceGranted", label = "Is Allowance Granted?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "partnersName", label = "Partner's Name", type = "text", required = false },
                                new { key = "partnersAadharNo", label = "Partner's Aadhar No", type = "text", required = false },
                                new { key = "partnersBloodGroup", label = "Partner's Blood Group", type = "text", required = false },
                                new { key = "childsName", label = "Child's Name", type = "text", required = false },
                                new { key = "childsAadhar", label = "Child's Aadhar", type = "text", required = false },
                                new { key = "childsBloodGroup", label = "Child's Blood Group", type = "text", required = false }
                            })
                        },

                        // 3. Snehapoorvam Scheme (Educational Support)
                        new Scheme
                        {
                            Name = "Snehapoorvam Scheme",
                            Description = "Educational and financial support for children who have lost one or both parents, or whose parents are unable to support them due to chronic illness or imprisonment.",
                            Category = "Education",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                orphanStatus = "Children who have lost one or both parents",
                                parentalStatus = "Children with parents suffering from chronic illness or imprisonment",
                                educationStatus = "Currently enrolled in educational institution"
                            }),
                            Benefits = "Monthly financial assistance, Educational supplies, Counseling services, Career guidance",
                            RequiredDocuments = "Death certificate of parent(s), School enrollment certificate, Guardian's ID proof, Income certificate",
                            Department = "Department of Social Justice",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "address", label = "Address", type = "textarea", required = true },
                                new { key = "pinCode", label = "Pin Code", type = "text", required = true },
                                new { key = "mobileNumber", label = "Mobile Number", type = "text", required = true },
                                new { key = "localSelfGovt", label = "Local Self Govt", type = "text", required = true },
                                new { key = "revenueDistrict", label = "Revenue District", type = "text", required = true },
                                new { key = "fathersName", label = "Father's Name", type = "text", required = true },
                                new { key = "isFatherAlive", label = "Is Father Alive?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "mothersName", label = "Mother's Name", type = "text", required = true },
                                new { key = "isMotherAlive", label = "Is Mother Alive?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "dateOfDeath", label = "Date of Death (If applicable)", type = "date", required = false },
                                new { key = "nameAddressOfGuardian", label = "Name & Address of Guardian", type = "textarea", required = true },
                                new { key = "relationshipWithStudent", label = "Relationship with Student", type = "text", required = true },
                                new { key = "dateOfBirth", label = "Date of Birth", type = "date", required = true },
                                new { key = "age", label = "Age", type = "number", required = true },
                                new { key = "gender", label = "Gender", type = "select", options = new[] { "Male", "Female", "Other" }, required = true },
                                new { key = "schoolName", label = "School Name", type = "text", required = true },
                                new { key = "natureOfSchool", label = "Nature of School", type = "text", required = true },
                                new { key = "classStudied", label = "Class Studied", type = "text", required = true },
                                new { key = "schoolDistrict", label = "School District", type = "text", required = true }
                            })
                        },

                        // 4. Pension for Unmarried Women Above 50
                        new Scheme
                        {
                            Name = "Pension for Unmarried Women Above 50",
                            Description = "Social security scheme providing financial assistance to unmarried women above 50 years of age who have limited means of support.",
                            Category = "Pension",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                age = "Above 50 years",
                                maritalStatus = "Never married",
                                income = "Below Rs. 1,00,000 per annum",
                                residency = "Resident of the state for at least 5 years"
                            }),
                            Benefits = "Monthly pension of Rs. 1,500, Healthcare benefits, Priority in other welfare schemes",
                            RequiredDocuments = "Age proof, Income certificate, Domicile certificate, Bank account details, Unmarried certificate",
                            Department = "Department of Women and Child Development",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "gender", label = "Gender", type = "select", options = new[] { "Female" }, required = true },
                                new { key = "age", label = "Age", type = "number", required = true },
                                new { key = "address", label = "Address", type = "textarea", required = true },
                                new { key = "wardNumber", label = "Ward Number", type = "text", required = true },
                                new { key = "postOffice", label = "Post Office", type = "text", required = true },
                                new { key = "rationCardNumber", label = "Ration Card Number", type = "text", required = true },
                                new { key = "income", label = "Income", type = "number", required = true },
                                new { key = "wardMemberName", label = "Ward Member Name", type = "text", required = true },
                                new { key = "modeOfPayment", label = "Mode of Payment", type = "select", options = new[] { "Bank Transfer", "Money Order", "Post Office" }, required = true },
                                new { key = "residingYears", label = "Residing Years", type = "number", required = true },
                                new { key = "receivingServicePension", label = "Receiving Service Pension?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "payingIncomeTax", label = "Paying Income Tax?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "employeeProvidentPensionTaker", label = "Employee Provident Pension Taker?", type = "select", options = new[] { "Yes", "No" }, required = true }
                            })
                        },

                        // 5. Indira Gandhi National Disability Pension
                        new Scheme
                        {
                            Name = "Indira Gandhi National Disability Pension",
                            Description = "Pension scheme for persons with severe or multiple disabilities living below the poverty line.",
                            Category = "Pension",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                disabilityStatus = "Severe or multiple disabilities (80% or more)",
                                age = "18-79 years",
                                income = "Below Poverty Line",
                                certification = "Valid disability certificate from authorized medical authority"
                            }),
                            Benefits = "Monthly pension of Rs. 500, Additional disability allowance, Priority in assistive devices distribution",
                            RequiredDocuments = "Disability certificate, BPL card, Age proof, Bank account details, Aadhaar card",
                            Department = "Ministry of Social Justice and Empowerment",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "pensionCode", label = "Pension Code", type = "text", required = true },
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "gender", label = "Gender", type = "select", options = new[] { "Male", "Female", "Other" }, required = true },
                                new { key = "wardNumber", label = "Ward Number", type = "text", required = true },
                                new { key = "address", label = "Address", type = "textarea", required = true },
                                new { key = "postOffice", label = "Post Office", type = "text", required = true },
                                new { key = "rationCardNumber", label = "Ration Card Number", type = "text", required = true },
                                new { key = "annualIncome", label = "Annual Income", type = "number", required = true },
                                new { key = "wardMemberName", label = "Ward Member Name", type = "text", required = true },
                                new { key = "modeOfPayment", label = "Mode of Payment", type = "select", options = new[] { "Bank Transfer", "Money Order", "Post Office" }, required = true },
                                new { key = "residingYears", label = "Residing Years", type = "number", required = true },
                                new { key = "landOwnership", label = "Land Ownership", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "servicePensionHolder", label = "Service Pension Holder", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "incomeTaxPayable", label = "Income Tax Payable", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "providentPensionTaker", label = "Provident Pension Taker", type = "select", options = new[] { "Yes", "No" }, required = true }
                            })
                        },

                        // 6. Indira Gandhi National Old Age Pension
                        new Scheme
                        {
                            Name = "Indira Gandhi National Old Age Pension",
                            Description = "Social security scheme providing financial assistance to elderly persons aged 60 years and above living below the poverty line.",
                            Category = "Pension",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                age = "60 years and above",
                                income = "Below Poverty Line",
                                residency = "Permanent resident of the applying state"
                            }),
                            Benefits = "Monthly pension of Rs. 600 (60-79 years) or Rs. 800 (80+ years), Healthcare benefits, Food security",
                            RequiredDocuments = "Age proof, BPL card, Residence proof, Bank account details, Aadhaar card",
                            Department = "Ministry of Rural Development",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "pensionCode", label = "Pension Code", type = "text", required = true },
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "gender", label = "Gender", type = "select", options = new[] { "Male", "Female", "Other" }, required = true },
                                new { key = "wardNumber", label = "Ward Number", type = "text", required = true },
                                new { key = "address", label = "Address", type = "textarea", required = true },
                                new { key = "postOffice", label = "Post Office", type = "text", required = true },
                                new { key = "rationCardNumber", label = "Ration Card Number", type = "text", required = true },
                                new { key = "annualIncome", label = "Annual Income", type = "number", required = true },
                                new { key = "wardMemberName", label = "Ward Member Name", type = "text", required = true },
                                new { key = "modeOfPayment", label = "Mode of Payment", type = "select", options = new[] { "Bank Transfer", "Money Order", "Post Office" }, required = true },
                                new { key = "residingYears", label = "Residing Years", type = "number", required = true },
                                new { key = "landOwnership", label = "Land Ownership", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "servicePensionHolder", label = "Service Pension Holder", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "incomeTaxPayable", label = "Income Tax Payable", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "providentPensionTaker", label = "Provident Pension Taker", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "healthCondition", label = "Health Condition", type = "select", options = new[] { "Good", "Fair", "Poor" }, required = true },
                                new { key = "applicantIsPoor", label = "Applicant is Poor", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "applicantIsABeggar", label = "Applicant is a Beggar", type = "select", options = new[] { "Yes", "No" }, required = true }
                            })
                        },

                        // 7. Vayomadhuram Scheme (Diabetes Care)
                        new Scheme
                        {
                            Name = "Vayomadhuram Scheme",
                            Description = "Healthcare scheme providing free glucometers and insulin to diabetic patients from economically weaker sections.",
                            Category = "Healthcare",
                            EligibilityCriteria = JsonSerializer.Serialize(new
                            {
                                medical = "Diagnosed with diabetes",
                                economic = "Annual income below Rs. 2 lakhs",
                                rationCard = "Priority ration card holder"
                            }),
                            Benefits = "Free glucometer, Free insulin supplies, Monthly health check-ups, Diet counseling",
                            RequiredDocuments = "Medical certificate confirming diabetes, Income certificate, Ration card, Aadhaar card",
                            Department = "Department of Health and Family Welfare",
                            FormFields = JsonSerializer.Serialize(new object[]
                            {
                                new { key = "name", label = "Name", type = "text", required = true },
                                new { key = "dateOfBirth", label = "Date of Birth", type = "date", required = true },
                                new { key = "age", label = "Age", type = "number", required = true },
                                new { key = "permanentAddress", label = "Permanent Address", type = "textarea", required = true },
                                new { key = "presentAddress", label = "Present Address", type = "textarea", required = true },
                                new { key = "mobileNumber", label = "Mobile Number", type = "text", required = true },
                                new { key = "aadharNumber", label = "Aadhar Number", type = "text", required = true },
                                new { key = "rationCardNumber", label = "Ration Card Number", type = "text", required = true },
                                new { key = "rationPriority", label = "Ration Priority", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "selfAttested", label = "Self Attested?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "diabetic", label = "Diabetic?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "periodOfDiabetes", label = "Period of Diabetes (Years)", type = "number", required = true },
                                new { key = "glucoseMeterUser", label = "Glucose Meter User?", type = "select", options = new[] { "Yes", "No" }, required = true },
                                new { key = "treatmentDuration", label = "Treatment Duration", type = "text", required = true },
                                new { key = "hospitalName", label = "Hospital Name", type = "text", required = true },
                                new { key = "doctorsName", label = "Doctor's Name", type = "text", required = true },
                                new { key = "doctorsDesignation", label = "Doctor's Designation", type = "text", required = true },
                                new { key = "doctorsRegistrationNumber", label = "Doctor's Registration Number", type = "text", required = true },
                                new { key = "nameOfGovtHospital", label = "Name of Govt. Hospital", type = "text", required = false },
                                new { key = "place", label = "Place", type = "text", required = true },
                                new { key = "date", label = "Date", type = "date", required = true }
                            })
                        }
                    };

                    context.Schemes.AddRange(schemes);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't crash
                Console.WriteLine($"Database seeding error: {ex.Message}");
            }
        }
    }
}