$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host "✅ Servidor HTTP iniciado en http://localhost:8080" -ForegroundColor Green
Write-Host "Abre tu navegador y ve a: http://localhost:8080/index.html"
Write-Host "(Presiona Ctrl+C para detener)"

$scriptPath = Get-Location

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        $filePath = Join-Path $scriptPath ($path.TrimStart('/'))
        
        if (Test-Path $filePath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
            Write-Host "[200] $path" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $response.Close()
            Write-Host "[404] $path" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}
$listener.Stop()
