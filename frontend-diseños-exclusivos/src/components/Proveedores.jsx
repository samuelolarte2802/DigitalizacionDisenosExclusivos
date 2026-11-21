import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import clienteAxios from '../api/axiosConfig';

const Proveedores = ({ onClose }) => {

  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {

    document.body.style.overflow = 'hidden';
    cargarProveedores();
    
    return () => {

      document.body.style.overflow = 'unset';

    };
  }, []);

  const cargarProveedores = async () => {
    try {

      const respuesta = await clienteAxios.get('/proveedores');
      setProveedores(respuesta.data);

    } catch (error) {

      console.error("Error al cargar proveedores:", error);

    } finally {

      setCargando(false);

    }
  };
  const abrirModalNuevo = () => {

    setProveedorEditar(null);
    reset({

      nombreEmpresa: '',
      alias: '',
      telefono: '',
      insumoPrincipal: '',
      direccion: ''

    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (proveedor) => {

    setProveedorEditar(proveedor);
    setValue('nombreEmpresa', proveedor.nombreEmpresa);
    setValue('alias', proveedor.alias || '');
    setValue('telefono', proveedor.telefono);
    setValue('insumoPrincipal', proveedor.insumoPrincipal || '');
    setValue('direccion', proveedor.direccion || '');
    setModalAbierto(true);

  };
  const onSubmit = async (data) => {

    try {

      if (proveedorEditar) {

        const proveedorActualizado = {

          ...proveedorEditar,
          ...data
          
        };
        await clienteAxios.put(`/proveedores/${proveedorEditar.idProveedor}`, proveedorActualizado);
      } else {

        const nuevoProveedor = {
          ...data,
          fechaRegistro: new Date().toISOString()
        };
        await clienteAxios.post('/proveedores', nuevoProveedor);

      }
      
      setModalAbierto(false);
      cargarProveedores(); // Recargamos la lista
    } catch (error) {

      console.error("Error al guardar proveedor:", error);
      alert("Hubo un error al guardar. Revisa la consola.");

    }
  };

  const eliminarProveedor = async (id) => {

    if (window.confirm("¿Estás seguro de eliminar este proveedor del directorio?")) {

      try {

        await clienteAxios.delete(`/proveedores/${id}`);
        cargarProveedores();

      } catch (error) {

        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar. Verifica que no tenga registros enlazados.");
        
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(prov => {

    const nombre = prov.nombreEmpresa?.toLowerCase() || '';
    const alias = prov.alias?.toLowerCase() || '';
    const insumo = prov.insumoPrincipal?.toLowerCase() || '';
    const termino = busqueda.toLowerCase();
    return nombre.includes(termino) || alias.includes(termino) || insumo.includes(termino);

  });

  return (
    <div className="fixed inset-0 bg-gray-100 z-40 overflow-y-auto w-full h-full">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-purple-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Directorio de Proveedores</h2>
            <p className="text-sm text-gray-500">Gestión de insumos y contactos textiles</p>
          </div>
          
          <div className="flex w-full sm:w-auto gap-4 items-center">
            <div className="w-full sm:w-80 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar proveedor o insumo..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
              />
            </div>
            
            <button 
              onClick={abrirModalNuevo}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-sm whitespace-nowrap"
            >
              + Nuevo Proveedor
            </button>

            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition shrink-0"
            >
              Volver al Menú
            </button>
          </div>
        </div>

        {cargando ? (
           <div className="text-center py-10"><p className="text-gray-500 font-bold">Cargando directorio...</p></div>
        ) : proveedoresFiltrados.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No se encontraron proveedores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proveedoresFiltrados.map(prov => (
              <div 
                key={prov.idProveedor} 
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-400 transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {prov.alias ? prov.alias : prov.nombreEmpresa}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalEditar(prov)} className="text-purple-600 hover:text-purple-800" title="Editar">✏️</button>
                    <button onClick={() => eliminarProveedor(prov.idProveedor)} className="text-red-500 hover:text-red-700" title="Eliminar">🗑️</button>
                  </div>
                </div>
                
                {prov.alias && (
                  <p className="text-xs text-gray-500 mb-3 uppercase font-semibold tracking-wider">
                    Razón Social: {prov.nombreEmpresa}
                  </p>
                )}

                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span>📞</span> <span className="font-medium">{prov.telefono}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📍</span> <span className="truncate">{prov.direccion || 'Sin dirección'}</span>
                  </p>
                </div>
                
                <div className="mt-auto pt-4">
                  <div className="inline-block bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                    <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">Insumo Principal:</span>
                    <p className="text-sm font-bold text-purple-900 mt-0.5">{prov.insumoPrincipal || 'General'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              
              <div className="bg-purple-900 p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-purple-300">🏢</span> 
                  {proveedorEditar ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                </h3>
                <button onClick={() => setModalAbierto(false)} className="text-purple-300 hover:text-white font-bold text-xl">✕</button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Razón Social / Nombre de Empresa *</label>
                  <input 
                    type="text" 
                    {...register("nombreEmpresa", { required: "Este campo es obligatorio" })}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 ${errors.nombreEmpresa ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Ej. Textiles y Acabados S.A.S."
                  />
                  {errors.nombreEmpresa && <span className="text-red-500 text-xs font-semibold">{errors.nombreEmpresa.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Alias (Nombre Corto)</label>
                    <input 
                      type="text" 
                      {...register("alias")}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. Don Carlos Telas"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Teléfono *</label>
                    <input 
                      type="text" 
                      {...register("telefono", { required: "El teléfono es obligatorio" })}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ej. 310..."
                    />
                    {errors.telefono && <span className="text-red-500 text-xs font-semibold">{errors.telefono.message}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Insumo Principal</label>
                  <input 
                    type="text" 
                    {...register("insumoPrincipal")}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej. Hilos, Botones, Dacrón..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Dirección Física</label>
                  <input 
                    type="text" 
                    {...register("direccion")}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej. Carrera 15 #20-30, Centro"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                  <button 
                    type="button"
                    onClick={() => setModalAbierto(false)} 
                    className="px-5 py-2.5 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    💾 {proveedorEditar ? 'Guardar Cambios' : 'Registrar Proveedor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proveedores;