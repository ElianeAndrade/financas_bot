# 🤖 Como Rodar o Bot Localmente


### 1. Abra o PowerShell na pasta do projeto
```powershell
cd C:\Users\elianeandrade\Documents\financas_bot
```

### 2. Inicie o bot
```powershell
npm run dev
```

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
- `/conta_add` - adiciona conta nova
- `/contas` - Ver contas adicionadas (pagas e pendentes)

## Exemplos

```
/entrada 1000 salario
/despesa 50 extras
/saldo
/conta_add 100 mercado
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
