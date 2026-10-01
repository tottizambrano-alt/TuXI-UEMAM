using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Models;

namespace MercadoLibre.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Message> Messages => Set<Message>();
    }
}
