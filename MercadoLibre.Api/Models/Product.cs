namespace MercadoLibre.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = "Nuevo"; // Nuevo o Usado
        public string ImageUrl { get; set; } = string.Empty;
        public bool FreeShipping { get; set; } = false;
        public bool IsFull { get; set; } = false;
        public int Stock { get; set; } = 10;
        public int SellerId { get; set; }
    }
}
