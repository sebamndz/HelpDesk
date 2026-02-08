import { createContext, useContext, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  nameidentifier?: string
  emailaddress?: string
  role?: string | string[]
}

interface AuthContextValue {
  token: string | null
  userId: string | null
  email: string | null
  roles: string[]
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseRoles = (role?: string | string[]) => {
  if (!role) return []
  return Array.isArray(role) ? role : [role]
}

const decodeToken = (token: string | null) => {
  if (!token) {
    return {
      userId: null,
      email: null,
      roles: [],
    }
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      userId: decoded.nameidentifier ?? null,
      email: decoded.emailaddress ?? null,
      roles: parseRoles(decoded.role),
    }
  } catch {
    return {
      userId: null,
      email: null,
      roles: [],
    }
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('helpdesk_token'),
  )

  const { userId, email, roles } = useMemo(() => decodeToken(token), [token])

  const login = (newToken: string) => {
    localStorage.setItem('helpdesk_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('helpdesk_token')
    setToken(null)
  }

  const value = {
    token,
    userId,
    email,
    roles,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
