// import everything that we are going to need. 
import { useState } from "react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { Link } from "react-router-dom";




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
        <div className="flex justify-center items-center h-screen bg-gray-300 ">
            <div className=" flex h-[80vh] w-[80vw] overflow-hidden rounded-md shadow-2xl ">



                <div className="w-1/2 p-5 bg-white flex flex-col gap-4 items-center justify-center">

                    <h1 className="font-bold text-3xl" >Login</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="shadow-md rounded-md py-10 px-4 w-full"
                    >
                        <div className="flex flex-col mt-2">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="johndoe@gmail.com"
                                value={form.email}
                                onChange={(e) => { handleChange(e) }}
                                required
                                className="bg-gray-200  p-3 rounded-xl w-full"
                            />
                        </div>
                        <div className="flex flex-col mt-2">
                            <label htmlFor="password" className="">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="******"
                                value={form.password}
                                onChange={(e) => { handleChange(e) }}
                                required
                                className="bg-gray-200 p-3 rounded-xl w-full"
                            />
                        </div>


                        <button className="mt-2 bg-black text-white rounded-md p-2 px-4 font-bold" type="submit" disabled={isLoading}>Sign in</button>

                        {error ? (<p className="mt-2 text-gray-600 text-sm">{error}</p>) : <></>}

                        <p className="mt-2 text-gray-600 text-sm">Don't have an account click here.<Link to='/register' className="font-bold"> Sign Up</Link> </p>
                    </form>
                </div>
                <div className="w-1/2 bg-pink-500">

                </div>
            </div>
        </div>
    )
}