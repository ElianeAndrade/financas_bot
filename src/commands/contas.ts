import { Telegraf, Context } from "telegraf";
import { ContaPagarService } from "../services/ContaPagarService";

export function registrarComandosContas(bot: Telegraf<Context>) {
  // Comando: /contas_add
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
    await ContaPagarService.adicionar(nomeConta);
    ctx.reply(`✅ Conta adicionada: ${nomeConta}\n⏳ Status: Pendente`);
  });

  // Comando: /contas_template
  bot.command("contas_template", async (ctx) => {
    const jaExistem = await ContaPagarService.existemContasPadrao();

    if (jaExistem) {
      ctx.reply(
        `⚠️ Contas padrão já foram criadas!\n\nUse /limpar_tudo se quiser recomeçar do zero.`
      );
      return;
    }

    await ContaPagarService.adicionarTemplate();
    ctx.reply(`✅ Contas padrão adicionadas!\n\n• nubank\n• diarista\n• van_joao\n• plano_saude\n\nAgora adicione extras com /contas_add`);
  });

  // Comando: /contas_reset
  bot.command("contas_reset", async (ctx) => {
    const deletadas = await ContaPagarService.resetarTodas();
    ctx.reply(
      `✅ ${deletadas} conta(s) deletada(s)!\n\nUse /contas_template pra começar um novo mês.`
    );
  });

  // Comando: /contas
  bot.command("contas", async (ctx) => {
    const contas = await ContaPagarService.listar();

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

  // Comando: /contas_limpar
  bot.command("contas_limpar", async (ctx) => {
    const deletadas = await ContaPagarService.limparPagas();
    ctx.reply(
      `✅ ${deletadas} conta(s) paga(s) removida(s).\n\n🎉 Pronto pro próximo mês!`
    );
  });

  // Comando: /contas_delete
  bot.command("contas_delete", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);

    if (args.length === 0) {
      ctx.reply(`
🗑️ Deletar Conta
Use:
/contas_delete nome_da_conta
`);
      return;
    }

    const nomeConta = args.join(" ").toLowerCase();
    const resultado = await ContaPagarService.deletarConta(nomeConta);

    if (resultado.sucesso) {
      ctx.reply(`✅ Conta deletada: ${nomeConta}`);
    } else {
      ctx.reply(`❌ Não foi possível deletar: ${nomeConta}\n\nMotivo: ${resultado.motivo}`);
    }
  });

  // Comando: /resumo_contas
  bot.command("resumo_contas", async (ctx) => {
    const contas = await ContaPagarService.listar();

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
}
