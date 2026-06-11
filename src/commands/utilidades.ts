import { Telegraf, Context } from "telegraf";
import { MovimentacaoService } from "../services/MovimentacaoService";
import { ContaPagarService } from "../services/ContaPagarService";

export function registrarComandosUtilidades(bot: Telegraf<Context>) {
  // Comando: /saldo
  bot.command("saldo", async (ctx) => {
    const { entradas, despesas, investimentos, saldo } =
      await MovimentacaoService.calcularSaldo();

    ctx.reply(`
💰 SALDO

📈 Entradas: R$ ${entradas.toFixed(2)}
📉 Despesas: R$ ${despesas.toFixed(2)}
💸 Investimentos: R$ ${investimentos.toFixed(2)}

💵 Saldo: R$ ${saldo.toFixed(2)}
`);
  });

  // Comando: /resumo
  bot.command("resumo", async (ctx) => {
    const movimentacoes = await MovimentacaoService.listar();

    if (movimentacoes.length === 0) {
      ctx.reply("📋 Nenhuma movimentação registrada ainda.");
      return;
    }

    let resumo = "📋 RESUMO DE MOVIMENTAÇÕES\n\n";

    movimentacoes.forEach((m) => {
      const emoji =
        m.tipo === "entrada" ? "📈" : m.tipo === "despesa" ? "📉" : "💸";
      resumo += `${emoji} ${m.tipo.toUpperCase()}: R$ ${m.valor.toFixed(
        2
      )} (${m.categoria})\n   ${m.data}\n\n`;
    });

    ctx.reply(resumo);
  });

  // Comando: /limpar_movimentacoes
  bot.command("limpar_movimentacoes", async (ctx) => {
    const deletadas = await MovimentacaoService.limpar();
    ctx.reply(
      `✅ ${deletadas} movimentação(ões) deletada(s)!\n\n💰 Saldo e resumo foram zerados.`
    );
  });

  // Comando: /limpar_tudo
  bot.command("limpar_tudo", async (ctx) => {
    const movimentacoes = await MovimentacaoService.limpar();
    const contas = await ContaPagarService.resetarTodas();

    ctx.reply(
      `✅ TUDO LIMPO!\n\n🗑️ ${movimentacoes} movimentação(ões) deletada(s)\n📋 ${contas} conta(s) deletada(s)\n\n🔄 Pronto pra começar do zero!`
    );
  });
}
