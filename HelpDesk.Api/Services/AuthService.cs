using HelpDesk.Api.Data;
using HelpDesk.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelpDesk.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<(bool ok, string message)> RegisterAsync(string name, string email, string password)
    {
        email = email.Trim().ToLower();

        var exists = await _db.Users.AnyAsync(u => u.Email == email);
        if (exists) return (false, "Email ya registrado.");

        var user = new User { Name = name.Trim(), Email = email };
        user.PasswordHash = _hasher.HashPassword(user, password);

        var requesterRole = await _db.Roles.FirstAsync(r => r.Name == "Requester");

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = requesterRole.Id });
        await _db.SaveChangesAsync();

        return (true, "Usuario creado.");
    }

    public async Task<(bool ok, string tokenOrMessage)> LoginAsync(string email, string password)
    {
        email = email.Trim().ToLower();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user is null) return (false, "Credenciales inválidas.");

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result == PasswordVerificationResult.Failed) return (false, "Credenciales inválidas.");

        var token = GenerateJwt(user);
        return (true, token);
    }

    private string GenerateJwt(User user)
    {
        var key = _config["Jwt:Key"]!;
        var issuer = _config["Jwt:Issuer"]!;
        var audience = _config["Jwt:Audience"]!;

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
        };

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct();
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(6),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
