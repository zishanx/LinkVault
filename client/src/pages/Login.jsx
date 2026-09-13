import { useState } from "react"
import api from '../api/axios.js'
import { useAuth } from "../context/AuthContext"

export default function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const login = useAuth()

    const handleSubmit = async () => {

        setIsLoading(true)

        try {

            const res = await api.post('/auth/login', { email, password });
            if ("token" in res.data) {
                login(res.data.token, res.data.user)

                setError(null)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }

    }

}

return (
    <h1>Login</h1>
)
}