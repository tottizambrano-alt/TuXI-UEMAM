let currentCategory = 'Todos';
let currentCondition = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(getProducts());
    updateCartBadge();
});

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    document.getElementById('resultsCount').innerText = `${products.length} resultados`;

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            <img src="${p.imageUrl}" alt="${p.title}">
            <div class="card-details">
                <div class="price">$${p.price.toFixed(2)}</div>
                ${p.freeShipping ? '<div class="shipping"><i class="fas fa-truck"></i> Envío gratis</div>' : ''}
                <div class="card-title">${p.title}</div>
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    let products = getProducts();
    const freeShipping = document.getElementById('freeShippingCheck').checked;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const sort = document.getElementById('sortSelect').value;

    if (currentCategory !== 'Todos') {
        products = products.filter(p => p.category === currentCategory);
    }

    if (currentCondition !== 'all') {
        products = products.filter(p => p.condition === currentCondition);
    }

    if (freeShipping) {
        products = products.filter(p => p.freeShipping);
    }

    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (sort === 'price-asc') products.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') products.sort((a,b) => b.price - a.price);

    renderProducts(products);
}

function filterByCategory(cat) {
    currentCategory = cat;
    applyFilters();
}

function filterCondition(cond) {
    currentCondition = cond;
    document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function publishProduct(e) {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('pubTitle').value,
        category: document.getElementById('pubCategory').value,
        price: parseFloat(document.getElementById('pubPrice').value),
        condition: document.getElementById('pubCondition').value,
        imageUrl: document.getElementById('pubImage').value,
        description: document.getElementById('pubDescription').value,
        freeShipping: true,
        isFull: false
    };

    saveProduct(newProduct);
    closeModal('modalPublish');
    alert('¡Producto publicado exitosamente!');
}

function openProductDetail(id) {
    const products = getProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    const detailBody = document.getElementById('productDetailBody');
    detailBody.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <img src="${p.imageUrl}" style="width:100%; max-height:300px; object-fit:contain;">
            <div>
                <span style="font-size:12px; color:#888;">${p.condition}</span>
                <h2 style="font-size:20px; margin:5px 0;">${p.title}</h2>
                <div style="font-size:28px; font-weight:bold; margin:10px 0;">$${p.price.toFixed(2)}</div>
                <p style="color:#00a650; font-weight:bold;"><i class="fas fa-truck"></i> Envío a Manta gratis en 24hs</p>
                <p style="margin:15px 0; font-size:14px;">${p.description}</p>
                <button onclick="addToCart(${p.id})" style="width:100%; background:#3483fa; color:white; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">
                    Añadir al carrito
                </button>
            </div>
        </div>
    `;

    loadChat(p.id);
    openModal('modalDetail');
}
