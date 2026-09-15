import { useState } from "react"
import { useNavigate , Link} from "react-router-dom"

import api from "../api/axios"

import regVid from '../assets/registervid.mp4'



export default function Register() {

    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState("")
    const [showSucces, setShowSucces] = useState(false)
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
            setShowSucces(true)
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
            <div className="flex justify-center items-center h-screen bg-background font-body  ">

                {message ? (<div className="absolute top-20 left-40 p-4">
                    <p className="text-lg text-primary font-bold ">{message}</p>
                </div>) :
                    <></>}

                <div className="flex h-[80vh] w-[80vw] overflow-hidden rounded-md shadow-2xl bg-white">
                    <div className="w-4/6 p-5 bg-white flex flex-col gap-4 items-center justify-center ">
                        <h1 id="text" className="font-bold text-3xl text-start w-full px-4 font-heading text-primary">Create an account</h1>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-10 px-4 w-full">

                            <div className="flex flex-col mt-2 ">
                                <label htmlFor="name" className="sr-only">Name</label>
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

                            <div className="flex flex-col mt-2 ">
                                <label htmlFor="username" className="sr-only">Username</label>
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
                            <div className="flex flex-col mt-2 ">
                                <label htmlFor="email" className="sr-only">Email</label>
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
                            <div className="flex flex-col mt-2 ">
                                <label htmlFor="password" className="sr-only">Password</label>
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
                            {error ? (<p className="mt-2 text-red-400 font-bold text-sm">{error}</p>) : <></>}
                            <button type="submit" disabled={isLoading || showSucces} className="mt-2 bg-primary text-white rounded-md p-2 px-4 font-bold hover:bg-primary-hover">{showSucces ? "Signing Up" : "Sign Up"}</button>
                            <p id="reg-text" className="mt-2 text-gray-600 text-sm">Already an account click here.<Link to='/login' className="font-bold"> Sign In</Link> </p>
                        </form>
                    </div>
                    <div className="flex items-center object-cover w-max "><video src={regVid} autoPlay muted playsInline className="w-full h-full p-5" ></video></div>
                </div>


            </div>
        </>
    )
}