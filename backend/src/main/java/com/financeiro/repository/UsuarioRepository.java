package com.financeiro.repository;

import com.financeiro.model.Usuario;
import com.financeiro.model.enums.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Busca usuário por email (usado para autenticação)
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Busca usuário por email e ativo
     */
    Optional<Usuario> findByEmailAndAtivo(String email, Boolean ativo);
    
    /**
     * Verifica se existe um usuário com o email
     */
    boolean existsByEmail(String email);
    
    /**
     * Verifica se existe um usuário com o email, excluindo um usuário específico
     */
    boolean existsByEmailAndIdNot(String email, Long id);
    
    /**
     * Busca usuários por perfil
     */
    List<Usuario> findByPerfilOrderByNomeAsc(PerfilUsuario perfil);
    
    /**
     * Busca usuários ativos
     */
    List<Usuario> findByAtivoOrderByNomeAsc(Boolean ativo);
    
    /**
     * Busca usuários por nome (busca parcial)
     */
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%')) ORDER BY u.nome ASC")
    List<Usuario> buscarPorNomeParcial(@Param("nome") String nome);
    
    /**
     * Conta usuários por perfil
     */
    long countByPerfil(PerfilUsuario perfil);
    
    /**
     * Conta usuários ativos
     */
    long countByAtivo(Boolean ativo);
}