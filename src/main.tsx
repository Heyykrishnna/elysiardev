import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import MaintenanceMode from './components/MaintenanceMode.tsx';
import Loader from './components/loader.tsx';

createRoot(document.getElementById("root")!).render( 
    <App />  
);
