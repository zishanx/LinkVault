import { useState } from "react"
import api from '../api/axios.js'
import { useAuth } from "../context/AuthContext"
import { useNavigate } from 'react-router-dom'

export default function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()


    const handleSubmit = async (e) => {

        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.token, res.data.user)
            navigate('/home')
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        required
                        placeholder="johndoe@gmail.com"
                    />
                </div>


                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                        required
                        placeholder="*******"
                    />

                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                >Log in</button>

                {error ? (<div><p>{error}</p></div>) : <></>}

            </form>

        </>
    )

}

