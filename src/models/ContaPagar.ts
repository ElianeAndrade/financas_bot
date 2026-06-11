import mongoose from "mongoose";

export interface ContaPagar {
  nome: string;
  status: "pendente" | "pago";
  data_criacao: string;
  data_pagamento?: string;
}

const contaPagarSchema = new mongoose.Schema<ContaPagar>({
  nome: { type: String, required: true },
  status: { type: String, required: true, default: "pendente" },
  data_criacao: { type: String, required: true },
  data_pagamento: { type: String },
});

export const ContaPagarModel = mongoose.model<ContaPagar>(
  "ContaPagar",
  contaPagarSchema
);
