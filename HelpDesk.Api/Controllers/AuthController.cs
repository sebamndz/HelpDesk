using HelpDesk.Api.Dtos;
using HelpDesk.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (ok, message) = await _auth.RegisterAsync(req.Name, req.Email, req.Password);
        return ok ? Ok(new { message }) : BadRequest(new { message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (ok, tokenOrMessage) = await _auth.LoginAsync(req.Email, req.Password);
        return ok ? Ok(new { token = tokenOrMessage }) : Unauthorized(new { message = tokenOrMessage });
    }
}
