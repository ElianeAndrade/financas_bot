import mongoose from "mongoose";

export interface Movimentacao {
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

export const MovimentacaoModel = mongoose.model<Movimentacao>(
  "Movimentacao",
  movimentacaoSchema
);
