package com.financeiro.model;

import com.financeiro.model.enums.TipoTransacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes")
public class Transacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 2, max = 200, message = "Descrição deve ter entre 2 e 200 caracteres")
    @Column(nullable = false, length = 200)
    private String descricao;
    
    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;
    
    @NotNull(message = "Data é obrigatória")
    @Column(nullable = false)
    private LocalDate data;
    
    @NotNull(message = "Tipo é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTransacao tipo;
    
    @NotNull(message = "Recorrente é obrigatório")
    @Column(nullable = false)
    private Boolean recorrente = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_id", nullable = false)
    private Conta conta;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartao_id")
    private Cartao cartao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    // Construtores
    public Transacao() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.recorrente = false;
    }
    
    public Transacao(String descricao, BigDecimal valor, LocalDate data, 
                     TipoTransacao tipo, Boolean recorrente, Conta conta, Usuario usuario) {
        this();
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.tipo = tipo;
        this.recorrente = recorrente;
        this.conta = conta;
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
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public BigDecimal getValor() {
        return valor;
    }
    
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
    
    public LocalDate getData() {
        return data;
    }
    
    public void setData(LocalDate data) {
        this.data = data;
    }
    
    public TipoTransacao getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoTransacao tipo) {
        this.tipo = tipo;
    }
    
    public Boolean getRecorrente() {
        return recorrente;
    }
    
    public void setRecorrente(Boolean recorrente) {
        this.recorrente = recorrente;
    }
    
    public Conta getConta() {
        return conta;
    }
    
    public void setConta(Conta conta) {
        this.conta = conta;
    }
    
    public Cartao getCartao() {
        return cartao;
    }
    
    public void setCartao(Cartao cartao) {
        this.cartao = cartao;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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
    public boolean isReceita() {
        return TipoTransacao.RECEITA.equals(this.tipo);
    }
    
    public boolean isDespesa() {
        return TipoTransacao.DESPESA.equals(this.tipo);
    }
    
    public boolean isTransacaoCartao() {
        return this.cartao != null;
    }
    
    @Override
    public String toString() {
        return "Transacao{" +
                "id=" + id +
                ", descricao='" + descricao + '\'' +
                ", valor=" + valor +
                ", data=" + data +
                ", tipo=" + tipo +
                ", recorrente=" + recorrente +
                ", dataCriacao=" + dataCriacao +
                '}';
    }
}