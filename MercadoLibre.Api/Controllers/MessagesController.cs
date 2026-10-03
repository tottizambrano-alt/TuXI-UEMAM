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

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Messages/conversation/1
        [HttpGet("conversation/{conversationId:int}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages(
            int conversationId)
        {
            var conversationExists = await _context.Conversations
                .AnyAsync(c => c.Id == conversationId);

            if (!conversationExists)
            {
                return NotFound("La conversación no existe.");
            }

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/Messages
        [HttpPost]
        public async Task<ActionResult<Message>> SendMessage(
            [FromBody] Message message)
        {
            var conversationExists = await _context.Conversations
                .AnyAsync(c => c.Id == message.ConversationId);

            if (!conversationExists)
            {
                return BadRequest("La conversación no existe.");
            }

            if (string.IsNullOrWhiteSpace(message.Content))
            {
                return BadRequest("El mensaje no puede estar vacío.");
            }

            message.Content = message.Content.Trim();
            message.SentAt = DateTime.UtcNow;

            _context.Messages.Add(message);

            await _context.SaveChangesAsync();

            return Ok(message);
        }
    }
}