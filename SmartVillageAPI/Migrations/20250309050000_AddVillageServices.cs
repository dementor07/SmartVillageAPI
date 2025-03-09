using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartVillageAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddVillageServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create ServiceCategories table
            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ColorClass = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                });

            // Update ServiceRequests table to add additional fields
            migrationBuilder.AddColumn<int>(
                name: "AssignedToUserId",
                table: "ServiceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Landmark",
                table: "ServiceRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "ServiceRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "ServiceRequests",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "ServiceRequests",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                defaultValue: "Normal");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNumber",
                table: "ServiceRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ward",
                table: "ServiceRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            // Create the Land Revenue tables
            migrationBuilder.CreateTable(
                name: "LandRevenueServiceTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequiredDocuments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ProcessingTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fees = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandRevenueServiceTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandRevenues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SurveyNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Village = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Taluk = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    District = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LandOwnerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LandArea = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LandType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PattaNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TaxReceiptNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdditionalDetails = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovalComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    DocumentData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeesAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TransactionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandRevenues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LandRevenues_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LandRevenues_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create Dispute Resolution table
            migrationBuilder.CreateTable(
                name: "DisputeResolutions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DisputeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PartiesInvolved = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DisputeDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PriorResolutionAttempts = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Resolution = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MediaterAssigned = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    HearingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    DocumentData = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeResolutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DisputeResolutions_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeResolutions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create Disaster Management table
            migrationBuilder.CreateTable(
                name: "DisasterManagements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DisasterType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OccurrenceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ImpactedArea = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AffectedCount = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Response = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AssignedTeam = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ImageData = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisasterManagements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DisasterManagements_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisasterManagements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Add Foreign Key for ServiceRequests.AssignedToUserId
            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_AssignedToUserId",
                table: "ServiceRequests",
                column: "AssignedToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Users_AssignedToUserId",
                table: "ServiceRequests",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Add indices for other tables
            migrationBuilder.CreateIndex(
                name: "IX_DisasterManagements_ReviewedByUserId",
                table: "DisasterManagements",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DisasterManagements_UserId",
                table: "DisasterManagements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeResolutions_ReviewedByUserId",
                table: "DisputeResolutions",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeResolutions_UserId",
                table: "DisputeResolutions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LandRevenues_ReviewedByUserId",
                table: "LandRevenues",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LandRevenues_UserId",
                table: "LandRevenues",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop all new tables in reverse order
            migrationBuilder.DropTable(
                name: "DisasterManagements");

            migrationBuilder.DropTable(
                name: "DisputeResolutions");

            migrationBuilder.DropTable(
                name: "LandRevenues");

            migrationBuilder.DropTable(
                name: "LandRevenueServiceTypes");

            migrationBuilder.DropTable(
                name: "ServiceCategories");

            // Drop foreign key and index for AssignedToUserId
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Users_AssignedToUserId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_AssignedToUserId",
                table: "ServiceRequests");

            // Drop added columns from ServiceRequests
            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Landmark",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "LastUpdatedAt",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ReferenceNumber",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Ward",
                table: "ServiceRequests");
        }
    }
}