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
    const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude", "mercado"];
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

  static async deletarConta(nome: string): Promise<{ sucesso: boolean; motivo?: string }> {
    const nomeLower = nome.toLowerCase();
    
    // Tenta achar uma conta PENDENTE com esse nome
    const contaPendente = await ContaPagarModel.findOne({ 
      nome: nomeLower,
      status: "pendente"
    });
    
    if (contaPendente) {
      // Encontrou uma pendente, deleta ela
      await ContaPagarModel.deleteOne({ _id: contaPendente._id });
      return { sucesso: true };
    }
    
    // Se não encontrou pendente, tenta achar uma PAGA
    const contaPaga = await ContaPagarModel.findOne({ 
      nome: nomeLower,
      status: "pago"
    });
    
    if (contaPaga) {
      // Encontrou uma paga, não pode deletar
      return { sucesso: false, motivo: "já foi paga (histórico)" };
    }
    
    // Não encontrou nenhuma
    return { sucesso: false, motivo: "não encontrada" };
  }

  static async existemContasPadrao(): Promise<boolean> {
    const contas = await this.listar();
    const contasFixas = ["nubank", "diarista", "van_joao", "plano_saude", "mercado"];
    return contasFixas.every((conta) => contas.some((c) => c.nome === conta));
  }
}
