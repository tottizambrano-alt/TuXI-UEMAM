using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;
using MercadoLibre.Api.Models;

namespace MercadoLibre.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConversationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConversationsController(
            AppDbContext context)
        {
            _context = context;
        }


        // ==================================================
        // CONVERSACIONES DE UN USUARIO
        // GET: api/Conversations/user/1
        // ==================================================

        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<object>>>
            GetUserConversations(
                int userId)
        {
            // ----------------------------------------------
            // COMPROBAR QUE EL USUARIO SEA INSTITUCIONAL
            // ----------------------------------------------

            var userExists =
                await _context.Users.AnyAsync(u =>
                    u.Id == userId &&
                    u.Email
                        .ToLower()
                        .EndsWith("@uemam.edu.ec"));

            if (!userExists)
            {
                return NotFound(
                    "El usuario no existe o no pertenece a la institución."
                );
            }


            // ----------------------------------------------
            // SOLO CONVERSACIONES ENTRE UEMA
            // ----------------------------------------------

            var conversations =
                await _context.Conversations
                    .Where(c =>
                        (
                            c.User1Id == userId ||
                            c.User2Id == userId
                        )

                        &&

                        _context.Users.Any(u =>
                            u.Id == c.User1Id &&
                            u.Email
                                .ToLower()
                                .EndsWith("@uemam.edu.ec"))

                        &&

                        _context.Users.Any(u =>
                            u.Id == c.User2Id &&
                            u.Email
                                .ToLower()
                                .EndsWith("@uemam.edu.ec"))
                    )
                    .OrderByDescending(
                        c => c.CreatedAt)
                    .Select(c => new
                    {
                        c.Id,
                        c.User1Id,
                        c.User2Id,
                        c.CreatedAt
                    })
                    .ToListAsync();


            return Ok(conversations);
        }


        // ==================================================
        // OBTENER CONVERSACIÓN
        // GET: api/Conversations/1
        // ==================================================

        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>>
            GetConversation(int id)
        {
            var conversation =
                await _context.Conversations
                    .Where(c =>
                        c.Id == id &&

                        _context.Users.Any(u =>
                            u.Id == c.User1Id &&
                            u.Email
                                .ToLower()
                                .EndsWith("@uemam.edu.ec"))

                        &&

                        _context.Users.Any(u =>
                            u.Id == c.User2Id &&
                            u.Email
                                .ToLower()
                                .EndsWith("@uemam.edu.ec"))
                    )
                    .Select(c => new
                    {
                        c.Id,
                        c.User1Id,
                        c.User2Id,
                        c.CreatedAt
                    })
                    .FirstOrDefaultAsync();


            if (conversation == null)
            {
                return NotFound(
                    "La conversación no existe."
                );
            }


            return Ok(conversation);
        }


        // ==================================================
        // CREAR CONVERSACIÓN
        // POST: api/Conversations
        // ==================================================

        [HttpPost]
        public async Task<ActionResult<Conversation>>
            CreateConversation(
                [FromBody] Conversation conversation)
        {
            // ----------------------------------------------
            // NO CONVERSAR CONTIGO MISMO
            // ----------------------------------------------

            if (
                conversation.User1Id ==
                conversation.User2Id
            )
            {
                return BadRequest(
                    "No puedes crear una conversación contigo mismo."
                );
            }


            // ----------------------------------------------
            // BUSCAR LOS DOS USUARIOS
            // ----------------------------------------------

            var users =
                await _context.Users
                    .Where(u =>
                        u.Id == conversation.User1Id ||
                        u.Id == conversation.User2Id)
                    .ToListAsync();


            if (users.Count != 2)
            {
                return BadRequest(
                    "Uno o ambos usuarios no existen."
                );
            }


            // ----------------------------------------------
            // COMPROBAR QUE AMBOS SEAN UEMA
            // ----------------------------------------------

            var allInstitutional =
                users.All(u =>
                    u.Email
                        .EndsWith(
                            "@uemam.edu.ec",
                            StringComparison.OrdinalIgnoreCase
                        ));


            if (!allInstitutional)
            {
                return BadRequest(
                    "Solo puedes conversar con usuarios que tengan un correo @uemam.edu.ec."
                );
            }


            // ----------------------------------------------
            // BUSCAR CONVERSACIÓN EXISTENTE
            // ----------------------------------------------

            var existingConversation =
                await _context.Conversations
                    .FirstOrDefaultAsync(c =>
                        (
                            c.User1Id ==
                                conversation.User1Id
                            &&
                            c.User2Id ==
                                conversation.User2Id
                        )

                        ||

                        (
                            c.User1Id ==
                                conversation.User2Id
                            &&
                            c.User2Id ==
                                conversation.User1Id
                        )
                    );


            // ----------------------------------------------
            // SI YA EXISTE, DEVOLVERLA
            // ----------------------------------------------

            if (existingConversation != null)
            {
                return Ok(
                    existingConversation
                );
            }


            // ----------------------------------------------
            // CREAR NUEVA
            // ----------------------------------------------

            conversation.CreatedAt =
                DateTime.UtcNow;


            _context.Conversations.Add(
                conversation
            );


            await _context.SaveChangesAsync();


            return CreatedAtAction(
                nameof(GetConversation),
                new
                {
                    id = conversation.Id
                },
                conversation
            );
        }
    }
}