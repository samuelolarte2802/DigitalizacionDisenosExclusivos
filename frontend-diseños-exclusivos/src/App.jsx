import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from './store/authStore';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; 

const RutaProtegida = ({ children }) => {

  const token = localStorage.getItem('token');
  if (!token) {

    return <Navigate to="/" replace />;

  }
  return children;
};

function App() {

  const setUsuario = useAuthStore((state) => state.setUsuario);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {

    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    if (token && usuarioGuardado) {

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUsuario(JSON.parse(usuarioGuardado));

    }
    
    setCargando(false);
  }, [setUsuario]);

  if (cargando) return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">Cargando sistema...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;