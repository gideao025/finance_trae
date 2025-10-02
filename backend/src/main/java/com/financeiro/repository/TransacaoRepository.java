package com.financeiro.repository;

import com.financeiro.model.Transacao;
import com.financeiro.model.enums.TipoTransacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    
    /**
     * Busca todas as transações de um usuário específico
     */
    List<Transacao> findByUsuarioIdOrderByDataDescIdDesc(Long usuarioId);
    
    /**
     * Busca transações por usuário com paginação
     */
    Page<Transacao> findByUsuarioIdOrderByDataDescIdDesc(Long usuarioId, Pageable pageable);
    
    /**
     * Busca uma transação específica de um usuário
     */
    Optional<Transacao> findByIdAndUsuarioId(Long id, Long usuarioId);
    
    /**
     * Busca transações por conta
     */
    List<Transacao> findByContaIdOrderByDataDescIdDesc(Long contaId);
    
    /**
     * Busca transações por cartão
     */
    List<Transacao> findByCartaoIdOrderByDataDescIdDesc(Long cartaoId);
    
    /**
     * Busca transações por tipo e usuário
     */
    List<Transacao> findByTipoAndUsuarioIdOrderByDataDescIdDesc(TipoTransacao tipo, Long usuarioId);
    
    /**
     * Busca transações por período e usuário
     */
    List<Transacao> findByUsuarioIdAndDataBetweenOrderByDataDescIdDesc(Long usuarioId, LocalDate dataInicio, LocalDate dataFim);
    
    /**
     * Busca transações recorrentes de um usuário
     */
    List<Transacao> findByUsuarioIdAndRecorrenteOrderByDataDescIdDesc(Long usuarioId, Boolean recorrente);
    
    /**
     * Calcula o total de receitas de um usuário
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :usuarioId AND t.tipo = 'RECEITA'")
    BigDecimal calcularTotalReceitasPorUsuario(@Param("usuarioId") Long usuarioId);
    
    /**
     * Calcula o total de despesas de um usuário
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :usuarioId AND t.tipo = 'DESPESA'")
    BigDecimal calcularTotalDespesasPorUsuario(@Param("usuarioId") Long usuarioId);
    
    /**
     * Calcula o total de receitas de um usuário em um período
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :usuarioId " +
           "AND t.tipo = 'RECEITA' AND t.data BETWEEN :dataInicio AND :dataFim")
    BigDecimal calcularTotalReceitasPorPeriodo(@Param("usuarioId") Long usuarioId, 
                                               @Param("dataInicio") LocalDate dataInicio, 
                                               @Param("dataFim") LocalDate dataFim);
    
    /**
     * Calcula o total de despesas de um usuário em um período
     */
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :usuarioId " +
           "AND t.tipo = 'DESPESA' AND t.data BETWEEN :dataInicio AND :dataFim")
    BigDecimal calcularTotalDespesasPorPeriodo(@Param("usuarioId") Long usuarioId, 
                                               @Param("dataInicio") LocalDate dataInicio, 
                                               @Param("dataFim") LocalDate dataFim);
    
    /**
     * Busca as últimas N transações de um usuário
     */
    @Query("SELECT t FROM Transacao t WHERE t.usuario.id = :usuarioId ORDER BY t.data DESC, t.id DESC")
    List<Transacao> buscarUltimasTransacoes(@Param("usuarioId") Long usuarioId, Pageable pageable);
    
    /**
     * Busca transações por descrição (busca parcial) e usuário
     */
    @Query("SELECT t FROM Transacao t WHERE t.usuario.id = :usuarioId AND " +
           "LOWER(t.descricao) LIKE LOWER(CONCAT('%', :descricao, '%')) ORDER BY t.data DESC, t.id DESC")
    List<Transacao> buscarPorDescricaoParcialEUsuario(@Param("descricao") String descricao, @Param("usuarioId") Long usuarioId);
    
    /**
     * Conta transações por tipo e usuário
     */
    long countByTipoAndUsuarioId(TipoTransacao tipo, Long usuarioId);
    
    /**
     * Conta transações recorrentes de um usuário
     */
    long countByUsuarioIdAndRecorrente(Long usuarioId, Boolean recorrente);
}