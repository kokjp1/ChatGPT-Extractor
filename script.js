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
        fileInput.files = event.dataTransfer.files; // Update input
        handleFile(file);
    }
});

function handleFile(file) {
    if (!file) return;

    statusDiv.innerText = "Bestand aan het verwerken...";
    statusDiv.className = "status-container visible status-loading";

    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlContent = e.target.result;
        
        // Maak een virtueel DOM-element aan om de HTML te lezen
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
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
                messages.push({
                    role: role,
                    content: contentDiv.innerText.trim()
                });
            }
        });

        if (messages.length > 0) {
            // Maak de JSON en start de download
            const jsonString = JSON.stringify(messages, null, 4);
            const blob = new Blob([jsonString], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^/.]+$/, "") + "_schoon.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            statusDiv.innerText = `Klaar! ${messages.length} berichten omgezet en gedownload.`;
            statusDiv.className = "status-container visible status-success";
        } else {
            statusDiv.innerText = "Oeps! Geen berichten gevonden in dit bestand.";
            statusDiv.className = "status-container visible status-error";
        }
    };
    reader.readAsText(file);
}
