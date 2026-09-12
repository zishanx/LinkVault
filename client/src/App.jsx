
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoutes from "./components/ProtectedRoute"
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'



export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home></Home>}></Route>
                    <Route path="/login" element={<Login></Login>}></Route>
                    <Route path="/register" element={<Register></Register>}></Route>
                    <Route path="/dashboard" element={<ProtectedRoutes><Dashboard></Dashboard></ProtectedRoutes>}></Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}