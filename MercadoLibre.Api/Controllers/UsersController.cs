using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;

namespace MercadoLibre.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }


        // ==================================================
        // BUSCAR USUARIOS
        // GET: api/Users
        // GET: api/Users?search=miguel
        // ==================================================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> SearchUsers(
            [FromQuery] string? search)
        {
            var query = _context.Users
                .Where(u =>
                    u.Email
                        .ToLower()
                        .EndsWith("@uemam.edu.ec"))
                .AsQueryable();


            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(u =>
                    u.Name.Contains(search) ||
                    u.Email.Contains(search));
            }


            var users = await query
                .OrderBy(u => u.Name)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.CreatedAt
                })
                .ToListAsync();


            return Ok(users);
        }


        // ==================================================
        // OBTENER USUARIO
        // GET: api/Users/5
        // ==================================================

        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>> GetUser(
            int id)
        {
            var user = await _context.Users
                .Where(u =>
                    u.Id == id &&
                    u.Email
                        .ToLower()
                        .EndsWith("@uemam.edu.ec"))
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();


            if (user == null)
            {
                return NotFound(
                    "Usuario institucional no encontrado."
                );
            }


            return Ok(user);
        }
    }
}