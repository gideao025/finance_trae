package com.financeiro.model.enums;

public enum TipoConta {
    CORRENTE("Conta Corrente"),
    POUPANCA("Conta Poupança"),
    INVESTIMENTO("Conta de Investimento");
    
    private final String descricao;
    
    TipoConta(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}