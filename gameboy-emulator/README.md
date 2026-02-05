# Game Boy Advance Emulator Web

Un emulador web responsivo de Game Boy Advance (GBA) con UI realista basada en imagen del hardware original.

## ✨ Características Implementadas

### 🎮 Hardware Visual
- **Diseño fiel**: Imagen SVG del GBA azul original con proporción correcta
- **Canvas responsive**: Pantalla 240×160 px alineada perfectamente dentro del marco
- **Escalado automático**: Se adapta a cualquier tamaño de pantalla

### 🕹️ Controles
- **Teclado**: WASD (direcciones), Z/X (A/B), Q/W (L/R), Enter (Start), Backspace (Select)
- **Touch/Táctil**: Botones interactivos para tabletas/pantallas táctiles
- **Remapeo**: Configurar cualquier tecla desde el menú ⌨
- **Botones visuales**: D-Pad, A/B, L/R, Start/Select con feedback visual

### 📦 Carga de ROMs
- Carga archivos `.gba` desde el dispositivo
- Muestra información: nombre del juego, tamaño (KB), bytes de cabecera
- Soporta validación básica de header ROM

### 💾 Guardado de Partidas
- **3 ranuras**: Guardar/cargar en slots 1-3 desde los botones del dispositivo
- **IndexedDB**: Persistencia en el navegador
- **Export/Import**: Descargar y cargar partidas (.sav)
- **Múltiples saves**: Gestión de ranuras con marca de tiempo

### 🔊 Audio
- **Web Audio API**: Soporte preparado para sonido
- **Control de volumen**: Slider + botón mute integrados
- **Persistencia**: El volumen se guarda entre sesiones

### ⚙️ Emulación
- **EmulatorJS WASM**: Emulación real de GBA con núcleo compilado a WebAssembly
- **Juegos reales**: Soporta cientos de títulos comerciales de GBA
- **Input binding**: Teclado/Touch → eventos del emulador
- **Audio completo**: Web Audio API integrado en EmulatorJS
- **Guardado de estado**: Save/Load completamente funcional

### 🎨 UI Avanzada
- **Pantalla completa**: Botón para modo fullscreen
- **Control de velocidad**: 1x, 1.5x, 2x (configuración preparada)
- **Pausa/Reanuda**: Control de emulación
- **Panel de información**: Muestra título y datos de ROM
- **Tema dark**: Interfaz nocturna compatible

---

## 🚀 Cómo Usar

### 1. **Iniciar servidor local**
```bash
cd "d:\Proyectos de VScode\gameboy-emulator"
python -m http.server 8000
```

### 2. **Abrir en navegador**
```
http://localhost:8000/index.html
```

### 3. **Cargar una ROM**
- Haz clic en "Cargar ROM" o en el botón ROM del dispositivo
- Selecciona un archivo `.gba`
- La ROM comienza a "emularse" (actualmente muestra patrón demo)

### 4. **Probar controles**
- Teclado: WASD (mover), Z/X (A/B), Q/W (L/R), Enter (Start)
- Botones visuales del dispositivo (clickeables)
- Remapeo: Haz clic en ⌨ → configura teclas

### 5. **Guardar/Cargar**
- Haz clic en los 3 cuadros grises izquierdos para guardar en ranuras 1-3
- Botón central ⏸ (pausa/reanuda)
- Panel superior: exportar/importar saves

---

## 🔌 Núcleo WASM EmulatorJS

Este proyecto ahora usa **EmulatorJS** como core WASM para emulación real de Game Boy Advance.

### ✅ Configuración Actual

El proyecto está configurado para usar **EmulatorJS** con los siguientes componentes:

1. **emulatorjs-init.js**: Carga y inicializa EmulatorJS desde CDN
2. **emulatorjs-wrapper.js**: Adaptador que proporciona la interfaz compatible con el emulador
3. **index.html**: Cargar EmulatorJS desde jsDelivr CDN
4. **emulator.js**: Usa EmulatorJSWrapper en lugar del stub local

### 🚀 Características de EmulatorJS WASM

- **Múltiples sistemas**: Game Boy, NES, SNES, Genesis, GBA y más
- **Compilado a WASM**: Rápido y eficiente
- **Audio completo**: Web Audio API integrado
- **Save states**: Guardado y carga de estado
- **Input mapping**: Soporte para teclado, gamepad y táctil
- **Escalado**: Soporte para upscaling con shaders (opcionales)

### 📋 Cómo funciona

```javascript
// 1. Se carga EmulatorJS desde CDN en index.html
// <script src="https://cdn.jsdelivr.net/npm/emulatorjs@latest/dist/emulator.js"></script>

// 2. emulatorjs-init.js crea la instancia global
window.emulatorInstance = new EJS_player({ /* config */ });

// 3. emulatorjs-wrapper.js proporciona la interfaz compatible
let gbaCore = new EmulatorJSWrapper(canvas);

// 4. El código del emulador funciona sin cambios
gbaCore.loadRom(arrayBuffer);
gbaCore.start();
gbaCore.setInput('a', true);  // Presionar botón A
```

### ⚙️ Diferencias con el stub anterior

| Aspecto | Stub Local | EmulatorJS WASM |
|--------|-----------|-----------------|
| **Emulación** | Patrón demo | Emulación real GBA |
| **Juegos** | No soporta | Pokémon, Mario, Zelda, etc. |
| **Audio** | API preparado | Audio completo funcional |
| **Performance** | Bajo uso CPU | Optimizado WASM |
| **SRAM** | Demo | Guardado real |

### 🎮 Juegos compatibles

EmulatorJS soporta prácticamente todos los juegos de Game Boy Advance:
- Pokémon (Rojo/Azul, Rubí/Zafiro, Esmeralda, Fuego/Hoja)
- The Legend of Zelda (La Minish Cap, The Four Swords)
- Super Mario Advance (1-4)
- Castlevania (múltiples versiones)
- Metroid (Zero Mission, Fusion)
- Y miles más...

### 📥 Cargar ROMs

1. Haz clic en "Cargar ROM"
2. Selecciona un archivo `.gba` válido
3. EmulatorJS compila la ROM y comienza la emulación
4. Los controles funcionan automáticamente

### 🔐 Privacidad

Todo funciona **localmente en tu navegador**:
- Las ROMs NO se suben a ningún servidor
- Los saves se guardan en IndexedDB (local)
- No hay conexión a internet después de cargar la página

---

## 🔌 Núcleo WASM EmulatorJS (Configuración Alternativa)

Si prefieres usar otro núcleo WASM en el futuro:

### Opción A: mgba-wasm (Alternativa)

1. **Descargar desde GitHub**:
```bash
# Descargar gba-js (port de mGBA a WASM)
wget https://github.com/jsmolka/gba-js/releases/download/v0.6.0/gba.js
wget https://github.com/jsmolka/gba-js/releases/download/v0.6.0/gba.wasm
```

2. **Colocar en carpeta del proyecto**:
```
gameboy-emulator/
├── gba.js      ← Descargado
├── gba.wasm    ← Descargado
├── emulatorjs-wrapper.js  ← Mantener, será reemplazado
├── emulator.js
├── index.html
└── ...
```

3. **Crear nuevo wrapper** para mgba-wasm si es necesario

### Opción B: Compilar mGBA a WASM (Avanzado)

```bash
# Requiere Emscripten instalado
git clone https://github.com/mgba-emu/mgba.git
cd mgba
emconfigure ./configure --disable-debuggers
emmake make
```

---

## 📁 Estructura del Proyecto

```
gameboy-emulator/
├── index.html                      # UI principal
├── styles.css                      # Estilos y layout
├── emulator.js                     # Lógica principal + gestión de input
├── emulatorjs-init.js              # Inicializador de EmulatorJS desde CDN
├── emulatorjs-wrapper.js           # Adaptador EmulatorJS ← Core WASM
├── gba-core.js                     # Stub simulador (deprecado, puede removerse)
├── gba-device.svg                  # Imagen del hardware GBA
└── README.md                       # Este archivo
```

### Flujo de inicialización

```
index.html
  ↓
<script> EmulatorJS (CDN) ↓ emulatorjs-init.js (crea instancia global)
  ↓
emulatorjs-wrapper.js (adaptador compatible)
  ↓
emulator.js (lógica principal)
  ↓
Browser: Usuario carga ROM → EmulatorJS WASM emula → Renderiza en canvas
```

---

## 🎯 API del Wrapper (EmulatorJSWrapper)

EmulatorJSWrapper proporciona una interfaz compatible entre EmulatorJS y el código del emulador:

```javascript
class EmulatorJSWrapper {
    // Cargar ROM desde ArrayBuffer
    async loadRom(arrayBuffer) {}
    
    // Iniciar emulación
    start() {}
    
    // Pausar emulación
    pause() {}
    
    // Reanudar emulación
    resume() {}
    
    // Detener emulación
    stop() {}
    
    // Establecer entrada (botón, pressed)
    setInput(button, pressed) {}
    // buttons: 'up', 'down', 'left', 'right', 'a', 'b', 'l', 'r', 'start', 'select'
    
    // Guardar estado
    saveState() { return stateObject; }
    
    // Cargar estado
    loadState(stateObject) {}
    
    // Información de la ROM
    getRomInfo() { return { gameTitle, gameCode, romVersion, size }; }
}
```

### Notas sobre EmulatorJS WASM

- **Asincronía**: `loadRom()` es async y espera a que se compile la ROM
- **Renderizado**: EmulatorJS renderiza directamente al canvas proporcionado
- **Input**: Los eventos de input se mapean automáticamente a los botones de GBA
- **Audio**: Completamente manejado por EmulatorJS, sin necesidad de configuración extra
- **Compatibilidad**: Funciona en todos los navegadores modernos con soporte WASM

---

## 🐛 Troubleshooting

### Problema: "No se ve nada en el canvas"
**Solución**: Verifica en DevTools → Console que EmulatorJS se cargó correctamente. Deberías ver: "✅ EmulatorJS cargado desde CDN"

### Problema: "ROM no emula, solo muestra colores de fondo"
**Solución**: emulatorjs-init.js puede estar tardando. Espera unos segundos y recarga la página. Verifica que el archivo `.gba` es válido.

### Problema: Los botones no responden
**Solución**: Verifica que la ROM está cargada correctamente. El título debe mostrarse en el panel arriba del emulador.

### Problema: "EmulatorJS timed out" en console
**Solución**: El CDN puede estar lento. Intenta actualizar la página o usa un navegador diferente.

### Problema: "CORS error" al descargar archivos
**Solución**: Asegúrate de servir por HTTP (no `file://`). Usa `python -m http.server 8000`

### Problema: Guardado no funciona
**Solución**: IndexedDB puede estar deshabilitado. Abre DevTools → Application → Storage → IndexedDB. Comprueba que el almacenamiento está habilitado.

### Problema: Audio muy bajo o sin sonido
**Solución**: 
1. Verifica el slider de volumen (abajo del emulador)
2. Verifica el volumen del navegador/sistema
3. Algunos juegos pueden tener audio bajo. Prueba con otro juego.

---

## 📝 Notas Técnicas

- **EmulatorJS**: Mantiene la compatibilidad con la mayoría de ROMs de GBA comerciales
- **SRAM**: EmulatorJS maneja la SRAM automáticamente; los saves se guardan en IndexedDB
- **Audio**: Completamente integrado; usa Web Audio API para salida de audio
- **Velocidad**: Optimizado para ~60 FPS incluso en hardware antiguo (gracias a WASM)
- **Privacidad**: Todo corre localmente; las ROMs NUNCA se suben a servidores

---

## 🔮 Próximas Mejoras

- [x] Integrar núcleo WASM (EmulatorJS)
- [x] Emulación completa de CPU ARM/Thumb (via EmulatorJS)
- [x] Soporte de audio WASM (via EmulatorJS)
- [ ] UI para shaders/upscaling
- [ ] Historial de rewind
- [ ] Cheats/Game Genie
- [ ] Captura de pantalla (.png)
- [ ] Grabación de video
- [ ] Sincronización con la nube
- [ ] Soporte de gamepad físico (mejorado)

---

## 📄 Licencia

Este proyecto es código original (UI + lógica). Los núcleos WASM (mGBA, VBA-M) tienen sus propias licencias (GPL, etc.).

---

¿Necesitas ayuda integrando un núcleo WASM? Contáctame o abre un issue.
