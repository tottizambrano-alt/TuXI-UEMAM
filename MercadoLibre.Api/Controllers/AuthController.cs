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

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("El correo ya está registrado.");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] User loginData)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginData.Email && u.Password == loginData.Password);
            if (user == null)
                return Unauthorized("Credenciales inválidas.");

            return Ok(user);
        }
    }
}
