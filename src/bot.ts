import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { registrarComandosMovimentacoes } from "./commands/movimentacoes";
import { registrarComandosContas } from "./commands/contas";
import { registrarComandosUtilidades } from "./commands/utilidades";

dotenv.config();

// Inicializar bot
const bot = new Telegraf(process.env.BOT_TOKEN!);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI!);

// Comando: /start
bot.start((ctx) => {
  ctx.reply(`
💰 Olá, Eliane!

Bem-vinda de volta.

Comandos disponíveis:

📊 MOVIMENTAÇÕES:
/entrada 
/despesa 
/investimento 

💾 CONSULTAS:
/saldo
/resumo

📋 CONTAS DO MÊS:
/contas_template (criar lista padrão)
/contas_reset (limpar tudo)
/contas_add (adicionar extra)
/contas (listar contas)
/resumo_contas (resumo)
/contas_limpar (deletar só pagas)

🗑️ LIMPEZA:
/limpar_movimentacoes (reset saldo/resumo)
/limpar_tudo (limpa TUDO!)

Digite qualquer comando para mais detalhes.
`);
});

// Registrar comandos
registrarComandosMovimentacoes(bot);
registrarComandosContas(bot);
registrarComandosUtilidades(bot);

// Iniciar bot
bot.launch();

// Registrar comandos no menu do Telegram
bot.telegram.setMyCommands([
  { command: "start", description: "Mostra menu inicial" },
  { command: "entrada", description: "Registra entrada/receita" },
  { command: "despesa", description: "Registra despesa/pagamento" },
  { command: "investimento", description: "Registra investimento" },
  { command: "saldo", description: "Mostra saldo atual" },
  { command: "resumo", description: "Lista todas as movimentações" },
  { command: "contas_template", description: "Cria contas padrão do mês" },
  { command: "contas_add", description: "Adiciona nova conta" },
  { command: "contas", description: "Lista contas do mês" },
  { command: "resumo_contas", description: "Resumo de contas" },
  { command: "contas_limpar", description: "Remove contas pagas" },
  { command: "contas_reset", description: "Limpa todas as contas" },
  { command: "limpar_movimentacoes", description: "Apaga histórico de movimentações" },
  { command: "limpar_tudo", description: "Limpa TUDO (contas + movimentações)" },
]);

console.log("Bot iniciado");
