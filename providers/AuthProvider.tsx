"use client"

import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
        })

        return () => unsub()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
