using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;
using System.Reflection;

namespace SmartVillageAPI.Utilities
{
    /// <summary>
    /// Utility to fix database migration issues
    /// </summary>
    public static class MigrationFixUtility
    {
        /// <summary>
        /// Applies all pending migrations and ensures all tables exist
        /// </summary>
        public static async Task FixMigrations(ApplicationDbContext context, ILogger logger)
        {
            logger.LogInformation("Starting migration fix utility...");

            try
            {
                // First check if we can connect to the database
                if (await context.Database.CanConnectAsync())
                {
                    logger.LogInformation("Connected to database successfully");

                    // Check for pending migrations
                    var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        logger.LogInformation($"Found {pendingList.Count} pending migrations: {string.Join(", ", pendingList)}");

                        // Apply all pending migrations
                        await context.Database.MigrateAsync();
                        logger.LogInformation("Applied all pending migrations successfully");
                    }
                    else
                    {
                        logger.LogInformation("No pending migrations found in EF Core migration history");

                        // Even if no pending migrations, ensure all tables exist
                        await EnsureTablesExist(context, logger);
                    }
                }
                else
                {
                    logger.LogError("Cannot connect to database");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fixing migrations");
            }
        }

        /// <summary>
        /// Ensures that all required tables exist, creating them if necessary
        /// </summary>
        private static async Task EnsureTablesExist(ApplicationDbContext context, ILogger logger)
        {
            logger.LogInformation("Ensuring all required tables exist...");

            var requiredTables = new[]
            {
                "Users", "Announcements", "ServiceRequests", "Certificates",
                "Schemes", "SchemeApplications", "ServiceCategories",
                "LandRevenueServiceTypes", "LandRevenues",
                "DisputeResolutions", "DisasterManagements"
            };

            // Check tables one by one with separate connections for each check
            foreach (var table in requiredTables)
            {
                bool exists = false;

                try
                {
                    exists = await TableExistsScoped(context, table, logger);
                    logger.LogInformation($"Table '{table}' exists: {exists}");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, $"Error checking table {table}");
                    continue;
                }

                if (!exists)
                {
                    try
                    {
                        await CreateTableScoped(context, table, logger);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, $"Error creating table {table}");
                    }
                }
            }
        }

        /// <summary>
        /// Checks if a table exists using the current context
        /// </summary>
        private static async Task<bool> TableExistsScoped(ApplicationDbContext context, string tableName, ILogger logger)
        {
            try
            {
                var sql = $"SELECT CASE WHEN OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL THEN 1 ELSE 0 END";
                var result = await context.Database.ExecuteSqlRawAsync(sql);
                return result == 1;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error checking existence of table {tableName}");
                return false;
            }
        }

        /// <summary>
        /// Creates a table based on migration definitions
        /// </summary>
        private static async Task CreateTableScoped(ApplicationDbContext context, string tableName, ILogger logger)
        {
            logger.LogInformation($"Checking table: {tableName}");

            try
            {
                // Check if table already exists
                var existsSql = $"SELECT CASE WHEN OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL THEN 1 ELSE 0 END";
                var result = await context.Database.ExecuteSqlRawAsync(existsSql);

                if (result == 1)
                {
                    logger.LogInformation($"Table {tableName} already exists. Skipping creation.");
                    return;
                }

                // If table doesn't exist, try to create it
                string createTableSql = GetCreateTableSql(tableName);

                if (!string.IsNullOrEmpty(createTableSql))
                {
                    await context.Database.ExecuteSqlRawAsync(createTableSql);
                    logger.LogInformation($"Created table: {tableName}");
                }
                else
                {
                    logger.LogWarning($"No SQL definition found for table: {tableName}");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error processing table {tableName}");
            }
        }
        /// <summary>
        /// Gets the SQL statements for creating each table
        /// </summary>
        private static string GetCreateTableSql(string tableName)
        {
            switch (tableName)
            {
                case "Users":
                    return @"
CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [FullName] nvarchar(100) NOT NULL,
    [MobileNo] nvarchar(15) NOT NULL,
    [EmailId] nvarchar(100) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [PasswordSalt] nvarchar(max) NOT NULL,
    [State] nvarchar(50) NOT NULL,
    [District] nvarchar(50) NOT NULL,
    [Village] nvarchar(50) NOT NULL,
    [Address] nvarchar(200) NOT NULL,
    [RoleName] nvarchar(20) NOT NULL DEFAULT 'Resident',
    [CreatedAt] datetime2 NOT NULL,
    [LastLoginAt] datetime2 NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
    CONSTRAINT [UQ_Users_EmailId] UNIQUE ([EmailId])
);";

                case "Announcements":
                    return @"
CREATE TABLE [Announcements] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(100) NOT NULL,
    [Content] nvarchar(1000) NOT NULL,
    [Category] nvarchar(50) NOT NULL,
    [IsPublished] bit NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NULL,
    CONSTRAINT [PK_Announcements] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Announcements_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);";

                case "ServiceRequests":
                    return @"
CREATE TABLE [ServiceRequests] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [AssignedToUserId] int NULL,
    [Title] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [Category] nvarchar(50) NOT NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [Resolution] nvarchar(500) NULL,
    [Location] nvarchar(200) NULL,
    [Ward] nvarchar(50) NULL,
    [Landmark] nvarchar(50) NULL,
    [Priority] nvarchar(20) NULL DEFAULT 'Normal',
    [ReferenceNumber] nvarchar(50) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    [LastUpdatedAt] datetime2 NULL,
    [AttachmentUrl] nvarchar(max) NULL,
    CONSTRAINT [PK_ServiceRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ServiceRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ServiceRequests_Users_AssignedToUserId] FOREIGN KEY ([AssignedToUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);";

                case "Certificates":
                    return @"
CREATE TABLE [Certificates] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [CertificateType] nvarchar(100) NOT NULL,
    [ApplicantName] nvarchar(200) NOT NULL,
    [Gender] nvarchar(10) NULL,
    [Age] int NULL,
    [Address] nvarchar(500) NULL,
    [FatherName] nvarchar(200) NULL,
    [Religion] nvarchar(50) NULL,
    [Caste] nvarchar(50) NULL,
    [PostOffice] nvarchar(100) NULL,
    [PinCode] nvarchar(20) NULL,
    [State] nvarchar(50) NULL,
    [District] nvarchar(50) NULL,
    [Village] nvarchar(50) NULL,
    [Taluk] nvarchar(50) NULL,
    [Location] nvarchar(100) NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [ReferenceNumber] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ReviewedAt] datetime2 NULL,
    CONSTRAINT [PK_Certificates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Certificates_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);";

                case "Schemes":
                    return @"
CREATE TABLE [Schemes] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [Category] nvarchar(50) NOT NULL,
    [EligibilityCriteria] nvarchar(max) NOT NULL,
    [FormFields] nvarchar(max) NOT NULL,
    [Benefits] nvarchar(1000) NOT NULL,
    [RequiredDocuments] nvarchar(1000) NOT NULL,
    [Department] nvarchar(200) NOT NULL,
    [MoreInfoUrl] nvarchar(255) NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Schemes] PRIMARY KEY ([Id])
);
CREATE NONCLUSTERED INDEX [IX_Schemes_Category] ON [Schemes] ([Category]);";

                case "SchemeApplications":
                    return @"
CREATE TABLE [SchemeApplications] (
    [Id] int NOT NULL IDENTITY,
    [SchemeId] int NOT NULL,
    [UserId] int NOT NULL,
    [ApplicationData] nvarchar(max) NOT NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [ReferenceNumber] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [SupportingDocuments] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [SubmittedAt] datetime2 NULL,
    [ReviewedAt] datetime2 NULL,
    [ReviewedByUserId] int NULL,
    CONSTRAINT [PK_SchemeApplications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SchemeApplications_Schemes_SchemeId] FOREIGN KEY ([SchemeId]) REFERENCES [Schemes] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_SchemeApplications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SchemeApplications_Users_ReviewedByUserId] FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
CREATE NONCLUSTERED INDEX [IX_SchemeApplications_SchemeId] ON [SchemeApplications] ([SchemeId]);
CREATE NONCLUSTERED INDEX [IX_SchemeApplications_UserId] ON [SchemeApplications] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_SchemeApplications_ReviewedByUserId] ON [SchemeApplications] ([ReviewedByUserId]);";

                case "ServiceCategories":
                    return @"
CREATE TABLE [ServiceCategories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [Icon] nvarchar(50) NOT NULL,
    [ColorClass] nvarchar(50) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    [DisplayOrder] int NOT NULL,
    CONSTRAINT [PK_ServiceCategories] PRIMARY KEY ([Id])
);";

                case "LandRevenueServiceTypes":
                    return @"
CREATE TABLE [LandRevenueServiceTypes] (
    [Id] int NOT NULL IDENTITY,
    [ServiceName] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [RequiredDocuments] nvarchar(1000) NOT NULL,
    [ProcessingTime] nvarchar(100) NOT NULL,
    [Fees] decimal(18,2) NOT NULL,
    [IsActive] bit NOT NULL DEFAULT 1,
    CONSTRAINT [PK_LandRevenueServiceTypes] PRIMARY KEY ([Id])
);";

                case "LandRevenues":
                    return @"
CREATE TABLE [LandRevenues] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [ServiceType] nvarchar(100) NOT NULL,
    [SurveyNumber] nvarchar(50) NOT NULL,
    [Village] nvarchar(50) NOT NULL,
    [Taluk] nvarchar(50) NOT NULL,
    [District] nvarchar(50) NOT NULL,
    [LandOwnerName] nvarchar(200) NOT NULL,
    [LandArea] nvarchar(50) NULL,
    [LandType] nvarchar(50) NULL,
    [PattaNumber] nvarchar(100) NULL,
    [TaxReceiptNumber] nvarchar(100) NULL,
    [AdditionalDetails] nvarchar(1000) NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [ReferenceNumber] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    [DocumentData] nvarchar(max) NULL,
    [FeesAmount] decimal(18,2) NULL,
    [PaymentStatus] nvarchar(50) NULL,
    [TransactionId] nvarchar(50) NULL,
    [PaymentDate] datetime2 NULL,
    [ReviewedByUserId] int NULL,
    CONSTRAINT [PK_LandRevenues] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LandRevenues_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LandRevenues_Users_ReviewedByUserId] FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
CREATE NONCLUSTERED INDEX [IX_LandRevenues_UserId] ON [LandRevenues] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_LandRevenues_ReviewedByUserId] ON [LandRevenues] ([ReviewedByUserId]);";

                case "DisputeResolutions":
                    return @"
CREATE TABLE [DisputeResolutions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(100) NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [DisputeType] nvarchar(50) NOT NULL,
    [PartiesInvolved] nvarchar(50) NOT NULL,
    [Location] nvarchar(100) NULL,
    [DisputeDate] datetime2 NOT NULL,
    [PriorResolutionAttempts] nvarchar(1000) NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [Resolution] nvarchar(1000) NULL,
    [MediaterAssigned] nvarchar(50) NULL,
    [HearingDate] datetime2 NULL,
    [ReferenceNumber] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    [ReviewedByUserId] int NULL,
    [DocumentData] nvarchar(max) NULL,
    CONSTRAINT [PK_DisputeResolutions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DisputeResolutions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DisputeResolutions_Users_ReviewedByUserId] FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
CREATE NONCLUSTERED INDEX [IX_DisputeResolutions_UserId] ON [DisputeResolutions] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_DisputeResolutions_ReviewedByUserId] ON [DisputeResolutions] ([ReviewedByUserId]);";

                case "DisasterManagements":
                    return @"
CREATE TABLE [DisasterManagements] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(100) NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [DisasterType] nvarchar(50) NOT NULL,
    [Location] nvarchar(100) NOT NULL,
    [OccurrenceDate] datetime2 NOT NULL,
    [Severity] nvarchar(20) NULL,
    [ImpactedArea] nvarchar(50) NULL,
    [AffectedCount] nvarchar(20) NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT 'Pending',
    [Response] nvarchar(1000) NULL,
    [AssignedTeam] nvarchar(100) NULL,
    [ReferenceNumber] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    [ReviewedByUserId] int NULL,
    [ImageData] nvarchar(max) NULL,
    CONSTRAINT [PK_DisasterManagements] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DisasterManagements_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DisasterManagements_Users_ReviewedByUserId] FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
CREATE NONCLUSTERED INDEX [IX_DisasterManagements_UserId] ON [DisasterManagements] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_DisasterManagements_ReviewedByUserId] ON [DisasterManagements] ([ReviewedByUserId]);";

                default:
                    return string.Empty;
            }
        }
    }
}