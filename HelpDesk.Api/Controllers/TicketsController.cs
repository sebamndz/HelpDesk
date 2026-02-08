using System.Security.Claims;
using HelpDesk.Api.Data;
using HelpDesk.Api.Dtos;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TicketsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "Requester")]
    public async Task<ActionResult<TicketResponse>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = TicketStatus.Open,
            CreatedByUserId = userId.Value,
            CreatedAt = DateTime.UtcNow
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        var response = ToTicketResponse(ticket);
        return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<List<TicketResponse>>> GetTickets()
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var query = _db.Tickets.AsNoTracking();
        if (!IsAgentOrAdmin(User))
        {
            query = query.Where(t => t.CreatedByUserId == userId.Value);
        }

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToTicketResponse(t))
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketDetailResponse>> GetTicketById(int id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var ticket = await _db.Tickets
            .AsNoTracking()
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
        {
            return NotFound();
        }

        if (!IsAgentOrAdmin(User) && ticket.CreatedByUserId != userId.Value)
        {
            return Forbid();
        }

        var response = new TicketDetailResponse(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Status,
            ticket.Priority,
            ticket.CreatedAt,
            ticket.CreatedByUserId,
            ticket.AssignedToUserId,
            ticket.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new TicketCommentResponse(
                    c.Id,
                    c.TicketId,
                    c.UserId,
                    c.Comment,
                    c.CreatedAt))
                .ToList()
        );

        return Ok(response);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<TicketResponse>> UpdateStatus(int id, [FromBody] UpdateTicketStatusRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null)
        {
            return NotFound();
        }

        ticket.Status = request.Status;
        await _db.SaveChangesAsync();

        return Ok(ToTicketResponse(ticket));
    }

    [HttpPatch("{id:int}/assign")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<TicketResponse>> AssignTicket(int id, [FromBody] AssignTicketRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null)
        {
            return NotFound();
        }

        if (request.AssignedToUserId.HasValue)
        {
            var userExists = await _db.Users.AnyAsync(u => u.Id == request.AssignedToUserId.Value);
            if (!userExists)
            {
                return BadRequest(new { message = "Assigned user not found." });
            }
        }

        ticket.AssignedToUserId = request.AssignedToUserId;
        await _db.SaveChangesAsync();

        return Ok(ToTicketResponse(ticket));
    }

    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<TicketCommentResponse>> AddComment(int id, [FromBody] AddTicketCommentRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null)
        {
            return NotFound();
        }

        if (!IsAgentOrAdmin(User) && ticket.CreatedByUserId != userId.Value)
        {
            return Forbid();
        }

        var comment = new TicketComment
        {
            TicketId = ticket.Id,
            UserId = userId.Value,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.TicketComments.Add(comment);
        await _db.SaveChangesAsync();

        var response = new TicketCommentResponse(
            comment.Id,
            comment.TicketId,
            comment.UserId,
            comment.Comment,
            comment.CreatedAt);

        return Ok(response);
    }

    private static TicketResponse ToTicketResponse(Ticket ticket)
        => new(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Status,
            ticket.Priority,
            ticket.CreatedAt,
            ticket.CreatedByUserId,
            ticket.AssignedToUserId
        );

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }

    private static bool IsAgentOrAdmin(ClaimsPrincipal user)
        => user.IsInRole("Admin") || user.IsInRole("Agent");
}
