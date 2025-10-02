package com.financeiro.repository;

import com.financeiro.model.Conta;
import com.financeiro.model.enums.TipoConta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Long> {
    
    /**
     * Busca todas as contas de um usuário específico
     */
    List<Conta> findByUsuarioIdOrderByNomeAsc(Long usuarioId);
    
    /**
     * Busca contas por usuário com paginação
     */
    Page<Conta> findByUsuarioId(Long usuarioId, Pageable pageable);
    
    /**
     * Busca uma conta específica de um usuário
     */
    Optional<Conta> findByIdAndUsuarioId(Long id, Long usuarioId);
    
    /**
     * Busca contas por tipo e usuário
     */
    List<Conta> findByTipoAndUsuarioIdOrderByNomeAsc(TipoConta tipo, Long usuarioId);
    
    /**
     * Busca contas por instituição e usuário
     */
    List<Conta> findByInstituicaoContainingIgnoreCaseAndUsuarioIdOrderByNomeAsc(String instituicao, Long usuarioId);
    
    /**
     * Verifica se existe uma conta com o mesmo nome para o usuário
     */
    boolean existsByNomeIgnoreCaseAndUsuarioId(String nome, Long usuarioId);
    
    /**
     * Verifica se existe uma conta com o mesmo nome para o usuário, excluindo uma conta específica
     */
    boolean existsByNomeIgnoreCaseAndUsuarioIdAndIdNot(String nome, Long usuarioId, Long contaId);
    
    /**
     * Conta o número total de contas de um usuário
     */
    long countByUsuarioId(Long usuarioId);
    
    /**
     * Calcula o saldo total inicial de todas as contas de um usuário
     */
    @Query("SELECT COALESCE(SUM(c.saldoInicial), 0) FROM Conta c WHERE c.usuario.id = :usuarioId")
    BigDecimal calcularSaldoTotalInicialPorUsuario(@Param("usuarioId") Long usuarioId);
    
    /**
     * Busca contas com saldo inicial maior que um valor específico
     */
    List<Conta> findByUsuarioIdAndSaldoInicialGreaterThanOrderByNomeAsc(Long usuarioId, BigDecimal valor);
    
    /**
     * Busca contas por nome (busca parcial) e usuário
     */
    @Query("SELECT c FROM Conta c WHERE c.usuario.id = :usuarioId AND " +
           "LOWER(c.nome) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY c.nome ASC")
    List<Conta> buscarPorNomeParcialEUsuario(@Param("nome") String nome, @Param("usuarioId") Long usuarioId);
    
    /**
     * Busca contas ativas (que possuem transações) de um usuário
     */
    @Query("SELECT DISTINCT c FROM Conta c JOIN c.transacoes t WHERE c.usuario.id = :usuarioId ORDER BY c.nome ASC")
    List<Conta> buscarContasAtivasPorUsuario(@Param("usuarioId") Long usuarioId);
    
    /**
     * Busca contas sem transações de um usuário
     */
    @Query("SELECT c FROM Conta c WHERE c.usuario.id = :usuarioId AND " +
           "NOT EXISTS (SELECT 1 FROM Transacao t WHERE t.conta = c) ORDER BY c.nome ASC")
    List<Conta> buscarContasSemTransacoesPorUsuario(@Param("usuarioId") Long usuarioId);
}