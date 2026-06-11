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

interface ContaPagar {
  nome: string;
  status: "pendente" | "pago";
  data_criacao: string;
  data_pagamento?: string;
}

const movimentacaoSchema = new mongoose.Schema<Movimentacao>({
  tipo: { type: String, required: true },
  valor: { type: Number, required: true },
  categoria: { type: String, required: true },
  data: { type: String, required: true },
});

const contaPagarSchema = new mongoose.Schema<ContaPagar>({
  nome: { type: String, required: true },
  status: { type: String, required: true, default: "pendente" },
  data_criacao: { type: String, required: true },
  data_pagamento: { type: String },
});

const MovimentacaoModel = mongoose.model<Movimentacao>("Movimentacao", movimentacaoSchema);
const ContaPagarModel = mongoose.model<ContaPagar>("ContaPagar", contaPagarSchema);

// Funções auxiliares
async function salvarMovimentacao(movimentacao: Movimentacao) {
  const novaMovimentacao = new MovimentacaoModel(movimentacao);
  await novaMovimentacao.save();
}

async function lerMovimentacoes(): Promise<Movimentacao[]> {
  return await MovimentacaoModel.find();
}

async function limparMovimentacoes(): Promise<number> {
  const result = await MovimentacaoModel.deleteMany({});
  return result.deletedCount || 0;
}

// Funções para contas a pagar
async function adicionarConta(nome: string) {
  const conta: ContaPagar = {
    nome,
    status: "pendente",
    data_criacao: new Date().toLocaleString("pt-BR"),
  };
  const novaConta = new ContaPagarModel(conta);
  await novaConta.save();
}

async function adicionarContasTemplate() {
  const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude", "mercado"];
  for (const conta of contasFixas) {
    await adicionarConta(conta);
  }
}

async function listarContas(): Promise<ContaPagar[]> {
  return await ContaPagarModel.find().sort({ data_criacao: 1 });
}

async function marcarComoPago(nome: string): Promise<boolean> {
  const conta = await ContaPagarModel.findOneAndUpdate(
    { nome: nome.toLowerCase() },
    {
      status: "pago",
      data_pagamento: new Date().toLocaleString("pt-BR"),
    }
  );
  return conta !== null;
}

async function limparContas(): Promise<number> {
  const result = await ContaPagarModel.deleteMany({ status: "pago" });
  return result.deletedCount || 0;
}

async function resetarTodasContas(): Promise<number> {
  const result = await ContaPagarModel.deleteMany({});
  return result.deletedCount || 0;
}

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
📉 Despesas (Pagamento de Contas)
Use:
/despesa valor categoria

Categorias padrão:
• plano_saude
• nubank
• van_joao
• diarista
• extras

Ou use o nome de qualquer conta criada com /contas_add

Ao registrar, a conta é automaticamente marcada como paga! ✅
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
  
  const movimentacao: Movimentacao = {
    tipo: "despesa",
    valor,
    categoria,
    data: new Date().toLocaleString("pt-BR"),
  };
  
  await salvarMovimentacao(movimentacao);
  
  // Marca automaticamente a conta como paga
  const contaMarcada = await marcarComoPago(categoria);
  
  let mensagem = `✅ Despesa registrada!\n\n💸 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`;
  
  if (contaMarcada) {
    mensagem += `\n\n✅ Conta marcada como paga!`;
  }
  
  ctx.reply(mensagem);
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

// Comandos de contas a pagar
bot.command("contas_add", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  
  if (args.length === 0) {
    ctx.reply(`
📝 Adicionar Conta
Use:
/contas_add nome_da_conta
`);
    return;
  }
  
  const nomeConta = args.join(" ").toLowerCase();
  await adicionarConta(nomeConta);
  ctx.reply(`✅ Conta adicionada: ${nomeConta}\n⏳ Status: Pendente`);
});

bot.command("contas_template", async (ctx) => {
  const contas = await listarContas();
  const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude"];
  
  // Verifica se as contas padrão já existem
  const jaExistem = contasFixas.every(conta => 
    contas.some(c => c.nome === conta)
  );
  
  if (jaExistem) {
    ctx.reply(`⚠️ Contas padrão já foram criadas!\n\nUse /limpar_tudo se quiser recomeçar do zero.`);
    return;
  }
  
  await adicionarContasTemplate();
  ctx.reply(`✅ Contas padrão adicionadas!\n\n• nubank\n• diarista\n• van_joao\n• plano_saude\n\nAgora adicione extras com /contas_add`);
});

bot.command("contas_reset", async (ctx) => {
  const deletadas = await resetarTodasContas();
  ctx.reply(`✅ ${deletadas} conta(s) deletada(s)!\n\nUse /contas_template pra começar um novo mês.`);
});

bot.command("contas", async (ctx) => {
  const contas = await listarContas();
  
  if (contas.length === 0) {
    ctx.reply("📋 Nenhuma conta adicionada ainda.");
    return;
  }
  
  let mensagem = "📋 CONTAS DO MÊS\n\n";
  
  contas.forEach((conta) => {
    const emoji = conta.status === "pago" ? "✅" : "⏳";
    mensagem += `${emoji} ${conta.nome}\n`;
  });
  
  const pendentes = contas.filter((c) => c.status === "pendente").length;
  const pagas = contas.filter((c) => c.status === "pago").length;
  
  mensagem += `\n📊 ${pagas} pagas / ${pendentes} pendentes`;
  
  ctx.reply(mensagem);
});

bot.command("contas_limpar", async (ctx) => {
  const deletadas = await limparContas();
  ctx.reply(`✅ ${deletadas} conta(s) paga(s) removida(s).\n\n🎉 Pronto pro próximo mês!`);
});

bot.command("resumo_contas", async (ctx) => {
  const contas = await listarContas();
  
  if (contas.length === 0) {
    ctx.reply("📋 Nenhuma conta adicionada ainda.");
    return;
  }
  
  let resumo = "📊 RESUMO DAS CONTAS\n\n";
  
  const pendentes = contas.filter((c) => c.status === "pendente");
  const pagas = contas.filter((c) => c.status === "pago");
  
  if (pagas.length > 0) {
    resumo += "✅ PAGAS:\n";
    pagas.forEach((conta) => {
      resumo += `  • ${conta.nome}\n`;
    });
    resumo += "\n";
  }
  
  if (pendentes.length > 0) {
    resumo += "⏳ PENDENTES:\n";
    pendentes.forEach((conta) => {
      resumo += `  • ${conta.nome}\n`;
    });
  }
  
  ctx.reply(resumo);
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

bot.command("limpar_movimentacoes", async (ctx) => {
  const deletadas = await limparMovimentacoes();
  ctx.reply(`✅ ${deletadas} movimentação(ões) deletada(s)!\n\n💰 Saldo e resumo foram zerados.`);
});

bot.command("limpar_tudo", async (ctx) => {
  const movimentacoes = await limparMovimentacoes();
  const contas = await resetarTodasContas();
  
  ctx.reply(`✅ TUDO LIMPO!\n\n🗑️ ${movimentacoes} movimentação(ões) deletada(s)\n📋 ${contas} conta(s) deletada(s)\n\n🔄 Pronto pra começar do zero!`);
});

bot.launch();

// Registra os comandos do bot no Telegram
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