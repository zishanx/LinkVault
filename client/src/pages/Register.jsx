import { useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "../api/axios"

import regVid from '../assets/registervid.mp4'



export default function Register() {

    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setIsLoading(true)
        try {
            const res = await api.post('/auth/register', form)
            setMessage(res.data.message)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error) {
            setError(error.response?.data?.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div>

                {message ? (<div className="absolute top-20 left-40 p-4">
                    <p className="text-lg text-primary font-bold ">{message}</p>
                </div>) :
                    <></>}

                <div className="flex">
                    <div className="w-1/2">
                        <h1>Create an account</h1>
                        <form onSubmit={handleSubmit}>

                            <div>
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={(e) => {
                                        handleChange(e)
                                    }}
                                    required
                                    className="bg-gray-200  p-3 rounded-xl w-full font-bold text-muted"
                                />
                            </div>

                            <div>
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={(e) => {
                                        handleChange(e)
                                    }}
                                    required
                                    className="bg-gray-200  p-3 rounded-xl w-full font-bold text-muted"
                                />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={(e) => {
                                        handleChange(e)
                                    }}
                                    required
                                    className="bg-gray-200  p-3 rounded-xl w-full font-bold text-muted"
                                />
                            </div>
                            <div>
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={(e) => {
                                        handleChange(e)
                                    }}
                                    required
                                    className="bg-gray-200  p-3 rounded-xl w-full font-bold text-muted"
                                />
                            </div>
                            {error ? (<p>{error}</p>) : <></>}
                            <button type="submit">{isLoading ? "Signing Up" : "Sign Up"}</button>
                        </form>
                    </div>
                    <div className="w-1/2"><video src={regVid} autoPlay muted playsInline className="w-full h-full p-5" ></video></div>
                </div>


            </div>
        </>
    )
}