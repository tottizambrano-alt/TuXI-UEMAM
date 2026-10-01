let initialProducts = [
    {
        id: 1,
        title: "Cámara Mirrorless Sony Alpha A6700 con Lente Sigma 24-70mm f/2.8",
        price: 1850.00,
        category: "Cámaras",
        condition: "Nuevo",
        freeShipping: true,
        isFull: true,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        description: "Excelente cámara deportiva y de cine para grabación 4K 120fps, enfoque por IA."
    },
    {
        id: 2,
        title: "Balón de Voleibol Profesional Molten V5M5000",
        price: 65.50,
        category: "Deportes",
        condition: "Nuevo",
        freeShipping: true,
        isFull: false,
        imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500",
        description: "Balón oficial aprobado por FIVB, superficie suave de cuero sintético."
    },
    {
        id: 3,
        title: "Laptop Gamer Asus ROG Strix i7 16GB RAM RTX 4060",
        price: 1399.99,
        category: "Tecnología",
        condition: "Nuevo",
        freeShipping: true,
        isFull: true,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
        description: "Rendimiento extremo para renderizado de video, juegos y desarrollo de software."
    }
];

function getProducts() {
    const stored = localStorage.getItem('ml_products');
    if (!stored) {
        localStorage.setItem('ml_products', JSON.stringify(initialProducts));
        return initialProducts;
    }
    return JSON.parse(stored);
}

function saveProduct(product) {
    const products = getProducts();
    product.id = Date.now();
    products.push(product);
    localStorage.setItem('ml_products', JSON.stringify(products));
    renderProducts(products);
}
