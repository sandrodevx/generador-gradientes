// Elementos del DOM
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const directionSelect = document.getElementById('direction');
const gradientPreview = document.getElementById('gradient-preview');
const cssCodeOutput = document.getElementById('css-code');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const savedGradientsContainer = document.getElementById('saved-gradients-container');

const LOCAL_STORAGE_KEY = 'savedGradients_SandroDevX';

// Función mejorada para copiar al portapapeles
async function copyCSSToClipboard() {
    const cssText = cssCodeOutput.textContent;
    
    // Método 1: API moderna (funciona en HTTPS/localhost)
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(cssText);
            showFeedback(copyBtn, '¡Copiado!', '#4CAF50');
            return;
        } catch (err) {
            console.log('Fallo con API moderna, probando método alternativo...');
        }
    }
    
    // Método 2: Fallback para navegadores antiguos/HTTP
    const textarea = document.createElement('textarea');
    textarea.value = cssText;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        showFeedback(copyBtn, successful ? '¡Copiado!' : 'Error al copiar', 
                    successful ? '#4CAF50' : '#F44336');
    } catch (err) {
        showFeedback(copyBtn, 'Error al copiar', '#F44336');
    } finally {
        document.body.removeChild(textarea);
    }
}

// Función para mostrar feedback visual
function showFeedback(element, message, color) {
    const originalText = element.textContent;
    const originalColor = element.style.backgroundColor;
    
    element.textContent = message;
    element.style.backgroundColor = color;
    
    setTimeout(() => {
        element.textContent = originalText;
        element.style.backgroundColor = originalColor;
    }, 2000);
}

// Genera el CSS del gradiente actual
function getCurrentGradientCSS() {
    return `linear-gradient(${directionSelect.value}, ${color1Input.value}, ${color2Input.value})`;
}

// Actualiza la vista previa
function updateGradient() {
    const gradient = getCurrentGradientCSS();
    gradientPreview.style.background = gradient;
    cssCodeOutput.textContent = `background: ${gradient};`;
}

// Obtiene gradientes guardados
function getSavedGradients() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

// Guarda gradientes en localStorage
function saveGradientsToStorage(gradients) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gradients));
}

// Guarda el gradiente actual
function saveCurrentGradient() {
    const gradients = getSavedGradients();
    const newGradient = {
        color1: color1Input.value,
        color2: color2Input.value,
        direction: directionSelect.value,
        id: Date.now().toString()
    };

    // Evitar duplicados
    const isDuplicate = gradients.some(g =>
        g.color1 === newGradient.color1 &&
        g.color2 === newGradient.color2 &&
        g.direction === newGradient.direction
    );

    if (!isDuplicate) {
        gradients.push(newGradient);
        saveGradientsToStorage(gradients);
        displaySavedGradients();
        showFeedback(saveBtn, '¡Guardado!', '#4CAF50');
    } else {
        showFeedback(saveBtn, '¡Ya existe!', '#FF9800');
    }
}

// Muestra gradientes guardados
function displaySavedGradients() {
    const gradients = getSavedGradients();
    savedGradientsContainer.innerHTML = '';

    gradients.forEach((grad, index) => {
        const gradItem = document.createElement('div');
        gradItem.classList.add('saved-gradient-item');
        gradItem.style.background = `linear-gradient(${grad.direction}, ${grad.color1}, ${grad.color2})`;
        gradItem.title = `Clic para aplicar: ${grad.color1} → ${grad.color2} (${grad.direction})`;
        
        gradItem.addEventListener('click', () => {
            color1Input.value = grad.color1;
            color2Input.value = grad.color2;
            directionSelect.value = grad.direction;
            updateGradient();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-gradient-btn');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Eliminar este gradiente';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGradient(index);
        });

        gradItem.appendChild(deleteBtn);
        savedGradientsContainer.appendChild(gradItem);
    });
}

// Elimina un gradiente
function deleteGradient(index) {
    const gradients = getSavedGradients();
    gradients.splice(index, 1);
    saveGradientsToStorage(gradients);
    displaySavedGradients();
}

// Event Listeners
color1Input.addEventListener('input', updateGradient);
color2Input.addEventListener('input', updateGradient);
directionSelect.addEventListener('change', updateGradient);
copyBtn.addEventListener('click', copyCSSToClipboard);
saveBtn.addEventListener('click', saveCurrentGradient);

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateGradient();
    displaySavedGradients();
});