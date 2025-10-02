package com.financeiro.repository;

import com.financeiro.model.Cartao;
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
public interface CartaoRepository extends JpaRepository<Cartao, Long> {
    
    /**
     * Busca todos os cartões de um usuário específico
     */
    List<Cartao> findByUsuarioIdOrderByNomeDoCartaoAsc(Long usuarioId);
    
    /**
     * Busca cartões por usuário com paginação
     */
    Page<Cartao> findByUsuarioId(Long usuarioId, Pageable pageable);
    
    /**
     * Busca um cartão específico de um usuário
     */
    Optional<Cartao> findByIdAndUsuarioId(Long id, Long usuarioId);
    
    /**
     * Busca cartões por bandeira e usuário
     */
    List<Cartao> findByBandeiraContainingIgnoreCaseAndUsuarioIdOrderByNomeDoCartaoAsc(String bandeira, Long usuarioId);
    
    /**
     * Verifica se existe um cartão com o mesmo nome para o usuário
     */
    boolean existsByNomeDoCartaoIgnoreCaseAndUsuarioId(String nomeDoCartao, Long usuarioId);
    
    /**
     * Verifica se existe um cartão com o mesmo nome para o usuário, excluindo um cartão específico
     */
    boolean existsByNomeDoCartaoIgnoreCaseAndUsuarioIdAndIdNot(String nomeDoCartao, Long usuarioId, Long cartaoId);
    
    /**
     * Conta o número total de cartões de um usuário
     */
    long countByUsuarioId(Long usuarioId);
    
    /**
     * Calcula o limite total de todos os cartões de um usuário
     */
    @Query("SELECT COALESCE(SUM(c.limiteTotal), 0) FROM Cartao c WHERE c.usuario.id = :usuarioId")
    BigDecimal calcularLimiteTotalPorUsuario(@Param("usuarioId") Long usuarioId);
    
    /**
     * Busca cartões com limite maior que um valor específico
     */
    List<Cartao> findByUsuarioIdAndLimiteTotalGreaterThanOrderByNomeDoCartaoAsc(Long usuarioId, BigDecimal limite);
    
    /**
     * Busca cartões por nome (busca parcial) e usuário
     */
    @Query("SELECT c FROM Cartao c WHERE c.usuario.id = :usuarioId AND " +
           "LOWER(c.nomeDoCartao) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY c.nomeDoCartao ASC")
    List<Cartao> buscarPorNomeParcialEUsuario(@Param("nome") String nome, @Param("usuarioId") Long usuarioId);
    
    /**
     * Busca cartões por dia de fechamento
     */
    List<Cartao> findByUsuarioIdAndDiaDeFechamentoOrderByNomeDoCartaoAsc(Long usuarioId, Integer diaDeFechamento);
    
    /**
     * Busca cartões por dia de vencimento
     */
    List<Cartao> findByUsuarioIdAndDiaDeVencimentoOrderByNomeDoCartaoAsc(Long usuarioId, Integer diaDeVencimento);
}