import { Telegraf, Context } from "telegraf";
import { Movimentacao } from "../models/Movimentacao";
import { MovimentacaoService } from "../services/MovimentacaoService";
import { ContaPagarService } from "../services/ContaPagarService";

const CATEGORIAS_ENTRADA = ["salario", "extra"];
const CATEGORIAS_INVESTIMENTO = ["eliane", "joao", "ana", "outros"];

export function registrarComandosMovimentacoes(bot: Telegraf<Context>) {
  // Comando: /entrada
  bot.command("entrada", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);

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

    if (!CATEGORIAS_ENTRADA.includes(categoria)) {
      ctx.reply(
        `❌ Categoria inválida! Use: ${CATEGORIAS_ENTRADA.join(", ")}`
      );
      return;
    }

    const movimentacao: Movimentacao = {
      tipo: "entrada",
      valor,
      categoria,
      data: new Date().toLocaleString("pt-BR"),
    };

    await MovimentacaoService.salvar(movimentacao);
    ctx.reply(
      `✅ Entrada registrada!\n\n💰 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`
    );
  });

  // Comando: /despesa
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
    const categoria = args.slice(1).join(" ").toLowerCase();

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

    await MovimentacaoService.salvar(movimentacao);

    // Marca automaticamente a conta como paga
    const contaMarcada = await ContaPagarService.marcarComoPago(categoria);

    let mensagem = `✅ Despesa registrada!\n\n💸 R$ ${valor.toFixed(
      2
    )}\n📂 ${categoria}\n📅 ${movimentacao.data}`;

    if (contaMarcada) {
      mensagem += `\n\n✅ Conta marcada como paga!`;
    }

    ctx.reply(mensagem);
  });

  // Comando: /investimento
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

    if (!CATEGORIAS_INVESTIMENTO.includes(categoria)) {
      ctx.reply(
        `❌ Categoria inválida! Use: ${CATEGORIAS_INVESTIMENTO.join(", ")}`
      );
      return;
    }

    const movimentacao: Movimentacao = {
      tipo: "investimento",
      valor,
      categoria,
      data: new Date().toLocaleString("pt-BR"),
    };

    await MovimentacaoService.salvar(movimentacao);
    ctx.reply(
      `✅ Investimento registrado!\n\n💰 R$ ${valor.toFixed(2)}\n📂 ${categoria}\n📅 ${movimentacao.data}`
    );
  });
}
