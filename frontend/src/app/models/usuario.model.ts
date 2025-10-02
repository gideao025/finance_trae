export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export enum PerfilUsuario {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioResponse;
  expiresIn: number;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  perfil?: PerfilUsuario;
}