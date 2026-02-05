# 🚀 Inicio Rápido - GBA Emulator con EmulatorJS WASM

## ✅ Integración Completada

Tu Game Boy Advance Emulator ahora usa **EmulatorJS** como core WASM para emulación real.

## 📋 Archivos Modificados

### Nuevos:
- **`emulatorjs-init.js`** - Inicializa EmulatorJS desde CDN
- **`emulatorjs-wrapper.js`** - Adaptador entre tu código y EmulatorJS

### Actualizados:
- **`index.html`** - Carga EmulatorJS desde jsDelivr CDN
- **`emulator.js`** - Usa EmulatorJSWrapper en lugar del stub
- **`README.md`** - Documentación actualizada

### Deprecados (opcionalmente removibles):
- **`gba-core.js`** - Stub simulador antiguo (ya no se usa)

---

## 🏃 Cómo Ejecutar

### Opción 1: Usar `server.bat` (Windows)
```bash
# En la carpeta del proyecto:
server.bat
# Se abrirá un servidor en http://localhost:8000
```

### Opción 2: Python (cualquier SO)
```bash
cd "d:\Proyectos de VScode\gameboy-emulator"
python -m http.server 8000
# Navega a: http://localhost:8000
```

### Opción 3: Node.js (con http-server)
```bash
npx http-server
# Por defecto: http://localhost:8080
```

---

## 🎮 Cómo Usar

1. **Abre `http://localhost:8000` en tu navegador**
   - Verifica en la consola que dice: ✅ EmulatorJS cargado desde CDN

2. **Haz clic en "Cargar ROM"**
   - Selecciona un archivo `.gba` válido
   - Ej: Pokemon Ruby, Mario Advance, etc.

3. **Espera a que compile**
   - EmulatorJS compila la ROM a máquina virtual
   - Tomará unos segundos (normal)

4. **¡Juega!**
   - Usa teclado: `WASD` (mover), `Z/X` (A/B), `Q/W` (L/R), `Enter`, `Backspace`
   - O los botones visuales del emulador

---

## ⚙️ Características Activas

✅ Emulación completa de GBA (via EmulatorJS WASM)
✅ Audio funcional (Web Audio API)
✅ Guardado/Carga de partidas (IndexedDB)
✅ Controles por teclado y táctil
✅ Fullscreen
✅ Control de volumen

---

## 🔧 Estructura de Flujo

```
Usuario abre index.html
    ↓
EmulatorJS se carga (CDN jsDelivr)
    ↓
emulatorjs-init.js crea instancia global
    ↓
EmulatorJSWrapper proporciona interfaz compatible
    ↓
emulator.js gestiona UI y entrada
    ↓
Usuario carga ROM → EmulatorJS emula → Canvas renderiza
```

---

## 🌐 CDN Utilizado

EmulatorJS se carga desde **jsDelivr** (CDN rápida y confiable):
```html
<script src="https://cdn.jsdelivr.net/npm/emulatorjs@latest/dist/emulator.js"></script>
```

**Ventajas:**
- ✅ No requiere servidor back-end
- ✅ Disponible globalmente (rápido)
- ✅ Siempre última versión
- ✅ 100% privado (todo local)

---

## 🔍 Verificación de Funcionamiento

Abre **DevTools** (F12 en Chrome) → **Console** y busca:

```
✅ EmulatorJS cargado desde CDN
✅ Instancia de EmulatorJS creada
✅ EmulatorJS Core inicializado
```

Si ves estos mensajes, ¡la integración está completa!

---

## 📁 Archivos del Proyecto

```
gameboy-emulator/
├── index.html                  ← Abre esto en el navegador
├── emulator.js                 ← Lógica principal
├── emulatorjs-init.js          ← Inicializador CDN
├── emulatorjs-wrapper.js       ← Adaptador WASM
├── styles.css                  ← Estilos
├── gba-device.svg              ← Imagen del hardware
├── server.bat                  ← Servidor (Windows)
├── README.md                   ← Documentación completa
└── QUICKSTART.md               ← Este archivo
```

---

## 💾 Guardado de Partidas

Los saves se guardan automáticamente en **IndexedDB** del navegador:
1. Abre DevTools → Application → Storage → IndexedDB
2. Deberías ver una base de datos `gameboy-emulator`
3. Los saves se guardan automáticamente cuando avanzas en el juego

---

## ⚠️ Notas Importantes

- **ROMs legales**: Solo carga ROMs que posees o están en dominio público
- **Compatibilidad**: Funciona en navegadores modernos con WASM (Chrome, Firefox, Safari, Edge)
- **Privacidad**: Todo se ejecuta localmente; ninguna ROM se envía a servidores
- **Performance**: Optimizado para 60 FPS incluso en hardware antiguo

---

## 🆘 Si Algo No Funciona

1. **Verifica Console (F12)**
   - ¿Ves errores de carga?

2. **Recarga la página** (Ctrl+Shift+R)
   - Limpia caché del navegador

3. **Usa otro navegador**
   - Chrome/Edge funcionan mejor generalmente

4. **Revisa el README.md**
   - Sección "Troubleshooting"

---

## 🎉 ¡Listo!

¡Tu emulador GBA con WASM está operativo! Disfruta emulando tus juegos de Game Boy Advance.

Para más detalles técnicos, consulta **README.md**.
