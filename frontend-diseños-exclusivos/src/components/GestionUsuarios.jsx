import { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';

const GestionUsuarios = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({

    nombre: '',
    correo: '',
    credencialHash: '',
    idRol: ''

  });

  useEffect(() => {

    document.body.style.overflow = 'hidden';
    cargarDatos();
    return () => { document.body.style.overflow = 'unset'; };

  }, []);

  const cargarDatos = async () => {

    try {

      const resUsuarios = await clienteAxios.get('/usuarios');
      setUsuarios(resUsuarios.data);
    } catch (error) {

      console.error("Error al cargar usuarios:", error);

    } finally {

      setCargando(false);

    }
  };

  const registrarUsuario = async (e) => {

    e.preventDefault();
    try {
      
      const payload = {

        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        credencialHash: nuevoUsuario.credencialHash,
        idRol: parseInt(nuevoUsuario.idRol)

      };

      await clienteAxios.post('/usuarios', payload);
      alert("Usuario creado exitosamente.");
      setModalAbierto(false);
      setNuevoUsuario({ nombre: '', correo: '', credencialHash: '', idRol: '' });
      cargarDatos();

    } catch (error) {

      console.error("Error al crear usuario:", error);
      alert("Hubo un error al registrar el usuario.");

    }
  };

  const eliminarUsuario = async (id, nombre) => {

    if (window.confirm(`¿Estás seguro de eliminar el acceso al usuario ${nombre}?`)) {

      try {

        await clienteAxios.delete(`/usuarios/${id}`);
        cargarDatos();
      } catch (error) {

        alert("No se pudo eliminar el usuario.");

      }
    }
  };

  return (

    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto w-full h-full">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Control de Accesos (Usuarios)</h2>
            <p className="text-sm text-gray-500">Gestión de personal y credenciales del sistema</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setModalAbierto(true)}
              className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition"
            >
              + Nuevo Usuario
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
            >
              Cerrar Panel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm border-b">
                <th className="p-4 font-bold">Nombre del Empleado</th>
                <th className="p-4 font-bold">Correo (Acceso)</th>
                <th className="p-4 font-bold">Nivel de Acceso</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.idUsuario} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{user.nombre}</td>
                  <td className="p-4 text-gray-600">{user.correo}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${user.idRol === 1 ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                      {user.idRol === 1 ? 'Administrador' : 'Operaria'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => eliminarUsuario(user.idUsuario, user.nombre)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-100 transition-colors"
                    >
                      Revocar Acceso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-slate-800 p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">🔐 Matricular Personal</h3>
                <button onClick={() => setModalAbierto(false)} className="text-slate-300 hover:text-white font-bold text-xl">✕</button>
              </div>
              <form onSubmit={registrarUsuario} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nombre Completo</label>
                  <input type="text" required value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500" placeholder="Ej. Ana María" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Correo Electrónico</label>
                  <input type="email" required value={nuevoUsuario.correo} onChange={e => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500" placeholder="ana@taller.com" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Contraseña Temporal</label>
                  <input type="password" required value={nuevoUsuario.credencialHash} onChange={e => setNuevoUsuario({...nuevoUsuario, credencialHash: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nivel de Acceso (Rol)</label>
                  <select required value={nuevoUsuario.idRol} onChange={e => setNuevoUsuario({...nuevoUsuario, idRol: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-500">
                    <option value="">Seleccione un rol...</option>
                    <option value="1">Administrador (Acceso Total)</option>
                    <option value="2">Operaria (Solo Producción)</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2 text-gray-600 font-bold rounded-lg hover:bg-gray-100">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900">Crear Cuenta</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;