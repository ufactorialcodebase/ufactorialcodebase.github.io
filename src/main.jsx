import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

/**
 * Handle GitHub Pages SPA redirect
 * When 404.html redirects with ?p=/path, navigate to that path
 */
function RedirectHandler({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check for redirect path from 404.html
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('p');
    
    if (redirectPath) {
      // Navigate to the intended path and remove the query param
      navigate(decodeURIComponent(redirectPath), { replace: true });
    }
  }, []);
  
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RedirectHandler>
        <App />
      </RedirectHandler>
    </BrowserRouter>
  </StrictMode>,
)
