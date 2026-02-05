# Solución: Errores de CORS y Archivos Faltantes

## ✅ Lo que ya se ha hecho:

1. **Archivos minificados descargados**: Se descargaron `emulator.min.js` y `emulator.min.css` desde el CDN oficial
   - ✅ Ubicación: `data/emulator.min.js` y `data/emulator.min.css`

2. **Parche aplicado a emulator.js**: Se aplicaron todos los cambios solicitados del parche diff

## ❌ Problema Actual:

Los errores de CORS se deben a que estás abriendo los archivos usando el protocolo `file://`, que no permite solicitudes AJAX en navegadores modernos por razones de seguridad.

**Ejemplo del error:**
```
Access to fetch at 'file:///D:/Proyectos%20de%20VScode/gameboy-emulator/data/localization/es.json' 
from origin 'null' has been blocked by CORS policy
```

## ✅ Soluciones (elige una):

### Opción 1: Usar Live Server en VS Code (RECOMENDADO - MÁS FÁCIL)

1. Abre las extensiones en VS Code (`Ctrl+Shift+X`)
2. Busca "Live Server" (por Ritwick Dey)
3. Instala la extensión
4. Haz clic derecho en `index.html` → "Open with Live Server"
5. Se abrirá automáticamente en `http://localhost:5500`

### Opción 2: Usar Node.js (si procede)

Si tienes Node.js instalado:

```bash
cd d:\Proyectos de VScode\gameboy-emulator
npx http-server -p 8080 -c-1
```

Luego abre: `http://localhost:8080`

### Opción 3: Instalar Node.js

1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS
3. Ejecuta los comandos de la Opción 2

### Opción 4: Script PowerShell personalizado

Si no tienes Node.js, crea un archivo `start-server.ps1` con:

```powershell
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "✅ Servidor en http://localhost:$port" -ForegroundColor Green

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        $filePath = Join-Path (Get-Location) ($path.TrimStart('/'))
        
        if (Test-Path $filePath) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.OutputStream.Close()
    } catch { }
}
```

Ejecuta con:
```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

## 📋 Pasos a seguir:

1. **Elige una opción** de las anteriores (Opción 1 es la más simple)
2. **Abre la aplicación** en tu navegador usando `http://` en lugar de `file://`
3. **Carga un ROM** de Game Boy Advance (.gba)
4. ¡Disfruta! 🎮

## 🔗 Enlaces útiles:

- Live Server Extension: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
- Node.js: https://nodejs.org/
- EmulatorJS: https://www.emulatorjs.org/

## 📝 Nota sobre los cores:

Los cores necesarios se descargarán automáticamente desde el CDN cuando sea necesario. Si necesitas descargarlos manualmente:
- GBA Core: https://cdn.emulatorjs.org/latest/data/cores/mgba.zip
- Extrae en: `data/cores/`

---

**Resumen técnico:**
- CORS bloqueado → Necesita servidor HTTP
- Archivos minificados faltantes → ✅ Ya descargados
- Funcionalidades → ✅ Parche aplicado correctamente
