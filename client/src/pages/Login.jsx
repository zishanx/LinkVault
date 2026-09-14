// import everything that we are going to need. 
import { useState ,useRef } from "react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { Link } from "react-router-dom";
import social from '../assets/social.svg';
import formVid from '../assets/formVid.mp4';
import blob from '../assets/blob.svg'



export default function Login() {

    const [form, setForm] = useState({ email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { login } = useAuth()
    const navigate = useNavigate()

    const [showForm,setShowForm] = useState(false)



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
        <div className="flex justify-center items-center h-screen bg-background font-body ">
            <div className=" flex h-[80vh] w-[80vw] overflow-hidden rounded-md shadow-2xl bg-white">



                <div className="w-4/6 p-5 bg-white flex flex-col gap-4 items-center justify-center ">

                    <h1 className="font-bold text-3xl text-start w-full px-4 font-heading text-primary" >Hello,<br /> Welcome back</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 py-10 px-4 w-full"
                    >
                        <div className="flex flex-col mt-2 ">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => { handleChange(e) }}
                                required
                                className="bg-gray-200  p-3 rounded-xl w-full font-bold text-muted"
                            />
                        </div>
                        <div className="flex flex-col mt-2">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => { handleChange(e) }}
                                required
                                className="bg-gray-200 p-3 rounded-xl w-full font-bold text-muted "
                            />
                        </div>


                        <button className="mt-2 bg-primary text-white rounded-md p-2 px-4 font-bold hover:bg-primary-hover" type="submit" disabled={isLoading}>{isLoading ? ("Signing In...") : "Sign in"}</button>

                        {error ? (<p className="mt-2 text-red-400 font-bold text-sm">{error}</p>) : <></>}

                        <p className="mt-2 text-gray-600 text-sm">Don't have an account click here.<Link to='/register' className="font-bold"> Sign Up</Link> </p>
                    </form>
                </div>
                
                <div className="flex items-center object-cover w-max ">
                    <video src={formVid} autoPlay muted playsInline className="w-full h-full p-5"></video>
                </div>
            </div>
        </div>
    )
}