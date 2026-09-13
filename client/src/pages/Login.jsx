// import everything that we are going to need. 
import { useState } from "react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'




export default function Login() {

    const [form, setForm] = useState({ email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { login } = useAuth()
    const navigate = useNavigate()



    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            const res = await api.post('/auth/login', form)

            login(res.data.token, res.data.user)
            navigate('/')
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong")

        } finally {
            setIsLoading(false)
        }
    }



    return (
        <>
            <div>



                <div>

                    <h1>Login</h1>
                    <form
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="johndoe@gmail.com"
                                value={form.email}
                                onChange={(e) => { handleChange(e) }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="******"
                                value={form.password}
                                onChange={(e) => { handleChange(e) }}
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading}>Login</button>

                        {error ? (<div>{error}</div>) : <></>}
                    </form>
                </div>
                <div>

                </div>
            </div>
        </>
    )
}