# 🤖 Como Rodar o Bot Localmente

## Quick Start (Forma Rápida)

### 1. Abra o PowerShell na pasta do projeto
```powershell
cd C:\Users\elianeandrade\Documents\financas_bot
```

### 2. Inicie o bot
```powershell
npm run dev
```

Pronto! O bot estará rodando. 

## O que você verá
```
Bot iniciado
```

## Comandos disponíveis no Telegram

- `/start` - Menu inicial
- `/entrada valor categoria` - Registrar entrada
- `/despesa valor categoria` - Registrar despesa
- `/investimento valor categoria` - Registrar investimento
- `/saldo` - Ver saldo
- `/resumo` - Ver todas as movimentações

## Exemplos

```
/entrada 1000 salario
/despesa 50 extras
/investimento 200 eliane
/saldo
/resumo
```

## ⚠️ Importante

- O bot só funciona quando o PowerShell estiver rodando
- Se fechar o PowerShell, o bot para
- Para parar o bot, aperte `CTRL+C` no PowerShell

## Dados

- As transações são salvas no MongoDB Atlas
- Você consegue consultar no MongoDB também: https://cloud.mongodb.com

---

**Quando seu notebook tiver ligado e o PowerShell rodando, você consegue usar o bot pelo Telegram a qualquer hora! 📱**
