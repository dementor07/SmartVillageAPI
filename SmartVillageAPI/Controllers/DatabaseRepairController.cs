using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using SmartVillageAPI.Utilities;

namespace SmartVillageAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseRepairController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabaseRepairController> _logger;

        public DatabaseRepairController(ApplicationDbContext context, ILogger<DatabaseRepairController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // This endpoint is for development and initial setup only
        // Should be disabled in production
        [HttpGet("repair")]
        public async Task<IActionResult> RepairDatabase()
        {
            try
            {
                _logger.LogInformation("Starting database repair process");

                // Apply migration fix utility with a fresh context
                // Create a new DbContext to avoid connection issues
                var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlServer(_context.Database.GetConnectionString())
                    .Options;

                using (var newContext = new ApplicationDbContext(options))
                {
                    await MigrationFixUtility.FixMigrations(newContext, _logger);
                }

                // Get the status of all required tables
                var tableStatus = new Dictionary<string, bool>();

                // Get status of critical tables using direct SQL to avoid connection issues
                var criticalTables = new[]
                {
                    "Users", "ServiceRequests", "Certificates", "Announcements",
                    "Schemes", "SchemeApplications", "ServiceCategories",
                    "LandRevenueServiceTypes", "LandRevenues",
                    "DisputeResolutions", "DisasterManagements"
                };

                foreach (var table in criticalTables)
                {
                    try
                    {
                        // Create a new connection for each check
                        using var newContext = new ApplicationDbContext(
                            new DbContextOptionsBuilder<ApplicationDbContext>()
                                .UseSqlServer(_context.Database.GetConnectionString())
                                .Options);

                        var sql = $"IF OBJECT_ID(N'[dbo].[{table}]', N'U') IS NOT NULL SELECT 1 ELSE SELECT 0";
                        var exists = await newContext.Database.ExecuteSqlRawAsync(sql) == 1;
                        tableStatus[table] = exists;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error checking table {table}");
                        tableStatus[table] = false;
                    }
                }

                // Attempt to seed essential data with another fresh context
                try
                {
                    using var seedContext = new ApplicationDbContext(
                        new DbContextOptionsBuilder<ApplicationDbContext>()
                            .UseSqlServer(_context.Database.GetConnectionString())
                            .Options);

                    DbInitializer.SeedData(seedContext);
                    _logger.LogInformation("Database seeding completed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during database seeding");
                    // Continue despite seeding error
                }

                return Ok(new
                {
                    message = "Database repair process completed",
                    tablesStatus = tableStatus
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database repair");
                return StatusCode(500, new { message = "An error occurred during database repair", error = ex.Message });
            }
        }
    }
}