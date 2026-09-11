import axios from 'axios'

const api = axios.create(
    { baseURL: 'http' }
)

api.interceptors.request((config) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.authorization = `Bearere ${token}`
    }
})

export default api