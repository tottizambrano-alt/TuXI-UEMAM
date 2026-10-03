
/* =========================================
   TUXI - CHAT PRIVADO ENTRE USUARIOS
   Almacenamiento mediante localStorage
========================================= */

const CHAT_USERS_KEY = "tuxi_users";
const CHAT_CONVERSATIONS_KEY = "tuxi_conversations";
const CHAT_MESSAGES_KEY = "tuxi_messages";

let activeConversationId = null;
let chatSearchTimeout = null;

/* ---------- UTILIDADES ---------- */

function readChatStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function getChatCurrentUser() {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");

        if (!user || user.id == null) {
            return null;
        }

        return user;
    } catch {
        return null;
    }
}

function getChatUsers() {
    return readChatStorage(CHAT_USERS_KEY);
}

function getChatConversations() {
    return readChatStorage(CHAT_CONVERSATIONS_KEY);
}

function getChatMessages() {
    return readChatStorage(CHAT_MESSAGES_KEY);
}

function saveChatConversations(conversations) {
    localStorage.setItem(
        CHAT_CONVERSATIONS_KEY,
        JSON.stringify(conversations)
    );
}

function saveChatMessages(messages) {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
}

function sameId(a, b) {
    return String(a) === String(b);
}

function getChatUserName(user) {
    return user?.name || user?.fullName || user?.nombre ||
        user?.username || user?.email || "Usuario";
}

function getOtherParticipant(conversation, currentUser) {
    const otherId = conversation.participants.find(
        id => !sameId(id, currentUser.id)
    );

    return getChatUsers().find(user => sameId(user.id, otherId)) || {
        id: otherId,
        name: "Usuario desconocido",
        email: ""
    };
}

function getConversationMessages(conversationId) {
    return getChatMessages()
        .filter(message => sameId(message.conversationId, conversationId))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function getLastMessage(conversationId) {
    const messages = getConversationMessages(conversationId);
    return messages[messages.length - 1] || null;
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

/* ---------- ABRIR Y CERRAR CHAT ---------- */

function openPrivateChats() {
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

    const searchInput = document.getElementById("chatUserSearch");
    if (searchInput) {
        searchInput.value = "";
    }

    renderConversationList();
    renderUserSearch("");
    renderActiveConversation();
}

function closePrivateChats() {
    const modal = document.getElementById("modalChat");

    if (!modal) return;

    if (typeof closeModal === "function") {
        closeModal("modalChat");
    } else {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

/* ---------- CREAR CONVERSACIONES ---------- */

function startConversation(otherUserId) {
    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        window.location.href = "auth.html";
        return;
    }

    if (sameId(currentUser.id, otherUserId)) {
        showChatNotice("No puedes iniciar un chat contigo mismo.");
        return;
    }

    const otherUser = getChatUsers().find(
        user => sameId(user.id, otherUserId)
    );

    if (!otherUser) {
        showChatNotice("No se encontró ese usuario.");
        return;
    }

    const conversations = getChatConversations();

    let conversation = conversations.find(item =>
        Array.isArray(item.participants) &&
        item.participants.length === 2 &&
        item.participants.some(id => sameId(id, currentUser.id)) &&
        item.participants.some(id => sameId(id, otherUserId))
    );

    if (!conversation) {
        conversation = {
            id: "conversation_" + Date.now() + "_" +
                Math.random().toString(36).slice(2, 8),
            participants: [currentUser.id, otherUser.id],
            createdAt: new Date().toISOString()
        };

        conversations.push(conversation);
        saveChatConversations(conversations);
    }

    activeConversationId = conversation.id;

    renderConversationList();
    renderActiveConversation();

    const messageInput = document.getElementById("privateMessageInput");
    if (messageInput) {
        messageInput.focus();
    }
}

/* ---------- BUSCAR USUARIOS ---------- */

function renderUserSearch(query = "") {
    const container = document.getElementById("chatSearchResults");

    if (!container) return;

    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        container.replaceChildren();
        return;
    }

    const normalizedQuery = query.trim().toLowerCase();

    const users = getChatUsers().filter(user => {
        if (sameId(user.id, currentUser.id)) return false;

        const name = getChatUserName(user).toLowerCase();
        const email = String(user.email || "").toLowerCase();

        return !normalizedQuery ||
            name.includes(normalizedQuery) ||
            email.includes(normalizedQuery);
    });

    container.replaceChildren();

    if (users.length === 0) {
        const empty = document.createElement("p");
        empty.className = "chat-empty-state";
        empty.textContent = normalizedQuery
            ? "No se encontraron usuarios."
            : "Todavía no hay otros usuarios registrados.";

        container.appendChild(empty);
        return;
    }

    users.forEach(user => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-user-result";

        const avatar = document.createElement("span");
        avatar.className = "chat-avatar";
        avatar.textContent = getChatUserName(user).charAt(0).toUpperCase();

        const info = document.createElement("span");
        info.className = "chat-user-info";

        const name = document.createElement("strong");
        name.textContent = getChatUserName(user);

        const email = document.createElement("small");
        email.textContent = user.email || "";

        info.append(name, email);
        button.append(avatar, info);

        button.addEventListener("click", () => {
            startConversation(user.id);
        });

        container.appendChild(button);
    });
}

function handleChatUserSearch(value) {
    clearTimeout(chatSearchTimeout);

    chatSearchTimeout = setTimeout(() => {
        renderUserSearch(value);
    }, 150);
}

/* ---------- LISTA DE CONVERSACIONES ---------- */

function renderConversationList() {
    const container = document.getElementById("chatConversationList");

    if (!container) return;

    const currentUser = getChatCurrentUser();

    if (!currentUser) {
        container.replaceChildren();
        return;
    }

    const conversations = getChatConversations()
        .filter(conversation =>
            Array.isArray(conversation.participants) &&
            conversation.participants.some(
                id => sameId(id, currentUser.id)
            )
        )
        .sort((a, b) => {
            const lastA = getLastMessage(a.id);
            const lastB = getLastMessage(b.id);

            const dateA = new Date(
                lastA?.createdAt || a.createdAt
            ).getTime();

            const dateB = new Date(
                lastB?.createdAt || b.createdAt
            ).getTime();

            return dateB - dateA;
        });

    container.replaceChildren();

    if (conversations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "chat-empty-state";
        empty.textContent = "Aún no tienes conversaciones. Busca un usuario para empezar.";
        container.appendChild(empty);
        return;
    }

    conversations.forEach(conversation => {
        const otherUser = getOtherParticipant(conversation, currentUser);
        const lastMessage = getLastMessage(conversation.id);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-conversation-item";

        if (sameId(conversation.id, activeConversationId)) {
            button.classList.add("selected");
        }

        const avatar = document.createElement("span");
        avatar.className = "chat-avatar";
        avatar.textContent = getChatUserName(otherUser).charAt(0).toUpperCase();

        const info = document.createElement("span");
        info.className = "chat-conversation-info";

        const name = document.createElement("strong");
        name.textContent = getChatUserName(otherUser);

        const preview = document.createElement("small");
        preview.textContent = lastMessage
            ? lastMessage.text
            : "Inicia la conversación";

        const time = document.createElement("small");
        time.className = "chat-conversation-time";
        time.textContent = lastMessage
            ? formatChatTime(lastMessage.createdAt)
            : "";

        info.append(name, preview);
        button.append(avatar, info, time);

        button.addEventListener("click", () => {
            activeConversationId = conversation.id;
            renderConversationList();
            renderActiveConversation();

            const input = document.getElementById("privateMessageInput");
            if (input) input.focus();
        });

        container.appendChild(button);
    });
}

/* ---------- MOSTRAR MENSAJES ---------- */

function renderActiveConversation() {
    const messagesContainer = document.getElementById("privateChatMessages");
    const title = document.getElementById("privateChatTitle");
    const subtitle = document.getElementById("privateChatSubtitle");
    const form = document.getElementById("privateChatForm");
    const input = document.getElementById("privateMessageInput");
    const sendButton = document.getElementById("privateSendButton");
    const placeholder = document.getElementById("privateChatPlaceholder");

    if (!messagesContainer) return;

    const currentUser = getChatCurrentUser();

    if (!currentUser) return;

    const conversation = getChatConversations().find(item =>
        sameId(item.id, activeConversationId) &&
        Array.isArray(item.participants) &&
        item.participants.some(id => sameId(id, currentUser.id))
    );

    messagesContainer.replaceChildren();

    if (!conversation) {
        if (title) title.textContent = "Tus mensajes";
        if (subtitle) subtitle.textContent = "Selecciona un chat para comenzar.";
        if (form) form.hidden = true;
        if (input) input.disabled = true;
        if (sendButton) sendButton.disabled = true;
        if (placeholder) placeholder.hidden = false;
        return;
    }

    const otherUser = getOtherParticipant(conversation, currentUser);

    if (title) title.textContent = getChatUserName(otherUser);
    if (subtitle) subtitle.textContent = otherUser.email || "Conversación privada";
    if (form) form.hidden = false;
    if (input) input.disabled = false;
    if (sendButton) sendButton.disabled = false;
    if (placeholder) placeholder.hidden = true;

    const messages = getConversationMessages(conversation.id);

    if (messages.length === 0) {
        const empty = document.createElement("p");
        empty.className = "chat-empty-state";
        empty.textContent = "¡Di hola! Este es el comienzo de la conversación.";
        messagesContainer.appendChild(empty);
        return;
    }

    messages.forEach(message => {
        const wrapper = document.createElement("div");
        wrapper.className = "private-message";

        const isMine = sameId(message.senderId, currentUser.id);
        wrapper.classList.add(isMine ? "my-message" : "other-message");

        const bubble = document.createElement("div");
        bubble.className = "private-message-bubble";
        bubble.textContent = message.text;

        const time = document.createElement("time");
        time.className = "private-message-time";
        time.textContent = formatChatTime(message.createdAt);

        wrapper.append(bubble, time);
        messagesContainer.appendChild(wrapper);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* ---------- ENVIAR MENSAJES ---------- */

function sendPrivateMessage(event) {
    if (event) event.preventDefault();

    const currentUser = getChatCurrentUser();
    const input = document.getElementById("privateMessageInput");

    if (!currentUser || !input || !activeConversationId) return;

    const text = input.value.trim();

    if (!text) return;

    if (text.length > 2000) {
        showChatNotice("El mensaje no puede superar los 2000 caracteres.");
        return;
    }

    const conversation = getChatConversations().find(item =>
        sameId(item.id, activeConversationId) &&
        Array.isArray(item.participants) &&
        item.participants.some(id => sameId(id, currentUser.id))
    );

    if (!conversation) {
        showChatNotice("No se encontró la conversación.");
        return;
    }

    const messages = getChatMessages();

    messages.push({
        id: "message_" + Date.now() + "_" +
            Math.random().toString(36).slice(2, 8),
        conversationId: conversation.id,
        senderId: currentUser.id,
        text: text,
        createdAt: new Date().toISOString()
    });

    saveChatMessages(messages);

    input.value = "";

    renderConversationList();
    renderActiveConversation();
    renderUserSearch(
        document.getElementById("chatUserSearch")?.value || ""
    );

    input.focus();
}

/* ---------- NOTIFICACIONES ---------- */

function showChatNotice(message) {
    const container = document.getElementById("notificationContainer");

    if (container) {
        const notice = document.createElement("div");
        notice.className = "notification";
        notice.textContent = message;
        container.appendChild(notice);

        window.setTimeout(() => notice.remove(), 3500);
    } else {
        alert(message);
    }
}

/* ---------- ACTUALIZACIÓN LOCAL ---------- */

/*
   Permite refrescar la interfaz si otra pestaña del mismo
   navegador modifica las conversaciones o los mensajes.
*/

window.addEventListener("storage", event => {
    if (
        event.key === CHAT_MESSAGES_KEY ||
        event.key === CHAT_CONVERSATIONS_KEY ||
        event.key === CHAT_USERS_KEY
    ) {
        renderConversationList();
        renderUserSearch(
            document.getElementById("chatUserSearch")?.value || ""
        );
        renderActiveConversation();
    }
});

/* ---------- INICIALIZACIÓN ---------- */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("chatUserSearch");
    const form = document.getElementById("privateChatForm");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            handleChatUserSearch(event.target.value);
        });
    }

    if (form) {
        form.addEventListener("submit", sendPrivateMessage);
    }
});
