import { request } from './http'

export interface LoginResponse {
  token: string
}

export interface RegisterResponse {
  message: string
}

export const login = (email: string, password: string) =>
  request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (email: string, password: string) =>
  request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
