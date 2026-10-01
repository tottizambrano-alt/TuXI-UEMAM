let currentProductId = null;

function loadChat(productId) {
    currentProductId = productId;
    const messages = JSON.parse(localStorage.getItem(`ml_chat_${productId}`) || '[]');
    renderMessages(messages);
}

function sendQuestion() {
    const input = document.getElementById('questionInput');
    const text = input.value.trim();
    if (!text || !currentProductId) return;

    const messages = JSON.parse(localStorage.getItem(`ml_chat_${currentProductId}`) || '[]');
    messages.push({ sender: 'Comprador', text: text, date: new Date().toLocaleTimeString() });
    
    // Simular respuesta del vendedor
    setTimeout(() => {
        messages.push({ sender: 'Vendedor', text: '¡Hola! Gracias por tu consulta. Sí disponemos de stock inmediato.', date: new Date().toLocaleTimeString() });
        localStorage.setItem(`ml_chat_${currentProductId}`, JSON.stringify(messages));
        renderMessages(messages);
    }, 1000);

    localStorage.setItem(`ml_chat_${currentProductId}`, JSON.stringify(messages));
    input.value = '';
    renderMessages(messages);
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    container.innerHTML = messages.map(m => `
        <div style="margin-bottom:8px; padding:8px; border-radius:4px; background:${m.sender === 'Vendedor' ? '#eef5ff' : '#f5f5f5'}">
            <strong>${m.sender}:</strong> ${m.text}
            <span style="font-size:10px; color:#888; float:right;">${m.date}</span>
        </div>
    `).join('');
}
