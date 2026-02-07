/**
 * Game Boy Advance Emulator - Sistema de control principal
 * Controla UI, entrada de usuario y gestión del emulador EmulatorJS
 */

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    CANVAS_WIDTH: 240,
    CANVAS_HEIGHT: 160,
    DEFAULT_KEYMAP: {
        'arrowup': 'UP',
        'arrowdown': 'DOWN',
        'arrowleft': 'LEFT',
        'arrowright': 'RIGHT',
        'z': 'A',
        'x': 'B',
        'q': 'L',
        'w': 'R',
        'enter': 'START',
        'backspace': 'SELECT'
    }
};

// ==================== ESTADO GLOBAL ====================
let emulatorState = {
    isRunning: false,
    isPaused: false,
    gameLoaded: false,
    currentRom: null,
    currentRomUrl: null,
    currentGameTitle: 'Ningún juego cargado',
    keyMap: {},
    pressedKeys: {},
    volume: 70,
    isMuted: false,
    gameSpeed: 1,
    audioContext: null,
    audioNodes: {},
    canvasObserver: null
};

// ==================== DOM ELEMENTOS ====================
const DOM = {
    gameCanvas: document.getElementById('gameCanvas'),
    canvasCtx: null,
    romInput: document.getElementById('romInput'),
    loadRomBtn: document.getElementById('loadRomBtn'),
    gameTitle: document.getElementById('gameTitle'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    powerBtn: document.getElementById('powerBtn'),
    powerLed: document.getElementById('powerLed'),
    muteBtn: document.getElementById('muteBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    gbaDevice: document.querySelector('.gba-device')
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
    initializeAudio();
    loadKeymapFromStorage();
    loadVolumeFromStorage();
    setupEventListeners();
    setupButtonEvents();
    updatePowerLed();
    console.log('✅ Game Boy Advance Emulator iniciado');
});

function initializeCanvas() {
    DOM.canvasCtx = DOM.gameCanvas.getContext('2d');
    DOM.canvasCtx.imageSmoothingEnabled = false;
    DOM.canvasCtx.imageSmoothingQuality = 'low';
    DOM.gameCanvas.width = CONFIG.CANVAS_WIDTH;
    DOM.gameCanvas.height = CONFIG.CANVAS_HEIGHT;
    console.log('✅ Canvas inicializado');
}

function initializeAudio() {
    try {
        emulatorState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('⚠️ Web Audio API no soportado:', e.message);
    }
}

// ==================== SETUP DE EVENTOS ====================
function setupEventListeners() {
    // ROM loading
    DOM.loadRomBtn.addEventListener('click', () => DOM.romInput.click());
    DOM.romInput.addEventListener('change', handleRomLoad);

    // Control buttons
    DOM.pauseBtn.addEventListener('click', pauseGame);
    DOM.resumeBtn.addEventListener('click', resumeGame);
    DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    DOM.powerBtn.addEventListener('click', togglePower);

    // Volume controls
    DOM.muteBtn.addEventListener('click', toggleMute);
    DOM.volumeSlider.addEventListener('input', handleVolumeChange);

    // Keyboard input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Touch input
    setupTouchControls();

}

function setupButtonEvents() {
    // Simular clics en botones visuales
    document.querySelectorAll('[data-key]').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            const key = btn.dataset.key;
            simulateKeyPress(key);
            btn.classList.add('pressed');
        });

        btn.addEventListener('mouseup', (e) => {
            const key = btn.dataset.key;
            simulateKeyRelease(key);
            btn.classList.remove('pressed');
        });

        btn.addEventListener('mouseleave', (e) => {
            const key = btn.dataset.key;
            simulateKeyRelease(key);
            btn.classList.remove('pressed');
        });

        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = btn.dataset.key;
            simulateKeyPress(key);
            btn.classList.add('pressed');
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = btn.dataset.key;
            simulateKeyRelease(key);
            btn.classList.remove('pressed');
        });
    });
}

function setupTouchControls() {
    // Los botones ya tienen eventos de touch en setupButtonEvents
}

// ==================== MANEJO DE ENTRADA ====================
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!emulatorState.keyMap[key]) return;
    
    if (!emulatorState.pressedKeys[key]) {
        emulatorState.pressedKeys[key] = true;
        const button = document.querySelector(`[data-key="${key}"]`);
        if (button) button.classList.add('pressed');
        emitButtonEvent(emulatorState.keyMap[key], 'down');
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (!emulatorState.keyMap[key]) return;

    delete emulatorState.pressedKeys[key];
    const button = document.querySelector(`[data-key="${key}"]`);
    if (button) button.classList.remove('pressed');
    emitButtonEvent(emulatorState.keyMap[key], 'up');
}

function simulateKeyPress(key) {
    if (!emulatorState.keyMap[key]) return;
    emulatorState.pressedKeys[key] = true;
    emitButtonEvent(emulatorState.keyMap[key], 'down');
}

function simulateKeyRelease(key) {
    delete emulatorState.pressedKeys[key];
    emitButtonEvent(emulatorState.keyMap[key], 'up');
}

function emitButtonEvent(button, state) {
    // EmulatorJS maneja input a través de su propio sistema
    // Solo registramos para debugging
    console.log(`🎮 Botón ${button}: ${state}`);
}

// ==================== MANEJO DE ROM ====================
async function handleRomLoad(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isGba = file.name.toLowerCase().endsWith('.gba');
    if (!isGba) {
        alert('❌ Por favor carga un archivo .gba');
        return;
    }

    try {
        cleanupEmulator();

        // Actualizar estado
        emulatorState.currentRom = file;
        emulatorState.currentRomUrl = URL.createObjectURL(file);
        emulatorState.currentGameTitle = file.name.replace(/\.[^/.]+$/, '');
        emulatorState.gameLoaded = true;

        DOM.gameTitle.textContent = `🎮 ${emulatorState.currentGameTitle}`;
        DOM.pauseBtn.disabled = false;
        DOM.resumeBtn.disabled = true;
        updatePowerLed();

        const sizeKb = (file.size / 1024).toFixed(1);
        console.log(`📦 ROM cargada: ${emulatorState.currentGameTitle} (${sizeKb} KB)`);

        // Preparar contenedor para EmulatorJS
        const gameContainer = document.createElement('div');
        gameContainer.id = 'ejs-player';
        gameContainer.classList.add('emulator-screen');
        gameContainer.style.width = '100%';
        gameContainer.style.height = '100%';
        DOM.gameCanvas.parentElement.appendChild(gameContainer);
        DOM.gameCanvas.style.display = 'none';

        // Configurar variables globales de EmulatorJS
        window.EJS_player = '#ejs-player';
        window.EJS_gameUrl = emulatorState.currentRomUrl;
        window.EJS_core = 'gba';
        window.EJS_pathtodata = window.EJS_pathtodata || './data/';
        window.EJS_startOnLoaded = true;
        window.EJS_gameName = emulatorState.currentGameTitle;

        // Cargar loader.js dinámicamente
        const script = document.createElement('script');
        script.id = 'emulatorjs-loader';
        script.src = (window.EJS_pathtodata || './data/') + 'loader.js';
        script.onload = () => {
            console.log('✅ EmulatorJS cargado y ROM iniciada');
            startEmulatorCanvasObserver();
        };
        script.onerror = () => {
            console.error('❌ Error cargando EmulatorJS');
            alert('❌ Error cargando EmulatorJS. Verifica que la carpeta data/ existe.');
        };
        document.head.appendChild(script);

        startEmulation();
        
    } catch (error) {
        console.error('❌ Error cargando ROM:', error);
        alert('❌ Error al cargar la ROM');
    }
}

// ==================== CONTROL DE EMULACIÓN ====================
function startEmulation() {
    if (emulatorState.isRunning) return;
    emulatorState.isRunning = true;
    emulatorState.isPaused = false;
    DOM.pauseBtn.disabled = false;
    DOM.resumeBtn.disabled = true;
    updatePowerLed();
    console.log('▶️ Emulación iniciada');
}

function pauseGame() {
    emulatorState.isPaused = true;
    DOM.pauseBtn.disabled = true;
    DOM.resumeBtn.disabled = false;
    updatePowerLed();
    console.log('⏸ Emulación pausada');
}

function resumeGame() {
    emulatorState.isPaused = false;
    DOM.pauseBtn.disabled = false;
    DOM.resumeBtn.disabled = true;
    updatePowerLed();
    console.log('▶️ Emulación reanudada');
}

function togglePower() {
    if (emulatorState.gameLoaded) {
        if (emulatorState.isRunning) {
            emulatorState.isRunning = false;
            emulatorState.isPaused = false;
            updatePowerLed();
            console.log('🔴 Emulación detenida');
        } else {
            startEmulation();
            console.log('🟢 Emulación iniciada');
        }
    }
}

// ==================== CONTROLES DE PANTALLA Y AUDIO ====================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        DOM.gbaDevice.requestFullscreen().catch(err => {
            console.error('Error intentando fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function handleVolumeChange(e) {
    emulatorState.volume = parseInt(e.target.value);
    localStorage.setItem('gbaVolume', emulatorState.volume);
    updateAudioVolume();
    console.log(`🔊 Volumen: ${emulatorState.volume}%`);
}

function toggleMute() {
    emulatorState.isMuted = !emulatorState.isMuted;
    DOM.muteBtn.textContent = emulatorState.isMuted ? '🔇' : '🔊';
    updateAudioVolume();
}

function updateAudioVolume() {
    const volume = emulatorState.isMuted ? 0 : (emulatorState.volume / 100);
    if (emulatorState.audioContext && emulatorState.audioNodes.masterGain) {
        emulatorState.audioNodes.masterGain.gain.value = volume;
    }
}

function loadVolumeFromStorage() {
    const saved = localStorage.getItem('gbaVolume');
    if (saved) {
        emulatorState.volume = parseInt(saved);
        DOM.volumeSlider.value = emulatorState.volume;
    }
}

// ==================== GESTIÓN DE TECLADO ====================
function loadKeymapFromStorage() {
    const saved = localStorage.getItem('gbaKeymap');
    const keymap = saved ? JSON.parse(saved) : { ...CONFIG.DEFAULT_KEYMAP };
    emulatorState.keyMap = normalizeKeymap(keymap);
}

function saveKeymapToStorage() {
    localStorage.setItem('gbaKeymap', JSON.stringify(emulatorState.keyMap));
}

function normalizeKeymap(keymap) {
    return Object.keys(keymap).reduce((acc, key) => {
        acc[key.toLowerCase()] = keymap[key];
        return acc;
    }, {});
}

function cleanupEmulator() {
    if (emulatorState.canvasObserver) {
        emulatorState.canvasObserver.disconnect();
        emulatorState.canvasObserver = null;
    }
    emulatorState.isRunning = false;
    emulatorState.isPaused = false;
    emulatorState.gameLoaded = false;
    updatePowerLed();
    const existingPlayer = document.getElementById('ejs-player');
    if (existingPlayer) {
        existingPlayer.remove();
    }
    const existingLoader = document.getElementById('emulatorjs-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    if (emulatorState.currentRomUrl) {
        URL.revokeObjectURL(emulatorState.currentRomUrl);
        emulatorState.currentRomUrl = null;
    }
}

function updatePowerLed() {
    if (!DOM.powerLed) return;
    const isOn = emulatorState.isRunning === true;
    DOM.powerLed.classList.toggle('on', isOn);
    DOM.powerLed.classList.toggle('off', !isOn);
}

function startEmulatorCanvasObserver() {
    const player = document.getElementById('ejs-player');
    if (!player) return;

    constrainEmulatorCanvas();

    emulatorState.canvasObserver = new MutationObserver(() => {
        constrainEmulatorCanvas();
    });

    emulatorState.canvasObserver.observe(player, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'width', 'height']
    });
}

function constrainEmulatorCanvas() {
    const player = document.getElementById('ejs-player');
    if (!player) return;

    player.style.overflow = 'hidden';

    const canvasParent =
        player.querySelector('.ej._canva._parent') ||
        player.querySelector('[class*="_canva"]') ||
        player.querySelector('[class*="ejs_parent"]');

    if (canvasParent) {
        canvasParent.style.position = 'absolute';
        canvasParent.style.top = '0';
        canvasParent.style.left = '0';
        canvasParent.style.width = '100%';
        canvasParent.style.height = '100%';
        canvasParent.style.margin = '0';
        canvasParent.style.padding = '0';
    }

    const canvas = player.querySelector('canvas');
    if (canvas) {
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
    }
}

// ==================== UTILIDADES ====================
console.log('%c🎮 GBA Emulator v1.0', 'color: #667eea; font-size: 16px; font-weight: bold;');
