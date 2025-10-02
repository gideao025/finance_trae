package com.financeiro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cartoes")
public class Cartao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome do cartão é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nomeDoCartao;
    
    @NotBlank(message = "Bandeira é obrigatória")
    @Size(min = 2, max = 50, message = "Bandeira deve ter entre 2 e 50 caracteres")
    @Column(nullable = false, length = 50)
    private String bandeira;
    
    @NotNull(message = "Limite total é obrigatório")
    @DecimalMin(value = "0.0", inclusive = false, message = "Limite total deve ser maior que zero")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal limiteTotal;
    
    @NotNull(message = "Dia de fechamento é obrigatório")
    @Min(value = 1, message = "Dia de fechamento deve ser entre 1 e 31")
    @Max(value = 31, message = "Dia de fechamento deve ser entre 1 e 31")
    @Column(nullable = false)
    private Integer diaDeFechamento;
    
    @NotNull(message = "Dia de vencimento é obrigatório")
    @Min(value = 1, message = "Dia de vencimento deve ser entre 1 e 31")
    @Max(value = 31, message = "Dia de vencimento deve ser entre 1 e 31")
    @Column(nullable = false)
    private Integer diaDeVencimento;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @OneToMany(mappedBy = "cartao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transacao> transacoes;
    
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    // Construtores
    public Cartao() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public Cartao(String nomeDoCartao, String bandeira, BigDecimal limiteTotal, 
                  Integer diaDeFechamento, Integer diaDeVencimento, Usuario usuario) {
        this();
        this.nomeDoCartao = nomeDoCartao;
        this.bandeira = bandeira;
        this.limiteTotal = limiteTotal;
        this.diaDeFechamento = diaDeFechamento;
        this.diaDeVencimento = diaDeVencimento;
        this.usuario = usuario;
    }
    
    // Métodos de ciclo de vida JPA
    @PreUpdate
    protected void onUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNomeDoCartao() {
        return nomeDoCartao;
    }
    
    public void setNomeDoCartao(String nomeDoCartao) {
        this.nomeDoCartao = nomeDoCartao;
    }
    
    public String getBandeira() {
        return bandeira;
    }
    
    public void setBandeira(String bandeira) {
        this.bandeira = bandeira;
    }
    
    public BigDecimal getLimiteTotal() {
        return limiteTotal;
    }
    
    public void setLimiteTotal(BigDecimal limiteTotal) {
        this.limiteTotal = limiteTotal;
    }
    
    public Integer getDiaDeFechamento() {
        return diaDeFechamento;
    }
    
    public void setDiaDeFechamento(Integer diaDeFechamento) {
        this.diaDeFechamento = diaDeFechamento;
    }
    
    public Integer getDiaDeVencimento() {
        return diaDeVencimento;
    }
    
    public void setDiaDeVencimento(Integer diaDeVencimento) {
        this.diaDeVencimento = diaDeVencimento;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public List<Transacao> getTransacoes() {
        return transacoes;
    }
    
    public void setTransacoes(List<Transacao> transacoes) {
        this.transacoes = transacoes;
    }
    
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    
    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    // Métodos de negócio
    public BigDecimal calcularLimiteUtilizado() {
        if (transacoes == null || transacoes.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return transacoes.stream()
                .map(Transacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal calcularLimiteDisponivel() {
        return limiteTotal.subtract(calcularLimiteUtilizado());
    }
    
    @Override
    public String toString() {
        return "Cartao{" +
                "id=" + id +
                ", nomeDoCartao='" + nomeDoCartao + '\'' +
                ", bandeira='" + bandeira + '\'' +
                ", limiteTotal=" + limiteTotal +
                ", diaDeFechamento=" + diaDeFechamento +
                ", diaDeVencimento=" + diaDeVencimento +
                ", dataCriacao=" + dataCriacao +
                '}';
    }
}