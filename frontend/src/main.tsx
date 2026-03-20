
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || ""; 
 

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <SiteConfigProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SiteConfigProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
