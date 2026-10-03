using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;
using MercadoLibre.Api.Models;

namespace MercadoLibre.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register(
            [FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("El nombre es obligatorio.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("El correo es obligatorio.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("La contraseña es obligatoria.");
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == email);

            if (emailExists)
            {
                return BadRequest("El correo ya está registrado.");
            }

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = email,
                Password = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(ToResponse(user));
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserResponse>> Login(
            [FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Correo y contraseña son obligatorios.");
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return Unauthorized("Credenciales inválidas.");
            }

            // Verifica contraseñas nuevas almacenadas como hash.
            if (VerifyPassword(request.Password, user.Password))
            {
                return Ok(ToResponse(user));
            }

            // Si existe un usuario antiguo cuya contraseña estaba
            // almacenada en texto plano, la convertimos a hash
            // automáticamente después de un login correcto.
            if (user.Password == request.Password)
            {
                user.Password = HashPassword(request.Password);

                await _context.SaveChangesAsync();

                return Ok(ToResponse(user));
            }

            return Unauthorized("Credenciales inválidas.");
        }

        private static string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);

            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                100_000,
                HashAlgorithmName.SHA256,
                32);

            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        private static bool VerifyPassword(
            string password,
            string storedPassword)
        {
            try
            {
                var parts = storedPassword.Split(':');

                if (parts.Length != 2)
                {
                    return false;
                }

                byte[] salt = Convert.FromBase64String(parts[0]);
                byte[] storedHash = Convert.FromBase64String(parts[1]);

                byte[] calculatedHash = Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    100_000,
                    HashAlgorithmName.SHA256,
                    32);

                return CryptographicOperations.FixedTimeEquals(
                    storedHash,
                    calculatedHash);
            }
            catch
            {
                return false;
            }
        }

        private static UserResponse ToResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }

    public class UserResponse
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}