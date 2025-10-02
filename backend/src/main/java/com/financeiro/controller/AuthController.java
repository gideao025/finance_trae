package com.financeiro.controller;

import com.financeiro.model.Usuario;
import com.financeiro.service.CustomUserDetailsService;
import com.financeiro.service.UsuarioService;
import com.financeiro.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Endpoint de login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Autenticar o usuário
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), 
                    loginRequest.getSenha()
                )
            );
            
            // Carregar detalhes do usuário
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
            Usuario usuario = userDetailsService.findUsuarioByEmail(loginRequest.getEmail());
            
            // Gerar token JWT com informações do usuário
            String token = jwtUtil.generateTokenWithUserInfo(
                usuario.getEmail(), 
                usuario.getId(), 
                usuario.getPerfil().name()
            );
            
            // Preparar resposta
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("usuario", new UsuarioResponse(usuario));
            response.put("expiresIn", 86400); // 24 horas em segundos
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciais inválidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Endpoint de registro
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@Valid @RequestBody Usuario usuario) {
        try {
            Usuario novoUsuario = usuarioService.criarUsuario(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuário criado com sucesso");
            response.put("usuario", new UsuarioResponse(novoUsuario));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Endpoint para validar token
     */
    @PostMapping("/validar-token")
    public ResponseEntity<?> validarToken(@RequestBody TokenRequest tokenRequest) {
        try {
            String token = tokenRequest.getToken();
            
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractUsername(token);
                Usuario usuario = userDetailsService.findUsuarioByEmail(email);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("usuario", new UsuarioResponse(usuario));
                response.put("remainingTime", jwtUtil.getTokenRemainingTime(token));
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * Endpoint para refresh do token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRequest tokenRequest) {
        try {
            String token = tokenRequest.getToken();
            
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractUsername(token);
                Usuario usuario = userDetailsService.findUsuarioByEmail(email);
                
                String novoToken = jwtUtil.generateTokenWithUserInfo(
                    usuario.getEmail(), 
                    usuario.getId(), 
                    usuario.getPerfil().name()
                );
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", novoToken);
                response.put("expiresIn", 86400);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Token inválido");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao renovar token");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Classes auxiliares para requests e responses
    public static class LoginRequest {
        private String email;
        private String senha;
        
        // Getters e Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
    }
    
    public static class TokenRequest {
        private String token;
        
        // Getters e Setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
    
    public static class UsuarioResponse {
        private Long id;
        private String nome;
        private String email;
        private String perfil;
        
        public UsuarioResponse(Usuario usuario) {
            this.id = usuario.getId();
            this.nome = usuario.getNome();
            this.email = usuario.getEmail();
            this.perfil = usuario.getPerfil().name();
        }
        
        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPerfil() { return perfil; }
        public void setPerfil(String perfil) { this.perfil = perfil; }
    }
}