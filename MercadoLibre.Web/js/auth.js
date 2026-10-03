// ==================================================
// MOSTRAR LOGIN
// ==================================================

function showLogin() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    if (!loginSection || !registerSection) {
        return;
    }

    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    clearMessages();
}


// ==================================================
// MOSTRAR REGISTRO
// ==================================================

function showRegister() {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    if (!loginSection || !registerSection) {
        return;
    }

    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");

    clearMessages();
}


// ==================================================
// OBTENER USUARIOS
// ==================================================

function getUsers() {
    const storedUsers = localStorage.getItem("tuxi_users");

    if (!storedUsers) {
        return [];
    }

    try {
        const users = JSON.parse(storedUsers);

        if (!Array.isArray(users)) {
            return [];
        }

        return users;
    } catch (error) {
        console.error("Error leyendo usuarios:", error);
        return [];
    }
}


// ==================================================
// GUARDAR USUARIOS
// ==================================================

function saveUsers(users) {
    localStorage.setItem(
        "tuxi_users",
        JSON.stringify(users)
    );
}


// ==================================================
// REGISTRO
// ==================================================

function registerUser(event) {
    event.preventDefault();

    const nameInput =
        document.getElementById("registerName");

    const emailInput =
        document.getElementById("registerEmail");

    const passwordInput =
        document.getElementById("registerPassword");

    if (
        !nameInput ||
        !emailInput ||
        !passwordInput
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    if (!name || !email || !password) {
        showMessage(
            "registerMessage",
            "Completa todos los campos.",
            "error"
        );

        return;
    }

    if (password.length < 4) {
        showMessage(
            "registerMessage",
            "La contraseña debe tener al menos 4 caracteres.",
            "error"
        );

        return;
    }

    const users = getUsers();

    const existingUser =
        users.find(
            function (user) {
                return user.email === email;
            }
        );

    if (existingUser) {
        showMessage(
            "registerMessage",
            "Ya existe una cuenta con ese correo.",
            "error"
        );

        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    saveUsers(users);

    console.log(
        "Usuario registrado:",
        newUser
    );

    showMessage(
        "registerMessage",
        "¡Cuenta creada correctamente! Ahora puedes iniciar sesión.",
        "success"
    );

    document
        .getElementById("registerForm")
        .reset();

    setTimeout(
        function () {
            showLogin();

            const loginEmail =
                document.getElementById(
                    "loginEmail"
                );

            if (loginEmail) {
                loginEmail.value = email;
            }
        },
        1200
    );
}


// ==================================================
// LOGIN
// ==================================================

function loginUser(event) {
    event.preventDefault();

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    if (
        !emailInput ||
        !passwordInput
    ) {
        return;
    }

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    if (!email || !password) {
        showMessage(
            "loginMessage",
            "Ingresa tu correo y contraseña.",
            "error"
        );

        return;
    }

    const users = getUsers();

    const user =
        users.find(
            function (account) {
                return (
                    account.email === email &&
                    account.password === password
                );
            }
        );

    if (!user) {
        showMessage(
            "loginMessage",
            "Correo o contraseña incorrectos.",
            "error"
        );

        return;
    }

    // Guardar solamente la sesión actual.
    // La contraseña no se guarda en currentUser.
    const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    console.log(
        "Usuario iniciado:",
        currentUser
    );

    showMessage(
        "loginMessage",
        `¡Bienvenido, ${currentUser.name}!`,
        "success"
    );

    setTimeout(
        function () {
            window.location.href =
                "index.html";
        },
        700
    );
}


// ==================================================
// OBTENER USUARIO ACTUAL
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
            currentPage === "auth.html" &&
            getCurrentUser()
        ) {
            window.location.href =
                "index.html";
        }
    }
);