const API_BASE_URL = "http://localhost:5000/api";

const GOOGLE_CLIENT_ID =
    "232132447961-be5jqhlk45olm4iavq2k4qq6fi2ho2f7.apps.googleusercontent.com";

const INSTITUTIONAL_DOMAIN = "@uemam.edu.ec";


// ======================================================
// PETICIÓN GENERAL A LA API
// ======================================================

async function apiAuthRequest(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        }
    );

    let data = null;

    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        let message = "Ocurrió un error.";

        if (typeof data === "string") {

            message = data;

        } else if (data?.message) {

            message = data.message;

        } else if (data?.title) {

            message = data.title;

        }

        throw new Error(message);

    }

    return data;

}


// ======================================================
// MOSTRAR LOGIN
// ======================================================

function showLogin() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");


    loginSection.classList.remove("hidden");

    registerSection.classList.add("hidden");


    clearAuthMessages();

}


// ======================================================
// MOSTRAR REGISTRO
// ======================================================

function showRegister() {

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");


    loginSection.classList.add("hidden");

    registerSection.classList.remove("hidden");


    clearAuthMessages();

}


// ======================================================
// LIMPIAR MENSAJES
// ======================================================

function clearAuthMessages() {

    const loginMessage =
        document.getElementById("loginMessage");

    const registerMessage =
        document.getElementById("registerMessage");


    if (loginMessage) {

        loginMessage.textContent = "";

        loginMessage.className =
            "auth-message";

    }


    if (registerMessage) {

        registerMessage.textContent = "";

        registerMessage.className =
            "auth-message";

    }

}


// ======================================================
// MOSTRAR MENSAJE
// ======================================================

function showMessage(
    elementId,
    message,
    type = "error"
) {

    const element =
        document.getElementById(elementId);


    if (!element) {

        return;

    }


    element.textContent = message;

    element.className =
        `auth-message ${type}`;

}


// ======================================================
// VALIDAR CORREO INSTITUCIONAL
// ======================================================

function isInstitutionalEmail(email) {

    return email
        .trim()
        .toLowerCase()
        .endsWith(INSTITUTIONAL_DOMAIN);

}


// ======================================================
// REGISTRO NORMAL
// ======================================================

async function registerUser(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const messageElement =
        document.getElementById(
            "registerMessage"
        );


    if (!name) {

        showMessage(
            "registerMessage",
            "El nombre es obligatorio."
        );

        return;

    }


    if (!isInstitutionalEmail(email)) {

        showMessage(
            "registerMessage",
            "Solo puedes registrarte con un correo @uemam.edu.ec."
        );

        return;

    }


    if (!password) {

        showMessage(
            "registerMessage",
            "La contraseña es obligatoria."
        );

        return;

    }


    try {

        messageElement.textContent =
            "Creando cuenta...";

        messageElement.className =
            "auth-message";


        const user =
            await apiAuthRequest(
                "/Auth/register",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


        saveCurrentUser(user);


        showMessage(
            "registerMessage",
            "Cuenta creada correctamente. Entrando...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 700);


    } catch (error) {

        showMessage(
            "registerMessage",
            error.message
        );

    }

}


// ======================================================
// LOGIN NORMAL
// ======================================================

async function loginUser(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    if (!isInstitutionalEmail(email)) {

        showMessage(
            "loginMessage",
            "Solo puedes iniciar sesión con un correo @uemam.edu.ec."
        );

        return;

    }


    if (!password) {

        showMessage(
            "loginMessage",
            "La contraseña es obligatoria."
        );

        return;

    }


    try {

        showMessage(
            "loginMessage",
            "Iniciando sesión...",
            "info"
        );


        const user =
            await apiAuthRequest(
                "/Auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        saveCurrentUser(user);


        showMessage(
            "loginMessage",
            "Inicio de sesión correcto. Entrando...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 500);


    } catch (error) {

        showMessage(
            "loginMessage",
            error.message
        );

    }

}


// ======================================================
// LOGIN CON GOOGLE
// ======================================================

async function handleGoogleCredential(response) {

    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    if (!response || !response.credential) {

        showMessage(
            "loginMessage",
            "Google no pudo completar el inicio de sesión."
        );

        return;

    }


    try {

        showMessage(
            "loginMessage",
            "Verificando tu cuenta de Google...",
            "info"
        );


        const user =
            await apiAuthRequest(
                "/Auth/google",
                {
                    method: "POST",
                    body: JSON.stringify({
                        credential:
                            response.credential
                    })
                }
            );


        saveCurrentUser(user);


        showMessage(
            "loginMessage",
            "Inicio de sesión con Google correcto. Entrando...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 500);


    } catch (error) {

        console.error(
            "Error en Google Login:",
            error
        );


        showMessage(
            "loginMessage",
            error.message ||
            "No se pudo iniciar sesión con Google."
        );

    }

}


// ======================================================
// GUARDAR USUARIO ACTUAL
// ======================================================

function saveCurrentUser(user) {

    if (!user) {

        return;

    }


    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

}


// ======================================================
// OBTENER USUARIO ACTUAL
// ======================================================

function getCurrentUser() {

    const savedUser =
        localStorage.getItem(
            "currentUser"
        );


    if (!savedUser) {

        return null;

    }


    try {

        const user =
            JSON.parse(savedUser);


        if (
            !user ||
            !user.id ||
            !user.email
        ) {

            localStorage.removeItem(
                "currentUser"
            );

            return null;

        }


        if (
            !isInstitutionalEmail(
                user.email
            )
        ) {

            localStorage.removeItem(
                "currentUser"
            );

            return null;

        }


        return user;

    } catch {

        localStorage.removeItem(
            "currentUser"
        );

        return null;

    }

}


// ======================================================
// CERRAR SESIÓN
// ======================================================

function logoutUser() {

    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "auth.html";

}


// ======================================================
// PROTEGER PÁGINAS
// ======================================================

function requireAuth() {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            "auth.html";

        return null;

    }


    return user;

}


// ======================================================
// EJECUTAR AL CARGAR AUTH.HTML
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentUser =
            getCurrentUser();


        if (
            currentUser &&
            window.location.pathname
                .toLowerCase()
                .endsWith("auth.html")
        ) {

            window.location.href =
                "index.html";

        }

    }
);