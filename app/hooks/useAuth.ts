'use client'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = localStorage.getItem('authenticated')
    setIsAuthenticated(authStatus === 'true')
  }, [])

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('authenticated')
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    login,
    logout,
  }
}

