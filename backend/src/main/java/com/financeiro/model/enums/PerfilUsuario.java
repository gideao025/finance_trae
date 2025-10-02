package com.financeiro.model.enums;

public enum PerfilUsuario {
    ADMIN("Administrador"),
    USER("Usuário");
    
    private final String descricao;
    
    PerfilUsuario(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}