@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 24 ou superior e necessario para a area administrativa.
  pause
  exit /b 1
)
where py >nul 2>&1
if errorlevel 1 (
  echo Python 3 e necessario para publicar historias.
  pause
  exit /b 1
)
if not exist "data\admin.json" (
  echo Primeiro acesso: crie a senha do administrador.
  node setup-admin.mjs
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Abra http://localhost:8000/admin/ no navegador.
echo Se a porta 8000 estiver ocupada, feche o servidor Python anterior com Ctrl+C.
node server.mjs
pause
