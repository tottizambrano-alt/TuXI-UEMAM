// ==================================================
// TuXI - APP PRINCIPAL
// ==================================================

let currentCategory = "Todos";
let currentCondition = "all";


// ==================================================
// INICIO DE LA PÁGINA
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------------------
    // COMPROBAR SESIÓN
    // ----------------------------------------------

    const currentUserData =
        localStorage.getItem("currentUser");

    if (!currentUserData) {
        window.location.href = "auth.html";
        return;
    }

    let currentUser;

    try {
        currentUser = JSON.parse(currentUserData);
    } catch (error) {

        console.error(
            "Error leyendo currentUser:",
            error
        );

        localStorage.removeItem("currentUser");

        window.location.href = "auth.html";

        return;
    }


    // ----------------------------------------------
    // MOSTRAR USUARIO
    // ----------------------------------------------

    setupUserMenu(currentUser);


    // ----------------------------------------------
    // CARGAR PRODUCTOS
    // ----------------------------------------------

    if (typeof getProducts === "function") {

        renderProducts(getProducts());

    } else {

        console.error(
            "ERROR: getProducts() no existe. Revisa products.js."
        );

    }


    // ----------------------------------------------
    // ACTUALIZAR CARRITO
    // ----------------------------------------------

    if (typeof updateCartBadge === "function") {
        updateCartBadge();
    }

});


// ==================================================
// MENÚ DEL USUARIO
// ==================================================

function setupUserMenu(user) {

    const userMenuContainer =
        document.querySelector(
            ".user-menu-container"
        );

    const userMenuBtn =
        document.getElementById(
            "userMenuBtn"
        );

    const userMenuName =
        document.getElementById(
            "userMenuName"
        );

    const dropdownUserName =
        document.getElementById(
            "dropdownUserName"
        );


    if (
        !userMenuContainer ||
        !userMenuBtn
    ) {

        console.error(
            "No se encontró el menú del usuario."
        );

        return;
    }


    // Obtener nombre

    const displayName =
        user.name ||
        user.nombre ||
        user.fullName ||
        user.fullname ||
        user.username ||
        user.email ||
        "Usuario";


    // Mostrar nombre arriba

    if (userMenuName) {
        userMenuName.textContent =
            displayName;
    }


    // Mostrar nombre dentro del menú

    if (dropdownUserName) {
        dropdownUserName.textContent =
            displayName;
    }


    // Abrir / cerrar menú

    userMenuBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            userMenuContainer.classList.toggle(
                "active"
            );

        }
    );


    // Cerrar al hacer clic afuera

    document.addEventListener(
        "click",
        function (event) {

            if (
                !userMenuContainer.contains(
                    event.target
                )
            ) {

                userMenuContainer.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ==================================================
// CERRAR SESIÓN
// ==================================================

function logoutUser() {

    const modal =
        document.getElementById(
            "logoutModal"
        );


    if (modal) {

        modal.classList.add("show");

        return;

    }


    // Si por alguna razón no existe el modal

    confirmLogout();

}


// ==================================================
// CANCELAR CIERRE DE SESIÓN
// ==================================================

function closeLogoutModal() {

    const modal =
        document.getElementById(
            "logoutModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

}


// ==================================================
// CONFIRMAR CIERRE DE SESIÓN
// ==================================================

function confirmLogout() {

    localStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "auth.html";

}


// ==================================================
// OPCIONES DEL MENÚ DE USUARIO
// ==================================================

function openUserSection(section) {

    const userMenu =
        document.querySelector(
            ".user-menu-container"
        );

    if (userMenu) {

        userMenu.classList.remove(
            "active"
        );

    }


    switch (section) {

        // ------------------------------------------
        // CARRITO
        // ------------------------------------------

        case "cart":

            if (
                typeof toggleCart ===
                "function"
            ) {

                toggleCart();

            } else {

                console.error(
                    "toggleCart() no existe."
                );

            }

            break;


        // ------------------------------------------
        // CHATS
        // ------------------------------------------

       case "chat":

    if (typeof openPrivateChats === "function") {
        openPrivateChats();
    } else {
        console.error(
            "openPrivateChats() no existe. Revisa chat.js."
        );
    }

    break;


        // ------------------------------------------
        // PUBLICACIONES
        // ------------------------------------------

        case "products":

            openUserPanel(
                "productsPanel"
            );

            break;


        // ------------------------------------------
        // PERFIL
        // ------------------------------------------

        case "profile":

            openUserPanel(
                "profilePanel"
            );

            break;


        default:

            console.warn(
                "Sección desconocida:",
                section
            );

    }

}


// ==================================================
// PANELES DEL USUARIO
// ==================================================

function openUserPanel(panelId) {

    const panel =
        document.getElementById(
            panelId
        );

    if (!panel) {

        alert(
            "Esta sección todavía está en construcción."
        );

        return;

    }

    panel.classList.add("show");

}


function closeUserPanel(panelId) {

    const panel =
        document.getElementById(
            panelId
        );

    if (!panel) {
        return;
    }

    panel.classList.remove("show");

}


// ==================================================
// RENDERIZAR PRODUCTOS
// ==================================================

function renderProducts(products) {

    const grid =
        document.getElementById(
            "productsGrid"
        );

    const resultsCount =
        document.getElementById(
            "resultsCount"
        );


    if (!grid) {

        console.error(
            "No existe #productsGrid."
        );

        return;

    }


    if (!Array.isArray(products)) {

        console.error(
            "getProducts() no devolvió un array."
        );

        return;

    }


    if (resultsCount) {

        resultsCount.innerText =
            `${products.length} resultados`;

    }


    if (products.length === 0) {

        grid.innerHTML = `
            <div
                style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    color: #777;
                "
            >
                No hay productos disponibles.
            </div>
        `;

        return;

    }


    grid.innerHTML =
        products.map(function (product) {

            return `

                <div
                    class="product-card"
                    onclick="openProductDetail(${product.id})"
                >

                    <img
                        src="${product.imageUrl}"
                        alt="${product.title}"
                    >

                    <div class="card-details">

                        <div class="price">
                            $${Number(product.price).toFixed(2)}
                        </div>

                        ${
                            product.freeShipping
                                ? `
                                    <div class="shipping">
                                        <i class="fas fa-truck"></i>
                                        Envío gratis dentro del colegio
                                    </div>
                                `
                                : ""
                        }

                        <div class="card-title">
                            ${product.title}
                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


// ==================================================
// FILTROS
// ==================================================

function applyFilters() {

    if (
        typeof getProducts !==
        "function"
    ) {

        return;

    }


    let products =
        getProducts();


    const freeShippingElement =
        document.getElementById(
            "freeShippingCheck"
        );

    const minPriceElement =
        document.getElementById(
            "minPrice"
        );

    const maxPriceElement =
        document.getElementById(
            "maxPrice"
        );

    const sortElement =
        document.getElementById(
            "sortSelect"
        );


    const freeShipping =
        freeShippingElement
            ? freeShippingElement.checked
            : false;


    const minPrice =
        minPriceElement &&
        minPriceElement.value !== ""
            ? parseFloat(
                minPriceElement.value
            )
            : 0;


    const maxPrice =
        maxPriceElement &&
        maxPriceElement.value !== ""
            ? parseFloat(
                maxPriceElement.value
            )
            : Infinity;


    const sort =
        sortElement
            ? sortElement.value
            : "relevance";


    // Categoría

    if (
        currentCategory !==
        "Todos"
    ) {

        products =
            products.filter(
                function (product) {

                    return (
                        product.category ===
                        currentCategory
                    );

                }
            );

    }


    // Condición

    if (
        currentCondition !==
        "all"
    ) {

        products =
            products.filter(
                function (product) {

                    return (
                        product.condition ===
                        currentCondition
                    );

                }
            );

    }


    // Envío gratis

    if (freeShipping) {

        products =
            products.filter(
                function (product) {

                    return product.freeShipping;

                }
            );

    }


    // Precio

    products =
        products.filter(
            function (product) {

                return (
                    product.price >=
                    minPrice &&
                    product.price <=
                    maxPrice
                );

            }
        );


    // Ordenar

    if (sort === "price-asc") {

        products.sort(
            function (a, b) {

                return a.price - b.price;

            }
        );

    }


    if (sort === "price-desc") {

        products.sort(
            function (a, b) {

                return b.price - a.price;

            }
        );

    }


    renderProducts(products);

}


// ==================================================
// FILTRAR POR CATEGORÍA
// ==================================================

function filterByCategory(category) {

    currentCategory =
        category;

    applyFilters();

}


// ==================================================
// FILTRAR POR CONDICIÓN
// ==================================================

function filterCondition(condition) {

    currentCondition =
        condition;


    document
        .querySelectorAll(
            ".filter-group .filter-btn"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    // Activar botón seleccionado

    document
        .querySelectorAll(
            ".filter-group .filter-btn"
        )
        .forEach(
            function (button) {

                if (
                    button.textContent
                        .trim()
                        .toLowerCase()
                        ===
                    (
                        condition === "all"
                            ? "todos"
                            : condition.toLowerCase()
                    )
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    applyFilters();

}


// ==================================================
// MODALES
// ==================================================

function openModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {

        console.warn(
            `No existe el modal: ${id}`
        );

        return;

    }

    modal.style.display =
        "block";

}


function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {
        return;
    }

    modal.style.display =
        "none";

}


// ==================================================
// PUBLICAR PRODUCTO
// ==================================================

function publishProduct(event) {

    event.preventDefault();


    if (
        typeof saveProduct !==
        "function"
    ) {

        alert(
            "No se pudo guardar el producto."
        );

        return;

    }


    const newProduct = {

        title:
            document.getElementById(
                "pubTitle"
            ).value.trim(),

        category:
            document.getElementById(
                "pubCategory"
            ).value,

        price:
            parseFloat(
                document.getElementById(
                    "pubPrice"
                ).value
            ),

        condition:
            document.getElementById(
                "pubCondition"
            ).value,

        imageUrl:
            document.getElementById(
                "pubImage"
            ).value.trim(),

        description:
            document.getElementById(
                "pubDescription"
            ).value.trim(),

        freeShipping:
            true,

        isFull:
            false

    };


    saveProduct(
        newProduct
    );


    closeModal(
        "modalPublish"
    );


    alert(
        "¡Producto publicado exitosamente!"
    );


    renderProducts(
        getProducts()
    );

}


// ==================================================
// DETALLE DEL PRODUCTO
// ==================================================

function openProductDetail(id) {

    if (
        typeof getProducts !==
        "function"
    ) {

        return;

    }


    const products =
        getProducts();


    const product =
        products.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!product) {
        return;
    }


    const detailBody =
        document.getElementById(
            "productDetailBody"
        );


    if (!detailBody) {
        return;
    }


    detailBody.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:20px;
            "
        >

            <img
                src="${product.imageUrl}"
                alt="${product.title}"
                style="
                    width:100%;
                    max-height:300px;
                    object-fit:contain;
                "
            >

            <div>

                <span
                    style="
                        font-size:12px;
                        color:#888;
                    "
                >
                    ${product.condition}
                </span>

                <h2
                    style="
                        font-size:20px;
                        margin:5px 0;
                    "
                >
                    ${product.title}
                </h2>

                <div
                    style="
                        font-size:28px;
                        font-weight:bold;
                        margin:10px 0;
                    "
                >
                    $${Number(product.price).toFixed(2)}
                </div>

                <p
                    style="
                        color:#00a650;
                        font-weight:bold;
                    "
                >
                    <i class="fas fa-truck"></i>
                    Envío gratis dentro del colegio
                </p>

                <p
                    style="
                        margin:15px 0;
                        font-size:14px;
                    "
                >
                    ${product.description}
                </p>

                <button
                    type="button"
                    onclick="addToCart(${product.id})"
                    style="
                        width:100%;
                        background:#3483fa;
                        color:white;
                        border:none;
                        padding:12px;
                        border-radius:6px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    Añadir al carrito
                </button>

            </div>

        </div>

    `;




    openModal(
        "modalDetail"
    );

}