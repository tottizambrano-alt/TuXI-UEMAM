const API_URL = "http://localhost:5000/api/Auth";

// =====================================================
// SISTEMA DE NOTIFICACIONES
// =====================================================

function showNotification(title, message, type = "info", duration = 4000) {


const container =
    document.getElementById("notificationContainer");

if (!container) {
    console.error("No existe notificationContainer en index.html");
    return;
}

let icon = "fas fa-info-circle";

if (type === "success") {
    icon = "fas fa-check";
}

if (type === "error") {
    icon = "fas fa-times";
}

if (type === "warning") {
    icon = "fas fa-exclamation";
}

const notification =
    document.createElement("div");

notification.className =
    `tuxi-notification ${type}`;

notification.innerHTML = `
    <div class="notification-icon">
        <i class="${icon}"></i>
    </div>

    <div class="notification-content">

        <div class="notification-title">
            ${title}
        </div>

        <div class="notification-message">
            ${message}
        </div>

    </div>

    <button
        class="notification-close"
        type="button"
        aria-label="Cerrar">

        <i class="fas fa-times"></i>

    </button>
`;

container.appendChild(notification);


// Animación de entrada

requestAnimationFrame(() => {

    notification.classList.add("show");

});


// Botón de cerrar

const closeButton =
    notification.querySelector(".notification-close");

closeButton.addEventListener(
    "click",
    () => {

        removeNotification(notification);

    }
);


// Desaparecer automáticamente

setTimeout(() => {

    removeNotification(notification);

}, duration);


}

// =====================================================
// ELIMINAR NOTIFICACIÓN
// =====================================================

function removeNotification(notification) {


if (!notification) {
    return;
}

notification.classList.remove("show");

setTimeout(() => {

    if (notification.parentNode) {

        notification.parentNode.removeChild(
            notification
        );

    }

}, 350);


}

// =====================================================
// REGISTRO
// =====================================================

async function registerUser(event) {


event.preventDefault();


const nameElement =
    document.getElementById("registerName");

const emailElement =
    document.getElementById("registerEmail");

const passwordElement =
    document.getElementById("registerPassword");


if (!nameElement ||
    !emailElement ||
    !passwordElement) {

    console.error(
        "No se encontraron los campos del registro."
    );

    return;
}


const name =
    nameElement.value.trim();

const email =
    emailElement.value.trim();

const password =
    passwordElement.value;


// Validar campos

if (!name ||
    !email ||
    !password) {

    showNotification(
        "Campos incompletos",
        "Completa todos los campos para crear tu cuenta.",
        "warning"
    );

    return;
}


const user = {

    name: name,

    email: email,

    password: password

};


try {

    const response =
        await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(user)
            }
        );


    // Error del servidor

    if (!response.ok) {

        const error =
            await response.text();

        showNotification(
            "No se pudo crear la cuenta",
            error ||
            "Inténtalo nuevamente.",
            "error"
        );

        return;
    }


    // Usuario creado

    const registeredUser =
        await response.json();


    console.log(
        "Usuario registrado:",
        registeredUser
    );


    showNotification(
        "¡Cuenta creada!",
        "Tu cuenta de TuXI fue creada correctamente.",
        "success"
    );


    // Cerrar registro

    closeModal("modalRegister");


    // Abrir login después de un pequeño retraso

    setTimeout(() => {

        openModal("modalLogin");

    }, 500);


} catch (error) {

    console.error(
        "Error al registrar:",
        error
    );


    showNotification(
        "Servidor no disponible",
        "No pudimos conectar con TuXI. Comprueba que la API esté ejecutándose.",
        "error"
    );

}


}

// =====================================================
// INICIO DE SESIÓN
// =====================================================

async function loginUser(event) {


event.preventDefault();


const emailElement =
    document.getElementById("loginEmail");

const passwordElement =
    document.getElementById("loginPassword");


if (!emailElement ||
    !passwordElement) {

    console.error(
        "No se encontraron los campos del login."
    );

    return;
}


const email =
    emailElement.value.trim();

const password =
    passwordElement.value;


// Validar campos

if (!email ||
    !password) {

    showNotification(
        "Faltan datos",
        "Ingresa tu correo y contraseña.",
        "warning"
    );

    return;
}


const loginData = {

    email: email,

    password: password

};


try {

    const response =
        await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(loginData)
            }
        );


    // Credenciales incorrectas

    if (!response.ok) {

        const error =
            await response.text();

        showNotification(
            "No pudimos iniciar sesión",
            error ||
            "Revisa tu correo y contraseña.",
            "error"
        );

        return;
    }


    // Login correcto

    const user =
        await response.json();


    console.log(
        "Usuario conectado:",
        user
    );


    // Guardar sesión

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );


    // Cerrar modal

    closeModal("modalLogin");


    // Actualizar nombre del usuario

    updateUserInterface();


    // Mostrar notificación

    showNotification(
        `¡Bienvenido, ${user.name}!`,
        "Has iniciado sesión correctamente.",
        "success"
    );


} catch (error) {

    console.error(
        "Error al iniciar sesión:",
        error
    );


    showNotification(
        "Servidor no disponible",
        "No pudimos conectar con TuXI. Comprueba que la API esté ejecutándose.",
        "error"
    );

}


}

// =====================================================
// OBTENER USUARIO ACTUAL
// =====================================================

function getCurrentUser() {


const user =
    localStorage.getItem("currentUser");


if (!user) {

    return null;

}


try {

    return JSON.parse(user);

} catch (error) {

    console.error(
        "Error leyendo usuario:",
        error
    );


    localStorage.removeItem(
        "currentUser"
    );


    return null;
}


}

// =====================================================
// ACTUALIZAR INTERFAZ DEL USUARIO
// =====================================================

function updateUserInterface() {


const userMenuBtn =
    document.getElementById("userMenuBtn");


if (!userMenuBtn) {

    return;

}


const user =
    getCurrentUser();


// =================================================
// USUARIO LOGUEADO
// =================================================

if (user) {

    userMenuBtn.innerHTML =
        `<i class="fas fa-user-circle"></i> ${user.name}`;


    userMenuBtn.onclick =
        function (event) {

            event.preventDefault();


            // Abrir nuestro modal personalizado

            openLogoutModal(
                user.name
            );

        };

}


// =================================================
// USUARIO NO LOGUEADO
// =================================================

else {

    userMenuBtn.innerHTML =
        `<i class="fas fa-user-circle"></i> Iniciar sesión`;


    userMenuBtn.onclick =
        function (event) {

            event.preventDefault();


            // Abrir modal de login

            openModal(
                "modalLogin"
            );

        };
}


}

// =====================================================
// MODAL PERSONALIZADO DE CIERRE DE SESIÓN
// =====================================================

function openLogoutModal(userName) {


const modal =
    document.getElementById("logoutModal");

const message =
    document.getElementById("logoutMessage");


if (!modal) {

    console.error(
        "No existe logoutModal en index.html"
    );

    return;

}


if (message) {

    message.innerHTML =
        `Sesión iniciada como <strong>${userName}</strong>.<br>
         ¿Quieres cerrar sesión?`;

}


modal.classList.add(
    "show"
);


}

// =====================================================
// CERRAR MODAL DE LOGOUT
// =====================================================

function closeLogoutModal() {


const modal =
    document.getElementById("logoutModal");


if (!modal) {

    return;

}


modal.classList.remove(
    "show"
);


}

// =====================================================
// CONFIRMAR CIERRE DE SESIÓN
// =====================================================

function confirmLogout() {


closeLogoutModal();


setTimeout(() => {

    logoutUser();

}, 250);


}

// =====================================================
// CERRAR SESIÓN
// =====================================================

function logoutUser() {


// Eliminar usuario guardado

localStorage.removeItem(
    "currentUser"
);


// Actualizar interfaz

updateUserInterface();


// Mostrar notificación

showNotification(
    "Sesión cerrada",
    "Has cerrado sesión correctamente.",
    "info"
);


}

// =====================================================
// INICIAR SISTEMA DE AUTENTICACIÓN
// =====================================================

document.addEventListener(
"DOMContentLoaded",
function () {


    updateUserInterface();

}


);
