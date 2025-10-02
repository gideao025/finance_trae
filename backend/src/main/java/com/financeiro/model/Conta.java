package com.financeiro.model;

import com.financeiro.model.enums.TipoConta;
import com.financeiro.model.enums.TipoTransacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contas")
public class Conta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome da conta é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;
    
    @NotNull(message = "Tipo da conta é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoConta tipo;
    
    @NotNull(message = "Saldo inicial é obrigatório")
    @DecimalMin(value = "0.0", inclusive = true, message = "Saldo inicial deve ser maior ou igual a zero")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoInicial;
    
    @NotBlank(message = "Instituição é obrigatória")
    @Size(min = 2, max = 100, message = "Instituição deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String instituicao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @OneToMany(mappedBy = "conta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transacao> transacoes;
    
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    // Construtores
    public Conta() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public Conta(String nome, TipoConta tipo, BigDecimal saldoInicial, String instituicao, Usuario usuario) {
        this();
        this.nome = nome;
        this.tipo = tipo;
        this.saldoInicial = saldoInicial;
        this.instituicao = instituicao;
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
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public TipoConta getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoConta tipo) {
        this.tipo = tipo;
    }
    
    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }
    
    public void setSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = saldoInicial;
    }
    
    public String getInstituicao() {
        return instituicao;
    }
    
    public void setInstituicao(String instituicao) {
        this.instituicao = instituicao;
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
    public BigDecimal calcularSaldoAtual() {
        if (transacoes == null || transacoes.isEmpty()) {
            return saldoInicial;
        }
        
        BigDecimal saldoCalculado = saldoInicial;
        for (Transacao transacao : transacoes) {
            if (transacao.getTipo() == TipoTransacao.RECEITA) {
                saldoCalculado = saldoCalculado.add(transacao.getValor());
            } else {
                saldoCalculado = saldoCalculado.subtract(transacao.getValor());
            }
        }
        return saldoCalculado;
    }
    
    @Override
    public String toString() {
        return "Conta{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", tipo=" + tipo +
                ", saldoInicial=" + saldoInicial +
                ", instituicao='" + instituicao + '\'' +
                ", dataCriacao=" + dataCriacao +
                '}';
    }
}