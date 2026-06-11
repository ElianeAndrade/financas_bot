import { ContaPagar, ContaPagarModel } from "../models/ContaPagar";

export class ContaPagarService {
  static async adicionar(nome: string): Promise<void> {
    const conta: ContaPagar = {
      nome,
      status: "pendente",
      data_criacao: new Date().toLocaleString("pt-BR"),
    };
    const novaConta = new ContaPagarModel(conta);
    await novaConta.save();
  }

  static async adicionarTemplate(): Promise<void> {
    const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude"];
    for (const conta of contasFixas) {
      await this.adicionar(conta);
    }
  }

  static async listar(): Promise<ContaPagar[]> {
    return await ContaPagarModel.find().sort({ data_criacao: 1 });
  }

  static async marcarComoPago(nome: string): Promise<boolean> {
    const conta = await ContaPagarModel.findOneAndUpdate(
      { nome: nome.toLowerCase() },
      {
        status: "pago",
        data_pagamento: new Date().toLocaleString("pt-BR"),
      }
    );
    return conta !== null;
  }

  static async limparPagas(): Promise<number> {
    const result = await ContaPagarModel.deleteMany({ status: "pago" });
    return result.deletedCount || 0;
  }

  static async resetarTodas(): Promise<number> {
    const result = await ContaPagarModel.deleteMany({});
    return result.deletedCount || 0;
  }

  static async existemContasPadrao(): Promise<boolean> {
    const contas = await this.listar();
    const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude"];
    return contasFixas.every((conta) => contas.some((c) => c.nome === conta));
  }
}
