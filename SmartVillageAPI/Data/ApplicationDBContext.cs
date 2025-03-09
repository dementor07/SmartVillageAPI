using Microsoft.EntityFrameworkCore;
using SmartVillageAPI.Models;

namespace SmartVillageAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<ServiceRequest> ServiceRequests { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<Certificate> Certificates { get; set; } = null!;
        public DbSet<ServiceCategory> ServiceCategories { get; set; } = null!;

        // Models for schemes
        public DbSet<Scheme> Schemes { get; set; } = null!;
        public DbSet<SchemeApplication> SchemeApplications { get; set; } = null!;

        // New services models
        public DbSet<LandRevenue> LandRevenues { get; set; } = null!;
        public DbSet<LandRevenueServiceType> LandRevenueServiceTypes { get; set; } = null!;
        public DbSet<DisputeResolution> DisputeResolutions { get; set; } = null!;
        public DbSet<DisasterManagement> DisasterManagements { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraint on email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.EmailId)
                .IsUnique();

            // Relationships
            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.User)
                .WithMany()
                .HasForeignKey(sr => sr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Announcement>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Certificate>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Scheme relationships
            modelBuilder.Entity<SchemeApplication>()
                .HasOne(sa => sa.Scheme)
                .WithMany()
                .HasForeignKey(sa => sa.SchemeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SchemeApplication>()
                .HasOne(sa => sa.User)
                .WithMany()
                .HasForeignKey(sa => sa.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SchemeApplication>()
                .HasOne(sa => sa.ReviewedByUser)
                .WithMany()
                .HasForeignKey(sa => sa.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Land Revenue relationships
            modelBuilder.Entity<LandRevenue>()
                .HasOne(lr => lr.User)
                .WithMany()
                .HasForeignKey(lr => lr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LandRevenue>()
                .HasOne(lr => lr.ReviewedByUser)
                .WithMany()
                .HasForeignKey(lr => lr.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Dispute Resolution relationships
            modelBuilder.Entity<DisputeResolution>()
                .HasOne(dr => dr.User)
                .WithMany()
                .HasForeignKey(dr => dr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DisputeResolution>()
                .HasOne(dr => dr.ReviewedByUser)
                .WithMany()
                .HasForeignKey(dr => dr.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Disaster Management relationships
            modelBuilder.Entity<DisasterManagement>()
                .HasOne(dm => dm.User)
                .WithMany()
                .HasForeignKey(dm => dm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DisasterManagement>()
                .HasOne(dm => dm.ReviewedByUser)
                .WithMany()
                .HasForeignKey(dm => dm.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        }
    }
}