using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("test")]
public class TestController : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
        => Ok(new { message = "Autenticado ✅" });

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
        => Ok(new { message = "Solo Admin ✅" });
}
