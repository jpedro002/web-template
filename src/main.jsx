import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// @ts-expect-error
createRoot(document.getElementById('root')).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
