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

        // New models for schemes
        public DbSet<Scheme> Schemes { get; set; } = null!;
        public DbSet<SchemeApplication> SchemeApplications { get; set; } = null!;

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

            // New relationships for schemes
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
        }
    }
}