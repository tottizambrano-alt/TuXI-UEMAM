function getCart() {
    return JSON.parse(localStorage.getItem('ml_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('ml_cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    renderCart();
    alert("¡Producto añadido al carrito!");
}

function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').innerText = totalCount;
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
    renderCart();
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItemsList');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px;'>Tu carrito está vacío</p>";
        document.getElementById('cartTotal').innerText = "$0.00";
        return;
    }

    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <img src="${item.imageUrl}" style="width:50px; height:50px; object-fit:contain;">
                <div style="flex:1;">
                    <div style="font-size:13px; font-weight:600;">${item.title}</div>
                    <div style="color:#333; margin-top:4px;">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cartTotal').innerText = `$${total.toFixed(2)}`;
}

function checkout() {
    if (getCart().length === 0) return alert("Tu carrito está vacío.");
    alert("🎉 ¡Compra realizada con éxito en Mercado Libre!");
    saveCart([]);
    toggleCart();
}
