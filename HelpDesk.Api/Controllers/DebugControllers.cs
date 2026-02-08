using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("debug")]
public class DebugController : ControllerBase
{
    [HttpGet("claims")]
    [Authorize]
    public IActionResult Claims()
        => Ok(User.Claims.Select(c => new { c.Type, c.Value }));
}
