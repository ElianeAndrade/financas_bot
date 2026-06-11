import { Movimentacao, MovimentacaoModel } from "../models/Movimentacao";

export class MovimentacaoService {
  static async salvar(movimentacao: Movimentacao): Promise<void> {
    const novaMovimentacao = new MovimentacaoModel(movimentacao);
    await novaMovimentacao.save();
  }

  static async listar(): Promise<Movimentacao[]> {
    return await MovimentacaoModel.find();
  }

  static async limpar(): Promise<number> {
    const result = await MovimentacaoModel.deleteMany({});
    return result.deletedCount || 0;
  }

  static async calcularSaldo(): Promise<{
    entradas: number;
    despesas: number;
    investimentos: number;
    saldo: number;
  }> {
    const movimentacoes = await this.listar();

    let totalEntradas = 0;
    let totalDespesas = 0;
    let totalInvestimentos = 0;

    movimentacoes.forEach((m) => {
      if (m.tipo === "entrada") totalEntradas += m.valor;
      else if (m.tipo === "despesa") totalDespesas += m.valor;
      else if (m.tipo === "investimento") totalInvestimentos += m.valor;
    });

    const saldo = totalEntradas - totalDespesas - totalInvestimentos;

    return { entradas: totalEntradas, despesas: totalDespesas, investimentos: totalInvestimentos, saldo };
  }
}
