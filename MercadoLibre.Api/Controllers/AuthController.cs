using System.Security.Cryptography;
using Google.Apis.Auth;
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
        private const string GoogleClientId =
            "232132447961-be5jqhlk45olm4iavq2k4qq6fi2ho2f7.apps.googleusercontent.com";

        private const string InstitutionalDomain =
            "uemam.edu.ec";

        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // ==================================================
        // REGISTRO NORMAL
        // ==================================================

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register(
            [FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(
                    "El nombre es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(
                    "El correo es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(
                    "La contraseña es obligatoria."
                );
            }

            var email =
                request.Email
                    .Trim()
                    .ToLowerInvariant();

            if (!IsInstitutionalEmail(email))
            {
                return BadRequest(
                    "Solo se permiten correos institucionales @uemam.edu.ec."
                );
            }

            if (request.Password.Length < 4)
            {
                return BadRequest(
                    "La contraseña debe tener al menos 4 caracteres."
                );
            }

            var emailExists =
                await _context.Users
                    .AnyAsync(u => u.Email == email);

            if (emailExists)
            {
                return BadRequest(
                    "El correo ya está registrado."
                );
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


        // ==================================================
        // LOGIN NORMAL
        // ==================================================

        [HttpPost("login")]
        public async Task<ActionResult<UserResponse>> Login(
            [FromBody] LoginRequest request)
        {
            if (
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password)
            )
            {
                return BadRequest(
                    "Correo y contraseña son obligatorios."
                );
            }

            var email =
                request.Email
                    .Trim()
                    .ToLowerInvariant();

            if (!IsInstitutionalEmail(email))
            {
                return Unauthorized(
                    "Solo puedes iniciar sesión con un correo @uemam.edu.ec."
                );
            }

            var user =
                await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.Email == email
                    );

            if (user == null)
            {
                return Unauthorized(
                    "Credenciales inválidas."
                );
            }

            // ----------------------------------------------
            // CONTRASEÑA HASH
            // ----------------------------------------------

            if (
                VerifyPassword(
                    request.Password,
                    user.Password
                )
            )
            {
                return Ok(ToResponse(user));
            }

            // ----------------------------------------------
            // COMPATIBILIDAD CON CUENTAS ANTIGUAS
            // ----------------------------------------------

            if (user.Password == request.Password)
            {
                user.Password =
                    HashPassword(request.Password);

                await _context.SaveChangesAsync();

                return Ok(ToResponse(user));
            }

            return Unauthorized(
                "Credenciales inválidas."
            );
        }


        // ==================================================
        // LOGIN CON GOOGLE
        // ==================================================

        [HttpPost("google")]
        public async Task<ActionResult<UserResponse>> GoogleLogin(
            [FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Credential))
            {
                return BadRequest(
                    "No se recibió el token de Google."
                );
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        request.Credential,
                        new GoogleJsonWebSignature.ValidationSettings
                        {
                            Audience = new[]
                            {
                                GoogleClientId
                            },

                            HostedDomain =
                                InstitutionalDomain
                        }
                    );
            }
            catch
            {
                return Unauthorized(
                    "El token de Google no es válido."
                );
            }

            // ----------------------------------------------
            // CORREO VERIFICADO
            // ----------------------------------------------

            if (!payload.EmailVerified)
            {
                return Unauthorized(
                    "El correo de Google no está verificado."
                );
            }

            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                return Unauthorized(
                    "Google no proporcionó un correo válido."
                );
            }

            var email =
                payload.Email
                    .Trim()
                    .ToLowerInvariant();

            // ----------------------------------------------
            // DOMINIO INSTITUCIONAL
            // ----------------------------------------------

            if (!IsInstitutionalEmail(email))
            {
                return Unauthorized(
                    "Solo se permiten cuentas @uemam.edu.ec."
                );
            }

            // ----------------------------------------------
            // GOOGLE WORKSPACE
            // ----------------------------------------------

            if (
                string.IsNullOrWhiteSpace(payload.HostedDomain) ||
                !payload.HostedDomain.Equals(
                    InstitutionalDomain,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return Unauthorized(
                    "La cuenta de Google no pertenece al dominio institucional."
                );
            }

            // ----------------------------------------------
            // BUSCAR USUARIO
            // ----------------------------------------------

            var user =
                await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.Email == email
                    );

            // ----------------------------------------------
            // CREAR USUARIO SI NO EXISTE
            // ----------------------------------------------

            if (user == null)
            {
                var name =
                    string.IsNullOrWhiteSpace(payload.Name)
                        ? email.Split('@')[0]
                        : payload.Name.Trim();

                user = new User
                {
                    Name = name,
                    Email = email,

                    // Cuenta administrada por Google.
                    Password = string.Empty,

                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                await _context.SaveChangesAsync();
            }

            return Ok(
                ToResponse(user)
            );
        }


        // ==================================================
        // COMPROBAR DOMINIO
        // ==================================================

        private static bool IsInstitutionalEmail(
            string email)
        {
            return email.EndsWith(
                "@uemam.edu.ec",
                StringComparison.OrdinalIgnoreCase
            );
        }


        // ==================================================
        // HASH DE CONTRASEÑA
        // ==================================================

        private static string HashPassword(
            string password)
        {
            byte[] salt =
                RandomNumberGenerator.GetBytes(16);

            byte[] hash =
                Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    100_000,
                    HashAlgorithmName.SHA256,
                    32
                );

            return
                $"{Convert.ToBase64String(salt)}:" +
                $"{Convert.ToBase64String(hash)}";
        }


        // ==================================================
        // VERIFICAR CONTRASEÑA
        // ==================================================

        private static bool VerifyPassword(
            string password,
            string storedPassword)
        {
            try
            {
                var parts =
                    storedPassword.Split(':');

                if (parts.Length != 2)
                {
                    return false;
                }

                byte[] salt =
                    Convert.FromBase64String(parts[0]);

                byte[] storedHash =
                    Convert.FromBase64String(parts[1]);

                byte[] calculatedHash =
                    Rfc2898DeriveBytes.Pbkdf2(
                        password,
                        salt,
                        100_000,
                        HashAlgorithmName.SHA256,
                        32
                    );

                return CryptographicOperations
                    .FixedTimeEquals(
                        storedHash,
                        calculatedHash
                    );
            }
            catch
            {
                return false;
            }
        }


        // ==================================================
        // RESPUESTA DEL USUARIO
        // ==================================================

        private static UserResponse ToResponse(
            User user)
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


    // ======================================================
    // REQUESTS
    // ======================================================

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


    public class GoogleLoginRequest
    {
        public string Credential { get; set; } = string.Empty;
    }


    // ======================================================
    // RESPONSE
    // ======================================================

    public class UserResponse
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
