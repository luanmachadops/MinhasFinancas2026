import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import { OnboardingProvider } from './contexts/OnboardingContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <DataProvider>
                <OnboardingProvider>
                    <App />
                </OnboardingProvider>
            </DataProvider>
        </AuthProvider>
    </React.StrictMode>,
)

