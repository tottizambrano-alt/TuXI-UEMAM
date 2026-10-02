const API_URL =
    "http://localhost:5000/api/Auth";


// ==================================================
// MOSTRAR LOGIN
// ==================================================

function showLogin() {

    const loginSection =
        document.getElementById(
            "loginSection"
        );

    const registerSection =
        document.getElementById(
            "registerSection"
        );


    if (
        !loginSection ||
        !registerSection
    ) {

        return;

    }


    registerSection.classList.add(
        "hidden"
    );

    loginSection.classList.remove(
        "hidden"
    );

    clearMessages();

}


// ==================================================
// MOSTRAR REGISTRO
// ==================================================

function showRegister() {

    const loginSection =
        document.getElementById(
            "loginSection"
        );

    const registerSection =
        document.getElementById(
            "registerSection"
        );


    if (
        !loginSection ||
        !registerSection
    ) {

        return;

    }


    loginSection.classList.add(
        "hidden"
    );

    registerSection.classList.remove(
        "hidden"
    );

    clearMessages();

}


// ==================================================
// REGISTRO
// ==================================================

async function registerUser(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "registerName"
        ).value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    if (
        !name ||
        !email ||
        !password
    ) {

        showMessage(
            "registerMessage",
            "Completa todos los campos.",
            "error"
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


        if (!response.ok) {

            const error =
                await response.text();


            showMessage(
                "registerMessage",
                error ||
                    "No se pudo crear la cuenta.",
                "error"
            );

            return;

        }


        const registeredUser =
            await response.json();


        console.log(
            "Usuario registrado:",
            registeredUser
        );


        showMessage(
            "registerMessage",
            "¡Cuenta creada correctamente! Ahora puedes iniciar sesión.",
            "success"
        );


        document
            .getElementById(
                "registerForm"
            )
            .reset();


        setTimeout(
            function () {

                showLogin();


                const loginEmail =
                    document.getElementById(
                        "loginEmail"
                    );


                if (loginEmail) {

                    loginEmail.value =
                        email;

                }

            },
            1200
        );


    } catch (error) {

        console.error(
            "Error al registrar:",
            error
        );


        showMessage(
            "registerMessage",
            "No se pudo conectar con el servidor. Asegúrate de que la API esté ejecutándose.",
            "error"
        );

    }

}


// ==================================================
// LOGIN
// ==================================================

async function loginUser(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (
        !email ||
        !password
    ) {

        showMessage(
            "loginMessage",
            "Ingresa tu correo y contraseña.",
            "error"
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


        if (!response.ok) {

            const error =
                await response.text();


            showMessage(
                "loginMessage",
                error ||
                    "Correo o contraseña incorrectos.",
                "error"
            );

            return;

        }


        const user =
            await response.json();


        console.log(
            "Usuario iniciado:",
            user
        );


        // Guardar sesión

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );


        showMessage(
            "loginMessage",
            `¡Bienvenido, ${user.name || "Usuario"}!`,
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            700
        );


    } catch (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );


        showMessage(
            "loginMessage",
            "No se pudo conectar con el servidor. Asegúrate de que la API esté ejecutándose.",
            "error"
        );

    }

}


// ==================================================
// OBTENER USUARIO
// ==================================================

function getCurrentUser() {

    const user =
        localStorage.getItem(
            "currentUser"
        );


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


// ==================================================
// CERRAR SESIÓN
// ==================================================

function logoutUser() {

    localStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "auth.html";

}


// ==================================================
// MENSAJES
// ==================================================

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `auth-message ${type}`;

}


function clearMessages() {

    const loginMessage =
        document.getElementById(
            "loginMessage"
        );

    const registerMessage =
        document.getElementById(
            "registerMessage"
        );


    if (loginMessage) {

        loginMessage.textContent =
            "";

        loginMessage.className =
            "auth-message";

    }


    if (registerMessage) {

        registerMessage.textContent =
            "";

        registerMessage.className =
            "auth-message";

    }

}


// ==================================================
// COMPROBAR SESIÓN
// SOLO EN AUTH.HTML
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop();


        if (
            currentPage ===
                "auth.html" &&
            getCurrentUser()
        ) {

            window.location.href =
                "index.html";

        }

    }
);