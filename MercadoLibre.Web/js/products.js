// ==================================================
// PRODUCTOS INICIALES
// ==================================================



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

// ==================================================
// ELIMINAR PRODUCTO
// ==================================================

function deleteProduct(id) {

    const products = getProducts().filter(function (p) {
        return String(p.id) !== String(id);
    });

    localStorage.setItem(
        "ml_products",
        JSON.stringify(products)
    );

}
