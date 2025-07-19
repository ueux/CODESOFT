'use client'
import { useEffect, useState } from "react"

const LOCATION_STORAGE_KEY = "use_location"
const LOCATION_EXPIRY_DAYS = 20

const useLocationTracking = () => {
    const [location, setLocation] = useState<{ country: string; city: string; timestamp?: number } | null>(null)

    useEffect(() => {
        // Client-side only code
        const getStoredLocation = () => {
            const storedData = localStorage.getItem(LOCATION_STORAGE_KEY)
            if (!storedData) return null
            const parseData = JSON.parse(storedData)
            const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
            const isExpired = Date.now() - parseData.timestamp > expiryTime
            return isExpired ? null : parseData
        }

        const storedLocation = getStoredLocation()
        if (storedLocation) {
            setLocation(storedLocation)
            return
        }

        fetch("http://ip-api.com/json/")
            .then((res) => res.json())
            .then((data) => {
                const newLocation = {
                    country: data?.country,
                    city: data.city,
                    timestamp: Date.now()
                }
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation))
                setLocation(newLocation)
            })
            .catch((error) => console.log("Failed to get location", error))
    }, [])

    return location
}

export default useLocationTracking