using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;
using MercadoLibre.Api.Models;

namespace MercadoLibre.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(
            AppDbContext context)
        {
            _context = context;
        }


        // ==================================================
        // OBTENER MENSAJES
        // GET: api/Messages/conversation/1
        // ==================================================

        [HttpGet("conversation/{conversationId:int}")]
        public async Task<ActionResult<IEnumerable<Message>>>
            GetMessages(
                int conversationId)
        {
            // ----------------------------------------------
            // COMPROBAR CONVERSACIÓN
            // ----------------------------------------------

            var conversation =
                await _context.Conversations
                    .FirstOrDefaultAsync(
                        c => c.Id == conversationId
                    );


            if (conversation == null)
            {
                return NotFound(
                    "La conversación no existe."
                );
            }


            // ----------------------------------------------
            // COMPROBAR QUE AMBOS USUARIOS SEAN UEMA
            // ----------------------------------------------

            var institutionalUsers =
                await _context.Users
                    .CountAsync(u =>
                        (
                            u.Id == conversation.User1Id ||
                            u.Id == conversation.User2Id
                        )
                        &&
                        u.Email
                            .ToLower()
                            .EndsWith("@uemam.edu.ec")
                    );


            if (institutionalUsers != 2)
            {
                return BadRequest(
                    "Esta conversación no está permitida."
                );
            }


            // ----------------------------------------------
            // OBTENER MENSAJES
            // ----------------------------------------------

            var messages =
                await _context.Messages
                    .Where(m =>
                        m.ConversationId ==
                        conversationId)
                    .OrderBy(m => m.SentAt)
                    .ToListAsync();


            return Ok(messages);
        }


        // ==================================================
        // ENVIAR MENSAJE
        // POST: api/Messages
        // ==================================================

        [HttpPost]
        public async Task<ActionResult<Message>>
            SendMessage(
                [FromBody] Message message)
        {
            // ----------------------------------------------
            // VALIDAR MENSAJE
            // ----------------------------------------------

            if (string.IsNullOrWhiteSpace(
                message.Content))
            {
                return BadRequest(
                    "El mensaje no puede estar vacío."
                );
            }


            // ----------------------------------------------
            // BUSCAR CONVERSACIÓN
            // ----------------------------------------------

            var conversation =
                await _context.Conversations
                    .FirstOrDefaultAsync(
                        c =>
                            c.Id ==
                            message.ConversationId
                    );


            if (conversation == null)
            {
                return BadRequest(
                    "La conversación no existe."
                );
            }


            // ----------------------------------------------
            // COMPROBAR QUE EL REMITENTE PARTICIPE
            // ----------------------------------------------

            if (
                message.SenderId !=
                    conversation.User1Id
                &&
                message.SenderId !=
                    conversation.User2Id
            )
            {
                return BadRequest(
                    "No puedes enviar mensajes en esta conversación."
                );
            }


            // ----------------------------------------------
            // COMPROBAR QUE AMBOS SEAN UEMA
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
                    "Los usuarios de esta conversación no existen."
                );
            }


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
                    "Solo puedes conversar con usuarios institucionales."
                );
            }


            // ----------------------------------------------
            // COMPROBAR REMITENTE
            // ----------------------------------------------

            var sender =
                users.FirstOrDefault(
                    u => u.Id == message.SenderId
                );


            if (sender == null)
            {
                return BadRequest(
                    "El remitente no pertenece a esta conversación."
                );
            }


            // ----------------------------------------------
            // GUARDAR MENSAJE
            // ----------------------------------------------

            message.Content =
                message.Content.Trim();

            message.SentAt =
                DateTime.UtcNow;


            _context.Messages.Add(
                message
            );


            await _context.SaveChangesAsync();


            return Ok(message);
        }
    }
}