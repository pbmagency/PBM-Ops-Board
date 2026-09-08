@echo off
setlocal
set "PROJECT_DIR=%~dp0"
set "PORT=8000"
if not "%~1"=="" set "PORT=%~1"
"%PROJECT_DIR%.tools\php\php.exe" -c "%PROJECT_DIR%.tools\php\php.ini" -S 127.0.0.1:%PORT% -t "%PROJECT_DIR%public" "%PROJECT_DIR%public\server.php"
