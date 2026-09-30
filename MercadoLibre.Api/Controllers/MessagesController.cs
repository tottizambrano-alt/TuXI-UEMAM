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

        [HttpGet("{productId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages(int productId)
        {
            return await _context.Messages
                .Where(m => m.ProductId == productId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Message>> SendMessage(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return Ok(message);
        }
    }
}
