@echo off
cd /d C:\Users\elianeandrade\Documents\financas_bot

echo.
echo ========================================
echo   Configurando o sistema...
echo ========================================
echo.

REM Desativa suspensão do PC mas deixa tela desligar
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 10

echo.
echo ========================================
echo   Iniciando Financas Bot
echo ========================================
echo.

npm run dev

REM Restaura configurações ao fechar
powercfg /change standby-timeout-ac 10
powercfg /change monitor-timeout-ac 10
pause
