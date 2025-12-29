"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./AuthProvider"
import { getLocations, type Location } from "@/lib/services/locations"

interface LocationContextType {
    locations: Location[]
    selectedLocation: Location | null
    setSelectedLocation: (location: Location | null) => void
    loading: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLocations = async () => {
            if (user) {
                try {
                    setLoading(true)
                    const fetchedLocations = await getLocations(user.uid)
                    setLocations(fetchedLocations)
                    // Por defecto, no seleccionar ninguna sede (mostrar todas)
                } catch (error) {
                    console.error("Error fetching locations:", error)
                    setLocations([])
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [user])

    return (
        <LocationContext.Provider value={{ locations, selectedLocation, setSelectedLocation, loading }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider")
    }
    return context
}
