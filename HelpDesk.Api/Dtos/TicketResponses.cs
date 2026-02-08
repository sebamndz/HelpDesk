using HelpDesk.Api.Models;

namespace HelpDesk.Api.Dtos;

public record TicketResponse(
    int Id,
    string Title,
    string Description,
    TicketStatus Status,
    TicketPriority Priority,
    DateTime CreatedAt,
    int CreatedByUserId,
    int? AssignedToUserId
);

public record TicketDetailResponse(
    int Id,
    string Title,
    string Description,
    TicketStatus Status,
    TicketPriority Priority,
    DateTime CreatedAt,
    int CreatedByUserId,
    int? AssignedToUserId,
    IReadOnlyList<TicketCommentResponse> Comments
);

public record TicketCommentResponse(
    int Id,
    int TicketId,
    int UserId,
    string Comment,
    DateTime CreatedAt
);
