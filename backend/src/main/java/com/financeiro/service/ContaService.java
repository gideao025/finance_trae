package com.financeiro.service;

import com.financeiro.model.Conta;
import com.financeiro.model.Usuario;
import com.financeiro.model.enums.TipoConta;
import com.financeiro.repository.ContaRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ContaService {
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Cria uma nova conta
     */
    public Conta criarConta(Conta conta, Long usuarioId) {
        // Validar se o usuário existe
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Validar se já existe uma conta com o mesmo nome para o usuário
        if (contaRepository.existsByNomeIgnoreCaseAndUsuarioId(conta.getNome(), usuarioId)) {
            throw new RuntimeException("Já existe uma conta com este nome");
        }
        
        conta.setUsuario(usuario);
        return contaRepository.save(conta);
    }
    
    /**
     * Atualiza uma conta existente
     */
    public Conta atualizarConta(Long contaId, Conta contaAtualizada, Long usuarioId) {
        Conta conta = buscarContaPorIdEUsuario(contaId, usuarioId);
        
        // Validar se já existe uma conta com o mesmo nome (excluindo a atual)
        if (contaRepository.existsByNomeIgnoreCaseAndUsuarioIdAndIdNot(
                contaAtualizada.getNome(), usuarioId, contaId)) {
            throw new RuntimeException("Já existe uma conta com este nome");
        }
        
        conta.setNome(contaAtualizada.getNome());
        conta.setTipo(contaAtualizada.getTipo());
        conta.setSaldoInicial(contaAtualizada.getSaldoInicial());
        conta.setInstituicao(contaAtualizada.getInstituicao());
        
        return contaRepository.save(conta);
    }
    
    /**
     * Busca uma conta por ID e usuário
     */
    @Transactional(readOnly = true)
    public Conta buscarContaPorIdEUsuario(Long contaId, Long usuarioId) {
        return contaRepository.findByIdAndUsuarioId(contaId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
    }
    
    /**
     * Lista todas as contas de um usuário
     */
    @Transactional(readOnly = true)
    public List<Conta> listarContasPorUsuario(Long usuarioId) {
        return contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId);
    }
    
    /**
     * Lista contas com paginação
     */
    @Transactional(readOnly = true)
    public Page<Conta> listarContasPorUsuarioComPaginacao(Long usuarioId, Pageable pageable) {
        return contaRepository.findByUsuarioId(usuarioId, pageable);
    }
    
    /**
     * Busca contas por tipo
     */
    @Transactional(readOnly = true)
    public List<Conta> buscarContasPorTipo(TipoConta tipo, Long usuarioId) {
        return contaRepository.findByTipoAndUsuarioIdOrderByNomeAsc(tipo, usuarioId);
    }
    
    /**
     * Busca contas por instituição
     */
    @Transactional(readOnly = true)
    public List<Conta> buscarContasPorInstituicao(String instituicao, Long usuarioId) {
        return contaRepository.findByInstituicaoContainingIgnoreCaseAndUsuarioIdOrderByNomeAsc(instituicao, usuarioId);
    }
    
    /**
     * Busca contas por nome parcial
     */
    @Transactional(readOnly = true)
    public List<Conta> buscarContasPorNome(String nome, Long usuarioId) {
        return contaRepository.buscarPorNomeParcialEUsuario(nome, usuarioId);
    }
    
    /**
     * Exclui uma conta
     */
    public void excluirConta(Long contaId, Long usuarioId) {
        Conta conta = buscarContaPorIdEUsuario(contaId, usuarioId);
        
        // Verificar se a conta possui transações
        if (conta.getTransacoes() != null && !conta.getTransacoes().isEmpty()) {
            throw new RuntimeException("Não é possível excluir uma conta que possui transações");
        }
        
        contaRepository.delete(conta);
    }
    
    /**
     * Calcula o saldo total de todas as contas de um usuário
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularSaldoTotalUsuario(Long usuarioId) {
        List<Conta> contas = listarContasPorUsuario(usuarioId);
        return contas.stream()
                .map(Conta::calcularSaldoAtual)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Conta o número de contas de um usuário
     */
    @Transactional(readOnly = true)
    public long contarContasPorUsuario(Long usuarioId) {
        return contaRepository.countByUsuarioId(usuarioId);
    }
    
    /**
     * Busca contas ativas (com transações)
     */
    @Transactional(readOnly = true)
    public List<Conta> buscarContasAtivas(Long usuarioId) {
        return contaRepository.buscarContasAtivasPorUsuario(usuarioId);
    }
    
    /**
     * Busca contas sem transações
     */
    @Transactional(readOnly = true)
    public List<Conta> buscarContasSemTransacoes(Long usuarioId) {
        return contaRepository.buscarContasSemTransacoesPorUsuario(usuarioId);
    }
}