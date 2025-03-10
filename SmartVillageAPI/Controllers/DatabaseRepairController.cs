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
        private readonly IWebHostEnvironment _environment;

        public DatabaseRepairController(
            ApplicationDbContext context,
            ILogger<DatabaseRepairController> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        // This endpoint is for development and initial setup only
        // Should be disabled in production
        [HttpGet("repair")]
        public async Task<IActionResult> RepairDatabase()
        {
            // Only allow in development environment
            if (!_environment.IsDevelopment())
                return Forbid();

            try
            {
                _logger.LogInformation("Starting database repair process");

                // Check database connection
                if (!await _context.Database.CanConnectAsync())
                {
                    return StatusCode(500, new { message = "Cannot connect to database" });
                }

                // Get the current migration status
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();

                // Force a new migration by deleting all previous migrations
                try
                {
                    // First detach the database to allow clean migration
                    await _context.Database.EnsureDeletedAsync();

                    // Recreate database and apply migrations
                    await _context.Database.MigrateAsync();

                    // Seed the data
                    DbInitializer.SeedData(_context);

                    _logger.LogInformation("Database has been completely reset and migrated successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during migration reset");
                    return StatusCode(500, new { message = "Error during migration reset", error = ex.Message });
                }

                // Verify the database schema is intact
                var tableStatus = await VerifyTables();

                return Ok(new
                {
                    message = "Database repair process completed",
                    previousState = new
                    {
                        pendingMigrations = pendingMigrations.ToList(),
                        appliedMigrations = appliedMigrations.ToList()
                    },
                    currentState = new
                    {
                        tablesStatus = tableStatus
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database repair");
                return StatusCode(500, new { message = "An error occurred during database repair", error = ex.Message });
            }
        }

        private async Task<Dictionary<string, bool>> VerifyTables()
        {
            var tableStatus = new Dictionary<string, bool>();

            var criticalTables = new[]
            {
                "Users", "ServiceRequests", "Certificates", "Announcements",
                "Schemes", "SchemeApplications", "ServiceCategories",
                "LandRevenueServiceTypes", "LandRevenues",
                "DisputeResolutions", "DisasterManagements"
            };

            foreach (var table in criticalTables)
            {
                bool exists = await TableExists(table);
                tableStatus[table] = exists;
                _logger.LogInformation($"Table '{table}' exists and is accessible: {exists}");
            }

            return tableStatus;
        }

        private async Task<bool> TableExists(string tableName)
        {
            try
            {
                var sql = $"SELECT CASE WHEN OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL THEN 1 ELSE 0 END";
                var connection = _context.Database.GetDbConnection();
                bool wasOpen = connection.State == System.Data.ConnectionState.Open;

                if (!wasOpen)
                    await connection.OpenAsync();

                try
                {
                    using var command = connection.CreateCommand();
                    command.CommandText = sql;
                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result) == 1;
                }
                finally
                {
                    if (!wasOpen)
                        await connection.CloseAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if table {tableName} exists");
                return false;
            }
        }
    }
}