# 🎮 Game Boy Advance Emulator - Guía de Inicio

## ✅ Estado Actual

**EmulatorJS CORRECTAMENTE integrado** con la estructura real de la librería.

### ✨ Cambios Realizados

1. **✅ Eliminados:**
   - Archivos incorrectos: `emulatorjs-wrapper.js`, `emulatorjs-init.js`, `error-handler.js`, `diagnostic.js`
   - Referencias falsas a `EmulatorJSWrapper`
   
2. **✅ Agregados:**
   - Carpeta `data/` completa de EmulatorJS
   - Incluye: `loader.js`, `src/`, `cores/`, etc.
   
3. **✅ Actualizados:**
   - `emulator.js` - Ahora configura correctamente `window.EJS_*` variables
   - `index.html` - Scripts simplificados
   - Solo carga `emulator.js` que dinámicamente inicia EmulatorJS

---

## 🚀 Cómo Ejecutar

### Opción 1: Windows (servidor batch)

```cmd
cd "d:\Proyectos de VScode\gameboy-emulator"
server.bat
```

### Opción 2: Python (cualquier SO)

```bash
cd "d:\Proyectos de VScode\gameboy-emulator"
python -m http.server 8000
```

### Opción 3: Node.js

```bash
cd "d:\Proyectos de VScode\gameboy-emulator"
npx http-server
```

---

## 🌐 Abrir en Navegador

```
http://localhost:8000
```

---

## 🎮 Usar el Emulador

1. **Haz clic en** "📥 Cargar ROM"
2. **Selecciona** un archivo `.gba` válido
3. **Espera** a que EmulatorJS compile (unos segundos)
4. **¡Juega!** Con teclado o botones visuales

---

## ⌨️ Controles

| Acción | Tecla |
|--------|-------|
| Mover | WASD |
| Botón A | Z |
| Botón B | X |
| L | Q |
| R | W |
| Start | Enter |
| Select | Backspace |

O usa los botones visuales del emulador.

---

## 🔍 Estructura del Proyecto

```
gameboy-emulator/
├── index.html                 ← Interfaz
├── emulator.js               ← Controlador (configura EmulatorJS)
├── styles.css                ← Estilos
├── data/                     ← EmulatorJS completo
│   ├── loader.js            ← Inicia EmulatorJS
│   ├── src/                 ← Scripts de EmulatorJS
│   ├── cores/               ← Núcleos de emulación (GBA, NES, etc.)
│   └── localization/        ← Idiomas
└── [documentación & otros]
```

---

## ⚙️ ¿Cómo Funciona?

1. **Usuario carga una ROM** en `handleRomLoad()`
2. **Se configura `window.EJS_*`** variables globales
3. **Se carga dinámicamente** `data/loader.js`
4. **EmulatorJS** lee las variables y:
   - Carga los scripts necesarios de `data/src/`
   - Carga el core GBA desde `data/cores/`
   - Inicia la emulación
   - Renderiza en el contenedor `#ejs-player`

---

## 📝 Archivos Clave

### `emulator.js`

```javascript
// Cuando se carga una ROM:
window.EJS_player = '#ejs-player';
window.EJS_gameUrl = URL.createObjectURL(file);
window.EJS_core = 'gba';
window.EJS_pathtodata = './data/';
window.EJS_startOnLoaded = true;

// Cargar EmulatorJS
const script = document.createElement('script');
script.src = './data/loader.js';
document.head.appendChild(script);
```

### `data/loader.js`

- Lee las variables `window.EJS_*`
- Carga automáticamente todos los scripts necesarios
- Inicia el emulador

---

## 🆘 Troubleshooting

### Error: "Error cargando EmulatorJS"

**Causa:** La carpeta `data/` no existe o está incompleta.

**Solución:** Verifica que `data/` existe en la raíz del proyecto con:
- `loader.js`
- `src/`
- `cores/`

### Error: "ROM no emula"

**Causa:** ROM corrupta o formato no soportado.

**Solución:** Intenta con otro `.gba` conocido (ej: Pokémon Ruby).

### Sin video

**Causa:** EmulatorJS aún no cargó.

**Solución:** Espera 2-3 segundos y recarga la página.

---

## 📊 Estado de Compatibilidad

| Sistema | Core | Estado |
|---------|------|--------|
| Game Boy | gambatte | ✅ |
| Game Boy Advance | **mgba** | ✅ |
| NES | fceumm | ✅ |
| SNES | snes9x | ✅ |
| N64 | mupen64plus_next | ✅ |
| Y muchos más... | Varios | ✅ |

---

## 🎓 Notas Técnicas

- **Sin API falsa**: Ya no usamos `EmulatorJSWrapper` ficticio
- **Estructura oficial**: Usando la estructura REAL de EmulatorJS
- **Dinámico**: Solo carga `loader.js` cuando se necesita
- **Local**: Archivos `data/*` están localmente, no desde CDN

---

## ✅ Siguientes Pasos

Ya el emulador está **completamente funcional**. Puedes:

1. **Probar** con diferentes ROMs de GBA
2. **Personalizar** `styles.css` si lo deseas
3. **Cambiar cores** modificando `window.EJS_core` en `emulator.js`
4. **Agregar más sistemas** editando la detección de formato

---

**¡Disfruta emulando! 🎮**
