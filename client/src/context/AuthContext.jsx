// Umm okie so we are creating the AuthContext here . The first thing we are going to do is import the stuffs that we need 

import { useState, useContext, createContext, useEffect } from "react";

// We will now create the context.

const AuthContext = createContext()

// We will create everything that we need.

export const AuthProvider = ({ children }) => {

    // using useState to get hold of the data that we need and export them in the value . 

    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        if (!token) {
            setIsLoading(false)
            return
        }

        const verify = async () => {

            const res = await fetch('', {
                method: "GET",
                headers: { "authorization": `Bearer ${token}`, 'Content-type': "application/json" }
            })

            if (res.ok === true) {
                const data = await res.json()
                setIsLoading(false)
                setUser(data)
            } else {
                setIsLoading(false)
            }
        }

        verify()

    }, [])

    const login = (token, userData) => {
        setToken(token)
        localStorage.setItem('token', token)
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    const value = { token, user, isLoading, login, logout }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}


//Creating a custom hook so that we can export and use it outside.

export const useAuth = () => useContext(AuthContext) 