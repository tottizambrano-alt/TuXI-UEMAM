/* =========================================
   TUXI - CHAT PRIVADO ENTRE USUARIOS
   Datos almacenados mediante API + SQLite
========================================= */

const API_BASE_URL = "http://localhost:5000/api";

let activeConversationId = null;
let chatSearchTimeout = null;

let chatUsers = [];
let chatConversations = [];
let chatMessages = {};

/* ---------- UTILIDADES ---------- */

function sameId(a, b) {
    return String(a) === String(b);
}

function getChatCurrentUser() {
    try {
        const user = JSON.parse(
            localStorage.getItem("currentUser") || "null"
        );

        if (!user || user.id == null) {
            return null;
        }

        return user;
    } catch {
        return null;
    }
}

function getChatUserName(user) {
    return user?.name ||
        user?.fullName ||
        user?.nombre ||
        user?.username ||
        user?.email ||
        "Usuario";
}

function getUserById(userId) {
    return chatUsers.find(user =>
        sameId(user.id, userId)
    );
}

function getOtherParticipant(conversation, currentUser) {
    const otherId = sameId(
        conversation.user1Id,
        currentUser.id
    )
        ? conversation.user2Id
        : conversation.user1Id;

    return getUserById(otherId) || {
        id: otherId,
        name: "Usuario desconocido",
        email: ""
    };
}

function formatChatTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getConversationMessages(conversationId) {
    return chatMessages[conversationId] || [];
}

function getLastMessage(conversationId) {
    const messages = getConversationMessages(conversationId);

    return messages.length > 0
        ? messages[messages.length - 1]
        : null;
}

/* ---------- API ---------- */

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        if (!response.ok) {
            const errorMessage =
                typeof data === "string"
                    ? data
                    : data?.message ||
                      data?.title ||
                      "Ocurrió un error en la API.";

            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Error de API:", error);

        throw error;
    }
}

/* ---------- USUARIOS ---------- */

async function loadChatUsers(search = "") {
    try {
        const query = search.trim();

        const endpoint = query
            ? `/Users?search=${encodeURIComponent(query)}`
            : "/Users";

        const users = await apiRequest(endpoint);

        chatUsers = Array.isArray(users)
            ? users
            : [];

        return chatUsers;
    } catch (error) {
        console.error(
            "No se pudieron cargar los usuarios:",
            error
        );

        showChatNotice(
            "No se pudieron cargar los usuarios."
        );

        return [];
    }
}

/* ---------- CONVERSACIONES ---------- */

async function loadChatConversations() {
    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        window.location.href = "auth.html";
        return [];
    }

    try {
        const conversations = await apiRequest(
            `/Conversations/user/${currentUser.id}`
        );

        chatConversations = Array.isArray(conversations)
            ? conversations
            : [];

        return chatConversations;
    } catch (error) {
        console.error(
            "No se pudieron cargar las conversaciones:",
            error
        );

        showChatNotice(
            "No se pudieron cargar tus conversaciones."
        );

        return [];
    }
}

async function loadConversationMessages(conversationId) {
    try {
        const messages = await apiRequest(
            `/Messages/conversation/${conversationId}`
        );

        chatMessages[conversationId] =
            Array.isArray(messages)
                ? messages
                : [];

        return chatMessages[conversationId];
    } catch (error) {
        console.error(
            "No se pudieron cargar los mensajes:",
            error
        );

        chatMessages[conversationId] = [];

        showChatNotice(
            "No se pudieron cargar los mensajes."
        );

        return [];
    }
}

/* ---------- ABRIR Y CERRAR CHAT ---------- */

async function openPrivateChats() {
    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        window.location.href = "auth.html";
        return;
    }

    const modal = document.getElementById("modalChat");

    if (!modal) {
        console.error(
            "No se encontró #modalChat. Agrega el HTML del chat a index.html."
        );

        return;
    }

    if (typeof openModal === "function") {
        openModal("modalChat");
    } else {
        modal.classList.add("active");
        modal.style.display = "flex";
    }

    activeConversationId = null;

    const searchInput =
        document.getElementById("chatUserSearch");

    if (searchInput) {
        searchInput.value = "";
    }

    await loadChatUsers();
    await loadChatConversations();

    renderConversationList();
    renderUserSearch("");
    renderActiveConversation();
}

function closePrivateChats() {
    const modal = document.getElementById("modalChat");

    if (!modal) {
        return;
    }

    if (typeof closeModal === "function") {
        closeModal("modalChat");
    } else {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

/* ---------- CREAR CONVERSACIONES ---------- */

async function startConversation(otherUserId) {
    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        window.location.href = "auth.html";
        return;
    }

    if (sameId(currentUser.id, otherUserId)) {
        showChatNotice(
            "No puedes iniciar un chat contigo mismo."
        );

        return;
    }

    const otherUser = getUserById(otherUserId);

    if (!otherUser) {
        showChatNotice(
            "No se encontró ese usuario."
        );

        return;
    }

    try {
        /*
           El backend se encarga de comprobar
           si la conversación ya existe.
        */

        const conversation = await apiRequest(
            "/Conversations",
            {
                method: "POST",
                body: JSON.stringify({
                    user1Id: Number(currentUser.id),
                    user2Id: Number(otherUserId)
                })
            }
        );

        activeConversationId = conversation.id;

        await loadChatConversations();

        await loadConversationMessages(
            activeConversationId
        );

        renderConversationList();
        renderActiveConversation();

        const messageInput =
            document.getElementById(
                "privateMessageInput"
            );

        if (messageInput) {
            messageInput.focus();
        }
    } catch (error) {
        console.error(
            "No se pudo crear la conversación:",
            error
        );

        showChatNotice(
            error.message ||
            "No se pudo iniciar la conversación."
        );
    }
}

/* ---------- BUSCAR USUARIOS ---------- */

async function renderUserSearch(query = "") {
    const container =
        document.getElementById("chatSearchResults");

    if (!container) {
        return;
    }

    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        container.replaceChildren();
        return;
    }

    const normalizedQuery =
        query.trim().toLowerCase();

    /*
       Buscamos directamente en la API.
    */

    const users = await loadChatUsers(query);

    const filteredUsers = users.filter(user => {
        if (sameId(user.id, currentUser.id)) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const name =
            getChatUserName(user).toLowerCase();

        const email =
            String(user.email || "").toLowerCase();

        return (
            name.includes(normalizedQuery) ||
            email.includes(normalizedQuery)
        );
    });

    container.replaceChildren();

    if (filteredUsers.length === 0) {
        const empty = document.createElement("p");

        empty.className = "chat-empty-state";

        empty.textContent = normalizedQuery
            ? "No se encontraron usuarios."
            : "Todavía no hay otros usuarios registrados.";

        container.appendChild(empty);

        return;
    }

    filteredUsers.forEach(user => {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "chat-user-result";

        const avatar =
            document.createElement("span");

        avatar.className = "chat-avatar";

        avatar.textContent =
            getChatUserName(user)
                .charAt(0)
                .toUpperCase();

        const info =
            document.createElement("span");

        info.className = "chat-user-info";

        const name =
            document.createElement("strong");

        name.textContent =
            getChatUserName(user);

        const email =
            document.createElement("small");

        email.textContent =
            user.email || "";

        info.append(name, email);

        button.append(
            avatar,
            info
        );

        button.addEventListener(
            "click",
            () => {
                startConversation(user.id);
            }
        );

        container.appendChild(button);
    });
}

function handleChatUserSearch(value) {
    clearTimeout(chatSearchTimeout);

    chatSearchTimeout = setTimeout(
        () => {
            renderUserSearch(value);
        },
        300
    );
}

/* ---------- LISTA DE CONVERSACIONES ---------- */

async function renderConversationList() {
    const container =
        document.getElementById(
            "chatConversationList"
        );

    if (!container) {
        return;
    }

    const currentUser =
        getChatCurrentUser();

    if (!currentUser) {
        container.replaceChildren();
        return;
    }

    if (!chatConversations.length) {
        await loadChatConversations();
    }

    /*
       Ordenamos por el último mensaje disponible.
       Si todavía no lo hemos cargado, usamos CreatedAt.
    */

    const conversations =
        [...chatConversations]
            .filter(conversation =>
                sameId(
                    conversation.user1Id,
                    currentUser.id
                ) ||
                sameId(
                    conversation.user2Id,
                    currentUser.id
                )
            )
            .sort((a, b) => {
                const lastA =
                    getLastMessage(a.id);

                const lastB =
                    getLastMessage(b.id);

                const dateA =
                    new Date(
                        lastA?.sentAt ||
                        a.createdAt
                    ).getTime();

                const dateB =
                    new Date(
                        lastB?.sentAt ||
                        b.createdAt
                    ).getTime();

                return dateB - dateA;
            });

    container.replaceChildren();

    if (conversations.length === 0) {
        const empty =
            document.createElement("p");

        empty.className =
            "chat-empty-state";

        empty.textContent =
            "Aún no tienes conversaciones. Busca un usuario para empezar.";

        container.appendChild(empty);

        return;
    }

    /*
       Cargamos mensajes para obtener
       la vista previa del último mensaje.
    */

    for (const conversation of conversations) {
        if (!chatMessages[conversation.id]) {
            await loadConversationMessages(
                conversation.id
            );
        }

        const otherUser =
            getOtherParticipant(
                conversation,
                currentUser
            );

        const lastMessage =
            getLastMessage(
                conversation.id
            );

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "chat-conversation-item";

        if (
            sameId(
                conversation.id,
                activeConversationId
            )
        ) {
            button.classList.add("selected");
        }

        const avatar =
            document.createElement("span");

        avatar.className =
            "chat-avatar";

        avatar.textContent =
            getChatUserName(otherUser)
                .charAt(0)
                .toUpperCase();

        const info =
            document.createElement("span");

        info.className =
            "chat-conversation-info";

        const name =
            document.createElement("strong");

        name.textContent =
            getChatUserName(otherUser);

        const preview =
            document.createElement("small");

        preview.textContent =
            lastMessage
                ? lastMessage.content
                : "Inicia la conversación";

        const time =
            document.createElement("small");

        time.className =
            "chat-conversation-time";

        time.textContent =
            lastMessage
                ? formatChatTime(
                    lastMessage.sentAt
                )
                : "";

        info.append(
            name,
            preview
        );

        button.append(
            avatar,
            info,
            time
        );

        button.addEventListener(
            "click",
            async () => {
                activeConversationId =
                    conversation.id;

                await loadConversationMessages(
                    conversation.id
                );

                renderConversationList();
                renderActiveConversation();

                const input =
                    document.getElementById(
                        "privateMessageInput"
                    );

                if (input) {
                    input.focus();
                }
            }
        );

        container.appendChild(button);
    }
}

/* ---------- MOSTRAR MENSAJES ---------- */

async function renderActiveConversation() {
    const messagesContainer =
        document.getElementById(
            "privateChatMessages"
        );

    const title =
        document.getElementById(
            "privateChatTitle"
        );

    const subtitle =
        document.getElementById(
            "privateChatSubtitle"
        );

    const form =
        document.getElementById(
            "privateChatForm"
        );

    const input =
        document.getElementById(
            "privateMessageInput"
        );

    const sendButton =
        document.getElementById(
            "privateSendButton"
        );

    const placeholder =
        document.getElementById(
            "privateChatPlaceholder"
        );

    if (!messagesContainer) {
        return;
    }

    const currentUser =
        getChatCurrentUser();

    if (!currentUser) {
        return;
    }

    const conversation =
        chatConversations.find(
            item =>
                sameId(
                    item.id,
                    activeConversationId
                ) &&
                (
                    sameId(
                        item.user1Id,
                        currentUser.id
                    ) ||
                    sameId(
                        item.user2Id,
                        currentUser.id
                    )
                )
        );

    messagesContainer.replaceChildren();

    if (!conversation) {
        if (title) {
            title.textContent =
                "Tus mensajes";
        }

        if (subtitle) {
            subtitle.textContent =
                "Selecciona un chat para comenzar.";
        }

        if (form) {
            form.hidden = true;
        }

        if (input) {
            input.disabled = true;
        }

        if (sendButton) {
            sendButton.disabled = true;
        }

        if (placeholder) {
            placeholder.hidden = false;
        }

        return;
    }

    const otherUser =
        getOtherParticipant(
            conversation,
            currentUser
        );

    if (title) {
        title.textContent =
            getChatUserName(otherUser);
    }

    if (subtitle) {
        subtitle.textContent =
            otherUser.email ||
            "Conversación privada";
    }

    if (form) {
        form.hidden = false;
    }

    if (input) {
        input.disabled = false;
    }

    if (sendButton) {
        sendButton.disabled = false;
    }

    if (placeholder) {
        placeholder.hidden = true;
    }

    if (!chatMessages[conversation.id]) {
        await loadConversationMessages(
            conversation.id
        );
    }

    const messages =
        getConversationMessages(
            conversation.id
        );

    if (messages.length === 0) {
        const empty =
            document.createElement("p");

        empty.className =
            "chat-empty-state";

        empty.textContent =
            "¡Di hola! Este es el comienzo de la conversación.";

        messagesContainer.appendChild(empty);

        return;
    }

    messages.forEach(message => {
        const wrapper =
            document.createElement("div");

        wrapper.className =
            "private-message";

        const isMine =
            sameId(
                message.senderId,
                currentUser.id
            );

        wrapper.classList.add(
            isMine
                ? "my-message"
                : "other-message"
        );

        const bubble =
            document.createElement("div");

        bubble.className =
            "private-message-bubble";

        bubble.textContent =
            message.content;

        const time =
            document.createElement("time");

        time.className =
            "private-message-time";

        time.textContent =
            formatChatTime(
                message.sentAt
            );

        wrapper.append(
            bubble,
            time
        );

        messagesContainer.appendChild(
            wrapper
        );
    });

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}

/* ---------- ENVIAR MENSAJES ---------- */

async function sendPrivateMessage(event) {
    if (event) {
        event.preventDefault();
    }

    const currentUser =
        getChatCurrentUser();

    const input =
        document.getElementById(
            "privateMessageInput"
        );

    if (
        !currentUser ||
        !input ||
        !activeConversationId
    ) {
        return;
    }

    const text =
        input.value.trim();

    if (!text) {
        return;
    }

    if (text.length > 2000) {
        showChatNotice(
            "El mensaje no puede superar los 2000 caracteres."
        );

        return;
    }

    const conversation =
        chatConversations.find(
            item =>
                sameId(
                    item.id,
                    activeConversationId
                ) &&
                (
                    sameId(
                        item.user1Id,
                        currentUser.id
                    ) ||
                    sameId(
                        item.user2Id,
                        currentUser.id
                    )
                )
        );

    if (!conversation) {
        showChatNotice(
            "No se encontró la conversación."
        );

        return;
    }

    const sendButton =
        document.getElementById(
            "privateSendButton"
        );

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        await apiRequest(
            "/Messages",
            {
                method: "POST",
                body: JSON.stringify({
                    conversationId:
                        Number(
                            conversation.id
                        ),

                    senderId:
                        Number(
                            currentUser.id
                        ),

                    content: text
                })
            }
        );

        input.value = "";

        await loadConversationMessages(
            conversation.id
        );

        await loadChatConversations();

        renderConversationList();
        await renderActiveConversation();

        input.focus();
    } catch (error) {
        console.error(
            "No se pudo enviar el mensaje:",
            error
        );

        showChatNotice(
            error.message ||
            "No se pudo enviar el mensaje."
        );
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }
    }
}

/* ---------- NOTIFICACIONES ---------- */

function showChatNotice(message) {
    const container =
        document.getElementById(
            "notificationContainer"
        );

    if (container) {
        const notice =
            document.createElement("div");

        notice.className =
            "notification";

        notice.textContent =
            message;

        container.appendChild(
            notice
        );

        window.setTimeout(
            () => notice.remove(),
            3500
        );
    } else {
        alert(message);
    }
}

/* ---------- INICIALIZACIÓN ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const searchInput =
            document.getElementById(
                "chatUserSearch"
            );

        const form =
            document.getElementById(
                "privateChatForm"
            );

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                event => {
                    handleChatUserSearch(
                        event.target.value
                    );
                }
            );
        }

        if (form) {
            form.addEventListener(
                "submit",
                sendPrivateMessage
            );
        }
    }
);