const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const statusDiv = document.getElementById('status');

// Drag and drop visual cues
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-active');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-active');
    }, false);
});

// Handle file selection
fileInput.addEventListener('change', function(event) {
    handleFile(event.target.files[0]);
});

dropZone.addEventListener('drop', function(event) {
    const file = event.dataTransfer.files[0];
    if (file) {
        fileInput.files = event.dataTransfer.files;
        handleFile(file);
    }
});

// ─── Detecteer automatisch het platform ──────────────────────────────────────
function detectPlatform(doc) {
    // Claude heeft data-testid="user-message" en data-is-streaming attributen
    if (doc.querySelector('[data-testid="user-message"]')) return 'claude';
    // ChatGPT heeft data-message-author-role attributen
    if (doc.querySelector('[data-message-author-role]')) return 'chatgpt';
    return null;
}

// ─── ChatGPT parser ───────────────────────────────────────────────────────────
function parseChatGPT(doc) {
    const messages = [];
    const messageNodes = doc.querySelectorAll('div[data-message-author-role]');

    messageNodes.forEach(node => {
        const role = node.getAttribute('data-message-author-role');
        let contentDiv;

        if (role === 'user') {
            contentDiv = node.querySelector('div.whitespace-pre-wrap');
        } else {
            contentDiv = node.querySelector('div.markdown');
        }

        if (contentDiv) {
            const tekst = contentDiv.innerText.trim();
            if (tekst) {
                messages.push({ role, content: tekst });
            }
        }
    });

    return messages;
}

// ─── Claude parser ────────────────────────────────────────────────────────────
function parseClaude(doc) {
    const messages = [];
    const allElements = [];

    doc.querySelectorAll('[data-testid="user-message"]').forEach(el => {
        allElements.push({ el, role: 'user' });
    });

    doc.querySelectorAll('[data-is-streaming]').forEach(el => {
        allElements.push({ el, role: 'assistant' });
    });

    // Sorteer op volgorde in de DOM
    allElements.sort((a, b) => {
        const pos = a.el.compareDocumentPosition(b.el);
        return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    allElements.forEach(({ el, role }) => {
        const tekst = el.innerText.trim();
        if (tekst) {
            messages.push({ role, content: cleanText(tekst) });
        }
    });

    return messages;
}

// Verwijder overbodige lege regels
function cleanText(text) {
    return text.replace(/\n{3,}/g, '\n\n').trim();
}

// ─── Hoofd verwerking ─────────────────────────────────────────────────────────
function handleFile(file) {
    if (!file) return;

    statusDiv.innerText = "Bestand aan het verwerken...";
    statusDiv.className = "status-container visible status-loading";

    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlContent = e.target.result;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const platform = detectPlatform(doc);

        if (!platform) {
            statusDiv.innerText = "Oeps! Dit lijkt geen ChatGPT of Claude HTML-bestand te zijn.";
            statusDiv.className = "status-container visible status-error";
            return;
        }

        const messages = platform === 'claude' ? parseClaude(doc) : parseChatGPT(doc);

        if (messages.length > 0) {
            const jsonString = JSON.stringify(messages, null, 4);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_schoon.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const platformLabel = platform === 'claude' ? 'Claude' : 'ChatGPT';
            const userCount = messages.filter(m => m.role === 'user').length;
            const asstCount = messages.filter(m => m.role === 'assistant').length;

            statusDiv.innerHTML = `Klaar! <strong>${messages.length}</strong> berichten omgezet uit <strong>${platformLabel}</strong>.<br>
                <span class="status-detail">User: ${userCount} &nbsp;|&nbsp; Assistant: ${asstCount}</span>`;
            statusDiv.className = "status-container visible status-success";
        } else {
            statusDiv.innerText = "Oeps! Geen berichten gevonden in dit bestand.";
            statusDiv.className = "status-container visible status-error";
        }
    };
    reader.readAsText(file);
}
