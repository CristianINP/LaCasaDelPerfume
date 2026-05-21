$base = "http://localhost:3000"
$json = @{ "Content-Type" = "application/json" }

Write-Host "=== LOGIN ===" -ForegroundColor Cyan
$resp = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -Headers $json -Body '{"email":"carlos@test.com","password":"MiPassword123"}'
$token = $resp.token
Write-Host "Token: $token"

$auth = @{ Authorization = "Bearer $token" }

Write-Host ""
Write-Host "=== PERFIL ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/api/user/profile" -Headers $auth | ConvertTo-Json

Write-Host ""
Write-Host "=== HISTORIAL DE PEDIDOS ===" -ForegroundColor Cyan
$hist = Invoke-RestMethod -Uri "$base/api/user/history" -Headers $auth
if ($hist.Count -eq 0) {
    Write-Host "Sin pedidos aun" -ForegroundColor Yellow
} else {
    $hist | ConvertTo-Json
}

Write-Host ""
Write-Host "=== PRUEBA DE ERRORES ===" -ForegroundColor Cyan
Write-Host "Sin token (debe dar 401):"
try {
    Invoke-RestMethod -Uri "$base/api/user/profile"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "Token invalido (debe dar 403):"
try {
    Invoke-RestMethod -Uri "$base/api/user/profile" -Headers @{ Authorization = "Bearer token_falso" }
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
