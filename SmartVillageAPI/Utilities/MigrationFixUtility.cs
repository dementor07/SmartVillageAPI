using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Data;

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
                // Don't try fallback to avoid connection issues
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
                    // Use a separate DbContext for each operation to avoid connection issues
                    using var scope = new DbContextScope<ApplicationDbContext>(context);
                    exists = await TableExistsScoped(scope.Context, table);
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
                        // Use another separate DbContext for creating table
                        using var scope = new DbContextScope<ApplicationDbContext>(context);
                        await CreateTableScoped(scope.Context, table, logger);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, $"Error creating table {table}");
                    }
                }
            }
        }

        /// <summary>
        /// Helper class to scope DbContext operations
        /// </summary>
        private class DbContextScope<T> : IDisposable where T : DbContext
        {
            public T Context { get; }

            public DbContextScope(T originalContext)
            {
                var options = originalContext.GetDbContextOptions();
                if (options != null)
                {
                    Context = (T)Activator.CreateInstance(typeof(T), options)!;
                }
                else
                {
                    throw new InvalidOperationException("Failed to get DbContext options");
                }
            }

            public void Dispose()
            {
                Context?.Dispose();
            }
        }

        /// <summary>
        /// Extension method to get options from DbContext
        /// </summary>
        private static DbContextOptions<T>? GetDbContextOptions<T>(this T context) where T : DbContext
        {
            var property = context.GetType()
                .GetProperty("ContextOptions", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);

            if (property != null)
            {
                return (DbContextOptions<T>?)property.GetValue(context);
            }

            return null;
        }

        /// <summary>
        /// Checks if a table exists using scoped context
        /// </summary>
        private static async Task<bool> TableExistsScoped(ApplicationDbContext context, string tableName)
        {
            try
            {
                var sql = $"SELECT CASE WHEN OBJECT_ID(N'[dbo].[{tableName}]', N'U') IS NOT NULL THEN 1 ELSE 0 END";
                var result = await context.Database.ExecuteSqlRawAsync(sql);
                return result == 1;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Creates a table based on migration definitions
        /// </summary>
        private static async Task CreateTableScoped(ApplicationDbContext context, string tableName, ILogger logger)
        {
            logger.LogInformation($"Creating missing table: {tableName}");

            string createTableSql = GetCreateTableSql(tableName);

            if (!string.IsNullOrEmpty(createTableSql))
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync(createTableSql);
                    logger.LogInformation($"Created table: {tableName}");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, $"Error creating table: {tableName}");
                }
            }
            else
            {
                logger.LogWarning($"No SQL definition found for table: {tableName}");
            }
        }

        /// <summary>
        /// Gets the SQL statements for creating each table
        /// </summary>
        private static string GetCreateTableSql(string tableName)
        {
            switch (tableName)
            {
                case "ServiceCategories":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceCategories')
BEGIN
    CREATE TABLE [ServiceCategories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Icon] nvarchar(50) NOT NULL,
        [ColorClass] nvarchar(50) NOT NULL,
        [IsActive] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_ServiceCategories] PRIMARY KEY ([Id])
    );
END";

                case "LandRevenueServiceTypes":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LandRevenueServiceTypes')
BEGIN
    CREATE TABLE [LandRevenueServiceTypes] (
        [Id] int NOT NULL IDENTITY,
        [ServiceName] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [RequiredDocuments] nvarchar(1000) NOT NULL,
        [ProcessingTime] nvarchar(100) NOT NULL,
        [Fees] decimal(18,2) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_LandRevenueServiceTypes] PRIMARY KEY ([Id])
    );
END";

                case "SchemeApplications":
                    return @"
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

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_SchemeId')
        CREATE INDEX [IX_SchemeApplications_SchemeId] ON [SchemeApplications] ([SchemeId]);

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_ReviewedByUserId')
        CREATE INDEX [IX_SchemeApplications_ReviewedByUserId] ON [SchemeApplications] ([ReviewedByUserId]);

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SchemeApplications_UserId')
        CREATE INDEX [IX_SchemeApplications_UserId] ON [SchemeApplications] ([UserId]);
END";

                case "Schemes":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Schemes')
BEGIN
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
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Schemes] PRIMARY KEY ([Id])
    );

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Schemes_Category')
        CREATE INDEX [IX_Schemes_Category] ON [Schemes] ([Category]);
END";

                case "LandRevenues":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LandRevenues')
BEGIN
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
        [Status] nvarchar(20) NOT NULL,
        [RejectionReason] nvarchar(1000) NULL,
        [ApprovalComments] nvarchar(1000) NULL,
        [ReferenceNumber] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ResolvedAt] datetime2 NULL,
        [ReviewedByUserId] int NULL,
        [DocumentData] nvarchar(max) NULL,
        [FeesAmount] decimal(18,2) NULL,
        [PaymentStatus] nvarchar(50) NULL,
        [TransactionId] nvarchar(50) NULL,
        [PaymentDate] datetime2 NULL,
        CONSTRAINT [PK_LandRevenues] PRIMARY KEY ([Id])
    );

    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'LandRevenues')
    BEGIN
        ALTER TABLE [LandRevenues] ADD CONSTRAINT [FK_LandRevenues_Users_ReviewedByUserId] 
        FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]);
        
        ALTER TABLE [LandRevenues] ADD CONSTRAINT [FK_LandRevenues_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
    END

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LandRevenues_ReviewedByUserId')
        CREATE INDEX [IX_LandRevenues_ReviewedByUserId] ON [LandRevenues] ([ReviewedByUserId]);

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_LandRevenues_UserId')
        CREATE INDEX [IX_LandRevenues_UserId] ON [LandRevenues] ([UserId]);
END";

                case "DisputeResolutions":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DisputeResolutions')
BEGIN
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
        [Status] nvarchar(20) NOT NULL,
        [Resolution] nvarchar(1000) NULL,
        [MediaterAssigned] nvarchar(50) NULL,
        [HearingDate] datetime2 NULL,
        [ReferenceNumber] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ResolvedAt] datetime2 NULL,
        [ReviewedByUserId] int NULL,
        [DocumentData] nvarchar(max) NULL,
        CONSTRAINT [PK_DisputeResolutions] PRIMARY KEY ([Id])
    );

    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'DisputeResolutions')
    BEGIN
        ALTER TABLE [DisputeResolutions] ADD CONSTRAINT [FK_DisputeResolutions_Users_ReviewedByUserId] 
        FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]);
        
        ALTER TABLE [DisputeResolutions] ADD CONSTRAINT [FK_DisputeResolutions_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
    END

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DisputeResolutions_ReviewedByUserId')
        CREATE INDEX [IX_DisputeResolutions_ReviewedByUserId] ON [DisputeResolutions] ([ReviewedByUserId]);

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DisputeResolutions_UserId')
        CREATE INDEX [IX_DisputeResolutions_UserId] ON [DisputeResolutions] ([UserId]);
END";

                case "DisasterManagements":
                    return @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DisasterManagements')
BEGIN
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
        [Status] nvarchar(20) NOT NULL,
        [Response] nvarchar(1000) NULL,
        [AssignedTeam] nvarchar(100) NULL,
        [ReferenceNumber] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ResolvedAt] datetime2 NULL,
        [ReviewedByUserId] int NULL,
        [ImageData] nvarchar(max) NULL,
        CONSTRAINT [PK_DisasterManagements] PRIMARY KEY ([Id])
    );

    IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users') AND EXISTS (SELECT * FROM sys.tables WHERE name = 'DisasterManagements')
    BEGIN
        ALTER TABLE [DisasterManagements] ADD CONSTRAINT [FK_DisasterManagements_Users_ReviewedByUserId] 
        FOREIGN KEY ([ReviewedByUserId]) REFERENCES [Users] ([Id]);
        
        ALTER TABLE [DisasterManagements] ADD CONSTRAINT [FK_DisasterManagements_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
    END

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DisasterManagements_ReviewedByUserId')
        CREATE INDEX [IX_DisasterManagements_ReviewedByUserId] ON [DisasterManagements] ([ReviewedByUserId]);

    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DisasterManagements_UserId')
        CREATE INDEX [IX_DisasterManagements_UserId] ON [DisasterManagements] ([UserId]);
END";

                default:
                    return string.Empty;
            }
        }
    }
}