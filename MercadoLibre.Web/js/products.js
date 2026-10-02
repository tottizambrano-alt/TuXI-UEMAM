// ==================================================
// PRODUCTOS INICIALES
// ==================================================

const initialProducts = [
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


// ==================================================
// OBTENER PRODUCTOS
// ==================================================

function getProducts() {
    const stored = localStorage.getItem("ml_products");

    // Si no existen productos guardados,
    // crear los productos iniciales.
    if (!stored) {
        const products = [...initialProducts];

        localStorage.setItem(
            "ml_products",
            JSON.stringify(products)
        );

        return products;
    }

    // Intentar leer los productos guardados.
    try {
        const products = JSON.parse(stored);

        // Verificar que realmente sea un arreglo.
        if (!Array.isArray(products)) {
            throw new Error("Los productos guardados no son un arreglo.");
        }

        return products;

    } catch (error) {

        console.error(
            "Error leyendo los productos guardados:",
            error
        );

        // Si los datos están dañados,
        // restaurar los productos iniciales.
        const products = [...initialProducts];

        localStorage.setItem(
            "ml_products",
            JSON.stringify(products)
        );

        return products;
    }
}


// ==================================================
// GUARDAR NUEVO PRODUCTO
// ==================================================

function saveProduct(product) {

    const products = getProducts();

    // Crear un ID único basado en la fecha.
    product.id = Date.now();

    // Agregar el producto.
    products.push(product);

    // Guardar nuevamente en localStorage.
    localStorage.setItem(
        "ml_products",
        JSON.stringify(products)
    );

    return product;
}