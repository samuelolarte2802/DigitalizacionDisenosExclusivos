import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUsuario = useAuthStore((state) => state.setUsuario);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://localhost:7242/api/usuarios/login', {
        correo: correo,
        password: password
      });

      if (response.status === 200) {
        const tokenJWT = response.data.token;
        const datosUsuario = response.data.usuario;
        localStorage.setItem('token', tokenJWT);
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenJWT}`;
        setUsuario(datosUsuario);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 font-sans relative overflow-hidden p-4">
      
      {/* Marca de agua de fondo (decorativa) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
        <div className="w-64 h-64 bg-gray-900 rounded-[3rem] flex items-center justify-center text-lime-500 font-black text-8xl shadow-2xl mb-8 transform rotate-12">
          C.C.
        </div>
      </div>

      {/* Tarjeta de Login (Estilo SaaS C.C.) */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-lime-500 relative z-10 transform transition-all">    
        
        {/* Cabecera del Login */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-lime-500 rounded-xl flex items-center justify-center text-gray-900 font-black text-3xl shadow-lg mb-5 transform -rotate-3">
            C.C.
          </div>
          <h1 className="text-4xl text-gray-900 font-bold mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Control y Confección
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Acceso seguro a la plataforma</p>
        </div>

        {/* Mensaje de Error Estilizado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-center text-sm font-bold shadow-sm flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input Correo */}
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-xs uppercase tracking-wide">
              Correo Electrónico
            </label>
            <input 
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-700 font-bold placeholder-gray-400"
                placeholder="ejemplo@taller.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
            />
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-xs uppercase tracking-wide">
              Contraseña
            </label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-700 font-bold placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Botón de Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-black py-3.5 rounded-xl shadow-md transition-all transform mt-2 ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-lime-500 text-gray-900 hover:bg-lime-400 hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
          </button>
        
        </form>
      </div>
    </div>
  );
};

export default Login;