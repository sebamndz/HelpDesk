using HelpDesk.Api.Models;

namespace HelpDesk.Api.Dtos;

public record CreateTicketRequest(string Title, string Description, TicketPriority Priority);

public record UpdateTicketStatusRequest(TicketStatus Status);

public record AssignTicketRequest(int? AssignedToUserId);

public record AddTicketCommentRequest(string Comment);
