import axios from 'axios'
import { settings } from 'src/config'

const api = axios.create({
	baseURL: settings.API_URL,
	withCredentials: true,
})

// ==========================================
// REQUEST INTERCEPTOR - Adicionar Token
// ==========================================
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token')

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

api.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
)

export { api }
