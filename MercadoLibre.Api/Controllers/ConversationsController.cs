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

		public ConversationsController(AppDbContext context)
		{
			_context = context;
		}

		// GET: api/Conversations/user/1
		[HttpGet("user/{userId:int}")]
		public async Task<ActionResult<IEnumerable<object>>> GetUserConversations(
			int userId)
		{
			var userExists = await _context.Users
				.AnyAsync(u => u.Id == userId);

			if (!userExists)
			{
				return NotFound("El usuario no existe.");
			}

			var conversations = await _context.Conversations
				.Where(c => c.User1Id == userId || c.User2Id == userId)
				.OrderByDescending(c => c.CreatedAt)
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

		// GET: api/Conversations/1
		[HttpGet("{id:int}")]
		public async Task<ActionResult<object>> GetConversation(int id)
		{
			var conversation = await _context.Conversations
				.Where(c => c.Id == id)
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
				return NotFound("La conversación no existe.");
			}

			return Ok(conversation);
		}

		// POST: api/Conversations
		[HttpPost]
		public async Task<ActionResult<Conversation>> CreateConversation(
			[FromBody] Conversation conversation)
		{
			if (conversation.User1Id == conversation.User2Id)
			{
				return BadRequest(
					"No puedes crear una conversación contigo mismo.");
			}

			var usersExist = await _context.Users
				.CountAsync(u =>
					u.Id == conversation.User1Id ||
					u.Id == conversation.User2Id);

			if (usersExist != 2)
			{
				return BadRequest("Uno o ambos usuarios no existen.");
			}

			var existingConversation = await _context.Conversations
				.FirstOrDefaultAsync(c =>
					(c.User1Id == conversation.User1Id &&
					 c.User2Id == conversation.User2Id)
					||
					(c.User1Id == conversation.User2Id &&
					 c.User2Id == conversation.User1Id));

			if (existingConversation != null)
			{
				return Ok(existingConversation);
			}

			conversation.CreatedAt = DateTime.UtcNow;

			_context.Conversations.Add(conversation);

			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetConversation),
				new { id = conversation.Id },
				conversation);
		}
	}
}