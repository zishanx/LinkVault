import { useAuth } from "../context/AuthContext";
import { Navigate } from 'react-router-dom'

const ProtectedRoutes = function ({ children }) {

    const { user, isLoading } = useAuth()

    if (isLoading === true) {
        return "Loading"
    }

    if (isLoading === false) {
        if (user) {
            return <>{children}</>
        } else {
            return <Navigate to="/login"></Navigate >
        }
    }



}

export default ProtectedRoutes