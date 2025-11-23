import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Configure Monaco Editor - disable workers to avoid configuration issues
(self as any).MonacoEnvironment = {
    getWorker() {
        return null;
    }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
