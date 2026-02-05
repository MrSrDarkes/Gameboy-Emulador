# 🏗️ Arquitectura del Emulador GBA - Diagrama Visual

## 📐 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                  │
│         (Teclado / Botones / Táctil / Gamepad)             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   emulator.js        │
         │  (Control Principal) │
         │                      │
         │ • Input Manager      │
         │ • ROM Loader         │
         │ • UI State           │
         │ • Game Loop          │
         └───────────┬──────────┘
                     │
      ┌──────────────▼──────────────┐
      │ emulatorjs-wrapper.js       │
      │ (Adaptador/Wrapper)         │
      │                             │
      │ • Interfaz Compatible       │
      │ • Input Mapping             │
      │ • State Management          │
      │ • Error Handling            │
      └──────────────┬──────────────┘
                     │
      ┌──────────────▼──────────────────┐
      │  EmulatorJS Core (WASM)         │
      │  (Desde CDN jsDelivr)           │
      │                                 │
      │  ┌──────────────────────────┐   │
      │  │  mGBA Emulator Core      │   │
      │  │  • CPU ARM 32-bit        │   │
      │  │  • GPU (Modo 0-5)        │   │
      │  │  • Memory (VRAM/WRAM)    │   │
      │  │  • Timers/Interrupts     │   │
      │  │  • DMA Controller        │   │
      │  └──────────────────────────┘   │
      │                                 │
      │  ┌──────────────────────────┐   │
      │  │  Audio Engine (APU)      │   │
      │  │  • PSG (4 canales)       │   │
      │  │  • PWM (2 canales)       │   │
      │  │  • Mixer                 │   │
      │  └──────────────────────────┘   │
      │                                 │
      │  ┌──────────────────────────┐   │
      │  │  Storage (SRAM/EEPROM)   │   │
      │  │  • Game Save Support     │   │
      │  └──────────────────────────┘   │
      └──┬───────────────────────────┬──┘
         │                           │
    Canvas             Web Audio API
  (Renderizado)       (Sonido)
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼──────────┐
         │   Navegador          │
         │ • Hardware Graphics  │
         │ • Audio Output       │
         │ • Storage (IndexedDB)│
         └───────────┬──────────┘
                     │
              ┌──────▼─────┐
              │   Monitor  │
              │ + Parlantes │
              └────────────┘
```

---

## 📊 Flujo de Datos: Carga de ROM

```
Usuario selecciona ROM (.gba)
    ↓
File Input → array buffer
    ↓
handleRomLoad() 
    ↓
await gbaCore.loadRom(buffer)
    ↓
emulatorjs-wrapper.js
    ↓
EmulatorJS.run(buffer)
    ↓
WASM Compiler
    ↓
ROM compilada en memoria VM
    ↓
gbaCore.start()
    ↓
gameLoop() inicia
    ↓
Emulación en tiempo real
    ↓
Canvas renders frame
    ↓
Pantalla actualizada
```

---

## 🔄 Flujo de Entrada (Botones)

```
Teclado Press (ej: 'w')
    ↓
handleKeyDown()
    ↓
emitButtonEvent('R', 'down')
    ↓
gbaCore.setInput('r', true)
    ↓
emulatorjs-wrapper
    ↓
emulator.input({key: 'R', type: 'keydown'})
    ↓
EmulatorJS (WASM)
    ↓
CPU ARM recibe input
    ↓
Juego responde (ej: mueve personaje)
```

---

## 🗂️ Estructura de Carpetas

```
gameboy-emulator/
│
├── 📄 index.html                   ← Punto de entrada
├── 📄 styles.css                   ← Estilos CSS
│
├── 🎮 Núcleo de Emulación
│  ├── emulatorjs-wrapper.js        ← Adaptador (NEW)
│  ├── emulatorjs-init.js           ← Inicializador CDN (NEW)
│  ├── gba-core.js                  ← Stub antiguo (deprecated)
│  └── emulator.js                  ← Control principal
│
├── 🔧 Herramientas
│  ├── error-handler.js             ← Diagnóstico (NEW)
│  ├── diagnostic.js                ← Troubleshooting (NEW)
│  └── server.bat                   ← Servidor Windows
│
├── 🎨 Recursos
│  ├── gba-device.svg               ← Imagen del hardware
│  └── generate-gba-image.html      ← Generador SVG
│
└── 📚 Documentación
   ├── README.md                    ← Principal (UPDATED)
   ├── EMPEZAR.md                   ← Guía rápida (NEW)
   ├── QUICKSTART.md                ← Inicio 5 min (NEW)
   └── INTEGRATION_SUMMARY.md       ← Técnica detallada (NEW)
```

---

## 🔗 Dependencias y Conexiones

```
┌─────────────────────────────────────────────────────────┐
│                    index.html                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. <script src="CDN">  ← EmulatorJS WASM             │
│  2. <script src="emulatorjs-init.js">                 │
│  3. <script src="emulatorjs-wrapper.js">              │
│  4. <script src="error-handler.js">                   │
│  5. <script src="emulator.js">                        │
│                                                         │
│  <link rel="stylesheet" href="styles.css">            │
│                                                         │
│  <svg src="gba-device.svg">   ← Imagen hardware       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Orden de carga es CRÍTICO:**
1. EmulatorJS (define EJS_player)
2. emulatorjs-init.js (usa EJS_player)
3. emulatorjs-wrapper.js (clase disponible)
4. error-handler.js (verificación)
5. emulator.js (usa gbaCore que espera wrapper)

---

## 🎯 Mapeo de Interfaces

### Clase EmulatorJSWrapper

```javascript
class EmulatorJSWrapper {
    // Propiedades
    canvas                 ← Canvas HTML
    emulator              ← Instancia de EJS_player
    rom                   ← Buffer de ROM actual
    running               ← Estado de emulación
    
    // Métodos Públicos
    async loadRom(buffer) → boolean
    start()              → void
    pause()              → void  
    resume()             → void
    stop()               → void
    setInput(btn, bool)  → void
    saveState()          → object
    loadState(obj)       → boolean
    getRomInfo()         → object
}
```

### Métodos de Emulator (emulator.js)

```javascript
// Inicialización
initializeCanvas()
initializeAudio()
loadKeymapFromStorage()
setupEventListeners()

// Manejo de ROM
async handleRomLoad(e)

// Control de emulación
startEmulation()
pauseGame()
resumeGame()
togglePower()

// Loop de juego
gameLoop()
renderFrame()
renderEmptyScreen()

// Input
handleKeyDown(e)
handleKeyUp(e)
simulateKeyPress(key)
simulateKeyRelease(key)
emitButtonEvent(button, state)

// Audio/Video
toggleFullscreen()
handleVolumeChange(e)
toggleMute()
updateAudioVolume()

// Persistencia
loadVolumeFromStorage()
saveKeymapToStorage()
loadKeymapFromStorage()
```

---

## 🧠 Estado Global (emulatorState)

```javascript
{
    isRunning: boolean         ← ¿Está emulando?
    isPaused: boolean         ← ¿Pausado?
    gameLoaded: boolean       ← ¿ROM cargada?
    currentRom: ArrayBuffer   ← Buffer de ROM
    currentGameTitle: string  ← Nombre del juego
    keyMap: object           ← Mapeo de teclas
    pressedKeys: object      ← Teclas activas
    volume: number           ← Volumen (0-100)
    isMuted: boolean         ← ¿Silenciado?
    gameSpeed: number        ← Multiplicador velocidad
    audioContext: object     ← Web Audio API context
    audioNodes: object       ← Nodos de audio
}
```

---

## 📡 Comunicación Entre Capas

```
Usuario Input (ej: presiona 'W')
    ↓ event.keydown
emulator.js (handleKeyDown)
    ↓ emitButtonEvent('R', 'down')
emulatorjs-wrapper.js (setInput)
    ↓ emulator.input({key: 'R', type: 'keydown'})
EmulatorJS WASM
    ↓ CPU ARM recibe input
Núcleo mGBA
    ↓ Actualiza registro de botones
Game Code (en WASM)
    ↓ if (button_R) { ... }
Cambio de estado interno
    ↓ Renderizado de frame
Canvas
    ↓ Pixel display
Monitor
    ↓ Usuario ve resultado
```

---

## 🔐 Capas de Seguridad

```
┌─────────────────────────────────┐
│   User Code (JavaScript)        │  ← Sandbox del navegador
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   WASM Virtual Machine          │  ← Sandbox WASM adicional
│   (mGBA Emulator Core)          │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   Sistema de Archivos Virtual   │  ← IndexedDB aislado
│   (Save Data Isolated)          │
└─────────────────────────────────┘
```

---

## ⚡ Path Crítico de Rendimiento

```
Emulación de un Frame (16.67ms @ 60fps)

1. Input poll              1ms
   ↓
2. CPU cycle execution     12ms
   ↓
3. Render scanline        2ms
   ↓
4. Audio generation       0.5ms
   ↓
5. Canvas putImageData    1.17ms
   ↓
= Total                   ~16.67ms ✅
```

*Nota: Tiempos son aproximados y dependen del hardware*

---

## 🌐 Localización de Recursos

```
Archivo             Ubicación              Tipo
───────────────────────────────────────────────────
EmulatorJS          jsDelivr CDN           WASM
gba-device.svg      Servidor local         SVG
ROM                 File upload            Binario
Saves (IndexedDB)   Navegador local        Database
Audio               Web Audio API          Virtual
Canvas              DOM browser            Virtual
```

---

**Diagrama generado**: Febrero 5, 2026
**Versión de arquitectura**: 1.0 - EmulatorJS
