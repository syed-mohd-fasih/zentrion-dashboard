"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    router.replace(isAuthenticated ? "/dashboard" : "/login")
  }, [isAuthenticated, loading, router])

  return null
}
