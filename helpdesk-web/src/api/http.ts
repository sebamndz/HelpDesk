const baseUrl = 'http://localhost:5248'

export interface ApiError extends Error {
  status?: number
}

const getToken = () => localStorage.getItem('helpdesk_token')

export const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = await response.json()
      message = data?.message ?? message
    } catch {
      message = response.statusText
    }

    const error: ApiError = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
