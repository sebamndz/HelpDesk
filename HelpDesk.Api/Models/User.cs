namespace HelpDesk.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<UserRole> UserRoles { get; set; } = new();
    public List<Ticket> CreatedTickets { get; set; } = new();
    public List<Ticket> AssignedTickets { get; set; } = new();
    public List<TicketComment> TicketComments { get; set; } = new();
}
