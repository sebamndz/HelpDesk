using HelpDesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketComment> TicketComments => Set<TicketComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany()
            .HasForeignKey(ur => ur.RoleId);

        modelBuilder.Entity<Ticket>()
            .Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Ticket>()
            .Property(t => t.Description)
            .IsRequired();

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.CreatedByUser)
            .WithMany(u => u.CreatedTickets)
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedToUser)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TicketComment>()
            .Property(tc => tc.Comment)
            .IsRequired();

        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.Ticket)
            .WithMany(t => t.Comments)
            .HasForeignKey(tc => tc.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.User)
            .WithMany(u => u.TicketComments)
            .HasForeignKey(tc => tc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Agent" },
            new Role { Id = 3, Name = "Requester" }
        );

        base.OnModelCreating(modelBuilder);
    }
}
