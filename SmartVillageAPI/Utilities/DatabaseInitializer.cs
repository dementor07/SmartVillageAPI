using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using System.Text;

namespace SmartVillageAPI.Utilities
{
    public static class DatabaseInitializer
    {
        public static async Task EnsureTablesExist(ApplicationDbContext context, ILogger logger)
        {
            // Check if Schemes table exists and is accessible
            bool canAccessSchemes = await CanAccessTable(context, "Schemes", logger);

            if (!canAccessSchemes)
            {
                logger.LogInformation("Table 'Schemes' exists but may not be properly registered with EF Core. Attempting to fix...");

                try
                {
                    // Create SchemeApplications table if it doesn't exist
                    bool canAccessSchemeApplications = await CanAccessTable(context, "SchemeApplications", logger);
                    if (!canAccessSchemeApplications)
                    {
                        // Script to create SchemeApplications table
                        string createSchemeApplicationsTableSql = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SchemeApplications')
BEGIN
CREATE TABLE [SchemeApplications] (
    [Id] int NOT NULL IDENTITY,
    [SchemeId] int NOT NULL,
    [UserId] int NOT NULL,
    [ApplicationData] nvarchar(max) NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [ReferenceNumber] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [SupportingDocuments] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [SubmittedAt] datetime2 NULL,
    [ReviewedAt] datetime2 NULL,
    [ReviewedByUserId] int NULL,
    CONSTRAINT [PK_SchemeApplications] PRIMARY KEY ([Id])
);

-- Create foreign keys only if tables exist
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Schemes') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'SchemeApplications')
BEGIN
    ALTER TABLE [SchemeApplications] ADD CONSTRAINT [FK_SchemeApplications_Schemes_SchemeId] 
    FOREIGN KEY ([SchemeId]) REFERENCES [Schemes] ([Id]) ON DELETE CASCADE;
END

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'SchemeApplications')
BEGIN
    ALTER TABLE [SchemeApplications] ADD CONSTRAINT [FK_SchemeApplications_Users_ReviewedByUserId] 
    FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]);
    
    ALTER TABLE [SchemeApplications] ADD CONSTRAINT [FK_SchemeApplications_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]);
END
END
                        ";

                        // Create indices
                        string createIndicesSql = @"
-- Create indices if they don't exist
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_SchemeId')
    CREATE INDEX [IX_SchemeApplications_SchemeId] ON [SchemeApplications] ([SchemeId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_ReviewedByUserId')
    CREATE INDEX [IX_SchemeApplications_ReviewedByUserId] ON [SchemeApplications] ([ReviewedByUserId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_UserId')
    CREATE INDEX [IX_SchemeApplications_UserId] ON [SchemeApplications] ([UserId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Schemes_Category') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'Schemes')
    CREATE INDEX [IX_Schemes_Category] ON [Schemes] ([Category]);
                        ";

                        try
                        {
                            // Execute the SQL commands with safety checks
                            await context.Database.ExecuteSqlRawAsync(createSchemeApplicationsTableSql);
                            logger.LogInformation("Created or updated SchemeApplications table");

                            await context.Database.ExecuteSqlRawAsync(createIndicesSql);
                            logger.LogInformation("Created or updated indices for scheme tables");
                        }
                        catch (Exception ex)
                        {
                            // Log exception but continue execution
                            logger.LogError(ex, "Error creating SchemeApplications table or indices");
                        }
                    }

                    // Record the migration in __EFMigrationsHistory if it's not there
                    string migrationId = "20250309000000_AddSchemeModels";
                    string productVersion = "8.0.0";

                    // Check if migration record exists using direct SQL
                    var sql = $"IF EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = '{migrationId}') SELECT 1 ELSE SELECT 0";

                    try
                    {
                        var command = context.Database.GetDbConnection().CreateCommand();
                        command.CommandText = sql;

                        // Ensure connection is open
                        if (command.Connection.State != System.Data.ConnectionState.Open)
                            await command.Connection.OpenAsync();

                        var result = await command.ExecuteScalarAsync();
                        bool migrationExists = Convert.ToInt32(result) == 1;

                        if (!migrationExists)
                        {
                            // Add migration record
                            await context.Database.ExecuteSqlAsync(
                                $"INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('{migrationId}', '{productVersion}')");
                            logger.LogInformation($"Added migration record {migrationId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Error checking or adding migration record");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error setting up database tables");
                }
            }
        }

        private static async Task<bool> CanAccessTable(ApplicationDbContext context, string tableName, ILogger logger)
        {
            try
            {
                // Try a direct SQL approach to check if table exists and is accessible
                var sql = $"IF OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL SELECT 1 ELSE SELECT 0";

                var command = context.Database.GetDbConnection().CreateCommand();
                command.CommandText = sql;

                // Ensure connection is open
                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();

                var result = await command.ExecuteScalarAsync();
                bool exists = Convert.ToInt32(result) == 1;

                logger.LogInformation($"Table {tableName} exists and is accessible: {exists}");
                return exists;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error checking if table {tableName} is accessible");
                return false;
            }
        }
    }
}