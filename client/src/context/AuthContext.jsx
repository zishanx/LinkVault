import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

// creating the context ("the box");

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {

        if(!token) {
            setIsLoading(false);
            return
        }

        const verify = async () => {
            const res = await fetch('', {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-type": "application/json" },
            })

        }

        verify()
    }, [])


    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }


    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
    }

    const value = { user, token, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext)