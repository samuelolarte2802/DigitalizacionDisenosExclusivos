import React, { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import FormularioCliente from '../components/FormularioCliente';
import NuevoPedidoWizard from '../components/NuevoPedidoWizard';
import PedidosVigentes from '../components/PedidosVigentes';
import HistorialPedidos from '../components/HistorialPedidos';
import Finanzas from '../components/Finanzas';
import Proveedores from '../components/Proveedores';
import ListaPrecios from '../components/ListasPrecios';
import ModuloIA from '../components/ModuloIA';
import GestionUsuarios from '../components/GestionUsuarios';

const Dashboard = () => {

  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [configOrden, setConfigOrden] = useState({ clave: null, direccion: 'asc' });

  const solicitarOrden = (clave) => {

    let direccion = 'asc';
    if (configOrden.clave === clave && configOrden.direccion === 'asc') {

      direccion = 'desc';

    }
    setConfigOrden({ clave, direccion });
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {

    const nombreSeguro = pedido.nombre || "";
    const estadoSeguro = pedido.estado || "";

    return  nombreSeguro.toLowerCase().includes(busqueda.toLowerCase()) ||
            pedido.idPedido.toString().includes(busqueda) ||
            estadoSeguro.toLowerCase().includes(busqueda.toLowerCase());

  });

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {

    if (!configOrden.clave) return 0;
    const valorA = a[configOrden.clave];
    const valorB = b[configOrden.clave];

    if (valorA < valorB) return configOrden.direccion === 'asc' ? -1 : 1;
    if (valorA > valorB) return configOrden.direccion === 'asc' ? 1 : -1;
    return 0;

  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const {register, handleSubmit, reset, formState: { errors }} = useForm();
  const esAdministrador = usuario?.rol?.toString().toLowerCase().includes('admin');

  const handleLogoutClick = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete clienteAxios.defaults.headers.common['Authorization'];
    logout();
    navigate('/'); 

  };

  const fetchPedidos = async () => {
    try {

      const response = await clienteAxios.get('/pedidos');
      setPedidos(response.data);
      setLoading(false);

    } catch (error) {

      console.error("Error al conectar con la API:", error);
      if(error.response && error.response.status === 401){

        handleLogoutClick();

      }
      setLoading(false);
    }
  };

  const fetchClientes = async () => {

    try {

      const response = await clienteAxios.get('/clientes');
      setClientes(response.data);

    } catch (error) {
    
      console.error("Error al cargar la lista de clientes:", error);
    
    }

  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token){
      
      navigate('/');
      return;

    }
    fetchPedidos();
    fetchClientes();
  }, [navigate]);

  const onSubmitPedido = async (data) => {
    
    try {

      const nuevoPedido = {

        idCliente: parseInt(data.idCliente),
        fechaPedido: new Date().toISOString(),
        totalPagar: parseFloat(data.totalPagar),
        abono: parseFloat(data.abono),
        idUsuario: usuario?.idUsuario || 1,
        estado: "En Corte",
        estadoPago: parseFloat(data.abono) >= parseFloat(data.totalPagar) ? "Pagado" : "Abonado"
      };

      await clienteAxios.post('/pedidos', nuevoPedido);
      setIsModalOpen(false);
      reset();
      setLoading(true);
      fetchPedidos();

      } catch (error) {

        console.error("Error al crear el pedido:", error);
        alert("Hubo un error al guardar el pedido. Revisa la consola.");

      }
  };

  const [mostrarPedidosVigentes, setMostrarPedidosVigentes] = useState(false);
  const [mostrarHistorialPedidos, setMostrarHistorialPedidos] = useState(false);
  const [mostrarFinanzas, setMostrarFinanzas] = useState(false);
  const [mostrarProveedores, setMostrarProveedores] = useState(false);
  const [mostrarListaPrecios, setMostrarListaPrecios] = useState(false);
  const [mostrarModuloIA, setMostrarModuloIA] = useState(false);
  const [mostrarGestionUsuarios, setMostrarGestionUsuarios] = useState(false);
  const pedidosPendientes = pedidos.filter(p => p.estado !== 'Entregado').length;
  const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado').length;
  const totalClientes = clientes.length;
  const ingresosTotales = pedidos.reduce((acumulador, pedido) => acumulador + (pedido.totalPagar || 0), 0);
  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold">Cargando datos de la base de datos...</div>;

return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 relative font-sans">
      {/* ⬛ CABECERA CORPORATIVA DE EXTREMO A EXTREMO */}
      <div className="bg-gray-900 border-b-4 border-lime-500 shadow-xl relative z-10">
        {/* Cambiamos max-w-7xl por w-full para que ocupe todo el espacio horizontal */}
        <div className="w-full px-6 lg:px-10 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Logo y Bienvenida (Pegados a la izquierda) */}
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <div className="w-14 h-14 bg-lime-500 rounded-xl flex items-center justify-center text-gray-900 font-black text-3xl shadow-lg shrink-0">
                C.C.
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl text-yellow-400 font-bold leading-none mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Control y Confección
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-300 text-sm m-0">Bienvenido, <span className="text-white font-bold">{usuario?.nombre || 'Usuario'}</span></p>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded shadow-sm tracking-wider ${esAdministrador ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-gray-300'}`}>
                    {usuario?.rol || 'Operaria'}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel de Botones Principales (Diseño "Ghost" Minimalista) */}
            <div className="flex flex-wrap justify-start lg:justify-end items-center gap-2 w-full lg:w-auto">
              
              <button 
                onClick={() => setMostrarModalCliente(true)}
                className="bg-lime-500 text-gray-900 font-black px-6 py-2.5 rounded-lg hover:bg-lime-400 shadow-md transition-transform transform hover:-translate-y-0.5 mr-2">
                + Nuevo Pedido
              </button>

              <button 
                onClick={() => setMostrarPedidosVigentes(true)}
                className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Órdenes Vigentes
              </button>

              <button 
                onClick={() => setMostrarHistorialPedidos(true)}
                className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Historial
              </button>

              <button 
                onClick={() => setMostrarProveedores(true)}
                className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Proveedores
              </button>

              {/* 🔒 BOTONES PROTEGIDOS POR RBAC */}
              {esAdministrador && (
                <>
                  <div className="w-px h-6 bg-gray-700 mx-2 hidden sm:block"></div>
                  
                  <button 
                    onClick={() => setMostrarFinanzas(true)}
                    className="px-3 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-800 rounded-lg text-sm font-bold transition-colors">
                    $ Finanzas
                  </button>
                  <button 
                    onClick={() => setMostrarListaPrecios(true)}
                    className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                    Precios
                  </button>
                  <button 
                    onClick={() => setMostrarGestionUsuarios(true)}
                    className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                    ⚙️ Accesos
                  </button>
                </>
              )}

              <div className="w-px h-6 bg-gray-700 mx-2 hidden sm:block"></div>

              <button 
                onClick={handleLogoutClick}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors">
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12 min-h-[75vh]">
        
        {/* Marca de agua de fondo (Posición absoluta para que no estorbe) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
          <div className="w-64 h-64 bg-gray-900 rounded-[3rem] flex items-center justify-center text-lime-500 font-black text-8xl shadow-2xl mb-8 transform -rotate-6">
            C.C.
          </div>
          <h2 className="text-8xl text-gray-900 font-bold" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Control y Confección
          </h2>
        </div>

        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-800">Resumen Operativo</h2>
            <p className="text-gray-500 font-medium mt-1">Estado actual de la producción en el taller</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tarjeta 1: En Producción */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">En Producción</p>
                  <h3 className="text-4xl font-black text-gray-800 mt-2">{pedidosPendientes}</h3>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✂️
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 font-medium">Prendas en corte o confección</p>
            </div>

            {/* Tarjeta 2: Entregados */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow border-l-4 border-l-lime-500 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Entregados</p>
                  <h3 className="text-4xl font-black text-gray-800 mt-2">{pedidosEntregados}</h3>
                </div>
                <div className="w-12 h-12 bg-lime-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✅
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 font-medium">Pedidos finalizados con éxito</p>
            </div>

            {/* Tarjeta 3: Clientes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Clientes Activos</p>
                  <h3 className="text-4xl font-black text-gray-800 mt-2">{totalClientes}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  👥
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 font-medium">Registrados en el sistema</p>
            </div>

            {/* Tarjeta 4: Finanzas (Solo Administrador) */}
            {esAdministrador ? (
              <div className="bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-800 hover:shadow-xl transition-shadow border-l-4 border-l-lime-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500 opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-bold text-lime-500 uppercase tracking-wider">Ingresos Brutos</p>
                    <h3 className="text-3xl font-black text-white mt-2">
                      {ingresosTotales.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                    💰
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 font-medium relative z-10">Histórico facturado</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center opacity-70">
                <span className="text-3xl mb-2">🔒</span>
                <p className="text-sm font-bold text-gray-400 uppercase">Acceso Restringido</p>
                <p className="text-xs text-gray-500 mt-1">Módulo financiero oculto</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE MODALES --- */}
{isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-lime-500 transform transition-all">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Registrar Nuevo Pedido</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitPedido)} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">ID del Cliente</label>
                <select 
                  type="number" 
                  {...register("idCliente", { required: "Debes seleccionar un cliente", valueAsNumber: true })} 
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-700 ${errors.idCliente ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}`}
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.aliasCliente || cliente.nombreCompleto}
                    </option>
                  ))}
                </select>
                {errors.idCliente && <span className="text-red-500 text-xs font-bold mt-1 inline-block">{errors.idCliente.message}</span>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Total a Pagar ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    {...register("totalPagar", { required: "Debes ingresar un precio", min: { value: 1000, message: "El precio mínimo es $1,000" } })}
                    className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-700 font-bold ${errors.totalPagar ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}`}
                    placeholder="150000"
                  />
                </div>
                {errors.totalPagar && <span className="text-red-500 text-xs font-bold mt-1 inline-block">{errors.totalPagar.message}</span>}
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Abono Inicial ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    {...register("abono", { required: "Ingresa 0 si no hay abono", min: { value: 0, message: "El abono inicial debe ser un valor positivo" } })}
                    className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all text-gray-700 font-bold ${errors.abono ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}`}
                    placeholder="50000"
                  />
                </div>
                {errors.abono && <span className="text-red-500 text-xs font-bold mt-1 inline-block">{errors.abono.message}</span>}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-lime-500 text-gray-900 font-black rounded-xl hover:bg-lime-400 shadow-md transition-transform transform hover:-translate-y-0.5"
                >
                  Guardar Pedido
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {mostrarModalCliente && (            
        <NuevoPedidoWizard 
          onClose={() => {
            setMostrarModalCliente(false);
            fetchPedidos();
            fetchClientes();
          }} 
        />
      )}
      {mostrarPedidosVigentes && (
        <PedidosVigentes onClose={() => {
          setMostrarPedidosVigentes(false);
          fetchPedidos();
        }} />
      )}
      {mostrarHistorialPedidos && (
        <HistorialPedidos onClose={() => {
          setMostrarHistorialPedidos(false);
          fetchPedidos();
        }} />
      )}
      {mostrarFinanzas && (
        <Finanzas onClose={() => setMostrarFinanzas(false)} />
      )}
      {mostrarProveedores && (
        <Proveedores onClose={() => setMostrarProveedores(false)} />
      )}
      {mostrarListaPrecios && (
        <ListaPrecios onClose={() => setMostrarListaPrecios(false)} />
      )}
      {mostrarModuloIA && (
        <ModuloIA onClose={() => setMostrarModuloIA(false)} />
      )}
      {mostrarGestionUsuarios && (
        <GestionUsuarios onClose={() => setMostrarGestionUsuarios(false)} />
      )}
    </div>
  );
};

export default Dashboard;