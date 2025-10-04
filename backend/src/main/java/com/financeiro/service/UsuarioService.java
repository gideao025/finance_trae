package com.financeiro.service;

import com.financeiro.model.Usuario;
import com.financeiro.model.enums.PerfilUsuario;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Cria um novo usuário
     */
    public Usuario criarUsuario(Usuario usuario) {
        // Validar se o email já existe
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Email já está em uso");
        }
        
        // Criptografar a senha
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        
        // Definir perfil padrão se não especificado
        if (usuario.getPerfil() == null) {
            usuario.setPerfil(PerfilUsuario.USER);
        }
        
        // Definir como ativo por padrão
        usuario.setAtivo(true);
        
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Atualiza um usuário existente
     */
    public Usuario atualizarUsuario(Long usuarioId, Usuario usuarioAtualizado) {
        Usuario usuario = buscarUsuarioPorId(usuarioId);
        
        // Validar se o email já existe (excluindo o usuário atual)
        if (!usuario.getEmail().equals(usuarioAtualizado.getEmail()) && 
            usuarioRepository.existsByEmail(usuarioAtualizado.getEmail())) {
            throw new RuntimeException("Email já está em uso");
        }
        
        usuario.setNome(usuarioAtualizado.getNome());
        usuario.setEmail(usuarioAtualizado.getEmail());
        
        // Atualizar senha apenas se fornecida
        if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
        }
        
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Busca um usuário por ID
     */
    @Transactional(readOnly = true)
    public Usuario buscarUsuarioPorId(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
    
    /**
     * Busca um usuário por email
     */
    @Transactional(readOnly = true)
    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    /**
     * Lista todos os usuários ativos
     */
    @Transactional(readOnly = true)
    public List<Usuario> listarUsuariosAtivos() {
        return usuarioRepository.findByAtivoOrderByNomeAsc(true);
    }
    
    /**
     * Lista usuários por perfil
     */
    @Transactional(readOnly = true)
    public List<Usuario> listarUsuariosPorPerfil(PerfilUsuario perfil) {
        return usuarioRepository.findByPerfilOrderByNomeAsc(perfil);
    }
    
    /**
     * Busca usuários por nome parcial
     */
    @Transactional(readOnly = true)
    public List<Usuario> buscarUsuariosPorNome(String nome) {
        return usuarioRepository.buscarPorNomeParcial(nome);
    }
    
    /**
     * Ativa ou desativa um usuário
     */
    public Usuario alterarStatusUsuario(Long usuarioId, boolean ativo) {
        Usuario usuario = buscarUsuarioPorId(usuarioId);
        usuario.setAtivo(ativo);
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Altera o perfil de um usuário
     */
    public Usuario alterarPerfilUsuario(Long usuarioId, PerfilUsuario novoPerfil) {
        Usuario usuario = buscarUsuarioPorId(usuarioId);
        usuario.setPerfil(novoPerfil);
        return usuarioRepository.save(usuario);
    }
    
    /**
     * Altera a senha do usuário
     */
    public void alterarSenha(Long usuarioId, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarUsuarioPorId(usuarioId);
        
        // Verificar se a senha atual está correta
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }
        
        // Atualizar com a nova senha
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
    
    /**
     * Exclui um usuário (soft delete - apenas desativa)
     */
    public void excluirUsuario(Long usuarioId) {
        Usuario usuario = buscarUsuarioPorId(usuarioId);
        
        // Verificar se o usuário possui dados relacionados
        if (usuario.getContas() != null && !usuario.getContas().isEmpty()) {
            throw new RuntimeException("Não é possível excluir usuário que possui contas cadastradas");
        }
        
        if (usuario.getCartoes() != null && !usuario.getCartoes().isEmpty()) {
            throw new RuntimeException("Não é possível excluir usuário que possui cartões cadastrados");
        }
        
        if (usuario.getTransacoes() != null && !usuario.getTransacoes().isEmpty()) {
            throw new RuntimeException("Não é possível excluir usuário que possui transações cadastradas");
        }
        
        // Desativar o usuário em vez de excluir
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
    
    /**
     * Conta o número total de usuários ativos
     */
    @Transactional(readOnly = true)
    public long contarUsuariosAtivos() {
        return usuarioRepository.countByAtivo(true);
    }
    
    /**
     * Verifica se um email já está em uso
     */
    @Transactional(readOnly = true)
    public boolean emailJaExiste(String email) {
        return usuarioRepository.existsByEmail(email);
    }
    
    /**
     * Valida se a senha atende aos critérios mínimos
     */
    public boolean validarSenha(String senha) {
        if (senha == null || senha.length() < 6) {
            return false;
        }
        
        // Adicionar outras validações conforme necessário
        // Ex: pelo menos uma letra maiúscula, um número, etc.
        
        return true;
    }
}