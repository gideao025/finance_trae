package com.financeiro.controller;

import com.financeiro.model.Conta;
import com.financeiro.model.enums.TipoConta;
import com.financeiro.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/contas")
@CrossOrigin(origins = "http://localhost:4200")
public class ContaController {
    
    @Autowired
    private ContaService contaService;
    
    /**
     * Cria uma nova conta
     */
    @PostMapping
    public ResponseEntity<Conta> criarConta(@Valid @RequestBody Conta conta, 
                                           @RequestParam Long usuarioId) {
        try {
            Conta novaConta = contaService.criarConta(conta, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaConta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lista todas as contas de um usuário
     */
    @GetMapping
    public ResponseEntity<List<Conta>> listarContas(@RequestParam Long usuarioId) {
        List<Conta> contas = contaService.listarContasPorUsuario(usuarioId);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Lista contas com paginação
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<Conta>> listarContasPaginado(@RequestParam Long usuarioId, 
                                                           Pageable pageable) {
        Page<Conta> contas = contaService.listarContasPorUsuarioComPaginacao(usuarioId, pageable);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Busca uma conta por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Conta> buscarContaPorId(@PathVariable Long id, 
                                                 @RequestParam Long usuarioId) {
        try {
            Conta conta = contaService.buscarContaPorIdEUsuario(id, usuarioId);
            return ResponseEntity.ok(conta);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Atualiza uma conta
     */
    @PutMapping("/{id}")
    public ResponseEntity<Conta> atualizarConta(@PathVariable Long id, 
                                               @Valid @RequestBody Conta conta, 
                                               @RequestParam Long usuarioId) {
        try {
            Conta contaAtualizada = contaService.atualizarConta(id, conta, usuarioId);
            return ResponseEntity.ok(contaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Exclui uma conta
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirConta(@PathVariable Long id, 
                                            @RequestParam Long usuarioId) {
        try {
            contaService.excluirConta(id, usuarioId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Busca contas por tipo
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Conta>> buscarContasPorTipo(@PathVariable TipoConta tipo, 
                                                          @RequestParam Long usuarioId) {
        List<Conta> contas = contaService.buscarContasPorTipo(tipo, usuarioId);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Busca contas por instituição
     */
    @GetMapping("/instituicao")
    public ResponseEntity<List<Conta>> buscarContasPorInstituicao(@RequestParam String instituicao, 
                                                                 @RequestParam Long usuarioId) {
        List<Conta> contas = contaService.buscarContasPorInstituicao(instituicao, usuarioId);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Busca contas por nome
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Conta>> buscarContasPorNome(@RequestParam String nome, 
                                                          @RequestParam Long usuarioId) {
        List<Conta> contas = contaService.buscarContasPorNome(nome, usuarioId);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Calcula o saldo total do usuário
     */
    @GetMapping("/saldo-total")
    public ResponseEntity<BigDecimal> calcularSaldoTotal(@RequestParam Long usuarioId) {
        BigDecimal saldoTotal = contaService.calcularSaldoTotalUsuario(usuarioId);
        return ResponseEntity.ok(saldoTotal);
    }
    
    /**
     * Conta o número de contas do usuário
     */
    @GetMapping("/count")
    public ResponseEntity<Long> contarContas(@RequestParam Long usuarioId) {
        long totalContas = contaService.contarContasPorUsuario(usuarioId);
        return ResponseEntity.ok(totalContas);
    }
    
    /**
     * Busca contas ativas (com transações)
     */
    @GetMapping("/ativas")
    public ResponseEntity<List<Conta>> buscarContasAtivas(@RequestParam Long usuarioId) {
        List<Conta> contas = contaService.buscarContasAtivas(usuarioId);
        return ResponseEntity.ok(contas);
    }
    
    /**
     * Busca contas sem transações
     */
    @GetMapping("/sem-transacoes")
    public ResponseEntity<List<Conta>> buscarContasSemTransacoes(@RequestParam Long usuarioId) {
        List<Conta> contas = contaService.buscarContasSemTransacoes(usuarioId);
        return ResponseEntity.ok(contas);
    }
}