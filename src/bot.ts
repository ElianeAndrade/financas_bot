import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI!);

// Schema e modelo
interface Movimentacao {
  tipo: "entrada" | "despesa" | "investimento";
  valor: number;
  categoria: string;
  data: string;
}

const movimentacaoSchema = new mongoose.Schema<Movimentacao>({
  tipo: { type: String, required: true },
  valor: { type: Number, required: true },
  categoria: { type: String, required: true },
  data: { type: String, required: true },
});

const MovimentacaoModel = mongoose.model<Movimentacao>("Movimentacao", movimentacaoSchema);

// Funções auxiliares
async function salvarMovimentacao(movimentacao: Movimentacao) {
  const novaMovimentacao = new MovimentacaoModel(movimentacao);
  await novaMovimentacao.save();
}

async function lerMovimentacoes(): Promise<Movimentacao[]> {
  return await MovimentacaoModel.find();
}

bot.start((ctx) => {
    ctx.reply(`
💰 Olá, Eliane!

Bem-vinda de volta.

Comandos disponíveis:

/entrada 
/despesa 
/investimento 

/saldo
/resumo

Digite qualquer comando para mais detalhes.
`);
});


bot.command("entrada", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  
  // Se não tiver argumentos, mostra instruções
  if (args.length === 0) {
    ctx.reply(`
📈 Entradas
Use:
/entrada valor categoria

Categorias:
• salario
• extra
`);
    return;
  }
  
  // Se tiver argumentos, processa a entrada
  if (args.length < 2) {
    ctx.reply("❌ Formato inválido! Use: /entrada valor categoria");
    return;
  }
  
  const valor = parseFloat(args[0].replace(",", "."));
  const categoria = args[1].toLowerCase();
  
  if (isNaN(valor)) {
    ctx.reply("❌ Valor inválido! Use um número.");
    return;
  }
  
  const categoriasValidas = ["salario", "extra"];
  if (!categoriasValidas.includes(categoria)) {
    ctx.reply(`❌ Categoria inválida! Use: ${categoriasValidas.join(", ")}`);
    return;
  }
  
  const movimentacao: Movimentacao = {
    tipo: "entrada",
    valor,
    categoria,
    data: new Date().toLocaleString("pt-BR"),
  };
  
  await salvarMovimentacao(movimentacao);
  ctx.reply(`✅ Entrada registrada!\n\n💰 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`);
});



bot.command("despesa", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  
  if (args.length === 0) {
    ctx.reply(`
📉 Despesas
Use:
/despesa valor categoria
Categorias:
• plano_saude
• nubank
• van_joao
• diarista
• extras
`);
    return;
  }
  
  if (args.length < 2) {
    ctx.reply("❌ Formato inválido! Use: /despesa valor categoria");
    return;
  }
  
  const valor = parseFloat(args[0].replace(",", "."));
  const categoria = args[1].toLowerCase();
  
  if (isNaN(valor)) {
    ctx.reply("❌ Valor inválido! Use um número.");
    return;
  }
  
  const categoriasValidas = ["plano_saude", "nubank", "van_joao", "diarista", "extras"];
  if (!categoriasValidas.includes(categoria)) {
    ctx.reply(`❌ Categoria inválida! Use: ${categoriasValidas.join(", ")}`);
    return;
  }
  
  const movimentacao: Movimentacao = {
    tipo: "despesa",
    valor,
    categoria,
    data: new Date().toLocaleString("pt-BR"),
  };
  
  await salvarMovimentacao(movimentacao);
  ctx.reply(`✅ Despesa registrada!\n\n💸 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`);
});


bot.command("investimento", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  
  if (args.length === 0) {
    ctx.reply(`
💸 Investimentos
Use:
/investimento valor categoria
Categorias:
• eliane
• joao
• ana
• outros
`);
    return;
  }
  
  if (args.length < 2) {
    ctx.reply("❌ Formato inválido! Use: /investimento valor categoria");
    return;
  }
  
  const valor = parseFloat(args[0].replace(",", "."));
  const categoria = args[1].toLowerCase();
  
  if (isNaN(valor)) {
    ctx.reply("❌ Valor inválido! Use um número.");
    return;
  }
  
  const categoriasValidas = ["eliane", "joao", "ana", "outros"];
  if (!categoriasValidas.includes(categoria)) {
    ctx.reply(`❌ Categoria inválida! Use: ${categoriasValidas.join(", ")}`);
    return;
  }
  
  const movimentacao: Movimentacao = {
    tipo: "investimento",
    valor,
    categoria,
    data: new Date().toLocaleString("pt-BR"),
  };
  
  await salvarMovimentacao(movimentacao);
  ctx.reply(`✅ Investimento registrado!\n\n💰 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`);
});

bot.command("saldo", async (ctx) => {
  const movimentacoes = await lerMovimentacoes();
  
  let totalEntradas = 0;
  let totalDespesas = 0;
  let totalInvestimentos = 0;
  
  movimentacoes.forEach((m) => {
    if (m.tipo === "entrada") totalEntradas += m.valor;
    else if (m.tipo === "despesa") totalDespesas += m.valor;
    else if (m.tipo === "investimento") totalInvestimentos += m.valor;
  });
  
  const saldo = totalEntradas - totalDespesas - totalInvestimentos;
  
  ctx.reply(`
💰 SALDO

📈 Entradas: R$ ${totalEntradas.toFixed(2)}
📉 Despesas: R$ ${totalDespesas.toFixed(2)}
💸 Investimentos: R$ ${totalInvestimentos.toFixed(2)}

💵 Saldo: R$ ${saldo.toFixed(2)}
`);
});

bot.command("resumo", async (ctx) => {
  const movimentacoes = await lerMovimentacoes();
  
  if (movimentacoes.length === 0) {
    ctx.reply("📋 Nenhuma movimentação registrada ainda.");
    return;
  }
  
  let resumo = "📋 RESUMO DE MOVIMENTAÇÕES\n\n";
  
  movimentacoes.forEach((m) => {
    const emoji = m.tipo === "entrada" ? "📈" : m.tipo === "despesa" ? "📉" : "💸";
    resumo += `${emoji} ${m.tipo.toUpperCase()}: R$ ${m.valor.toFixed(2)} (${m.categoria})\n   ${m.data}\n\n`;
  });
  
  ctx.reply(resumo);
});

bot.launch();

console.log("Bot iniciado");