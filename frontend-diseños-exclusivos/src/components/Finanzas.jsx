import { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';

const Finanzas = ({ onClose }) => {

  const [pedidos, setPedidos] = useState([]);
  const [filtroTiempo, setFiltroTiempo] = useState('mes');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    
    document.body.style.overflow = 'hidden';
    cargarPedidos();
    
    return () => {

      document.body.style.overflow = 'unset';

    };
  }, []);

  const cargarPedidos = async () => {

    try {

      const respuesta = await clienteAxios.get('/pedidos');
      const validos = respuesta.data.filter(p => p.estado !== 'Cancelado');
      setPedidos(validos);

    } catch (error) {

      console.error("Error al cargar datos financieros:", error);

    } finally {

      setCargando(false);

    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!pedido.fechaPedido) return false;
    
    const fechaPedido = new Date(pedido.fechaPedido);
    const hoy = new Date();
    
    if (filtroTiempo === 'mes') {

      return fechaPedido.getMonth() === hoy.getMonth() && 
             fechaPedido.getFullYear() === hoy.getFullYear();

    } 

    else if (filtroTiempo === 'año') {

      return fechaPedido.getFullYear() === hoy.getFullYear();
      
    } 
    else if (filtroTiempo === 'semana') {

      const primerDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1)));
      primerDiaSemana.setHours(0, 0, 0, 0);
      return fechaPedido >= primerDiaSemana;

    }
    return true;
  });

  let ventasTotales = 0;
  let dineroRecaudado = 0;
  let dineroPendiente = 0;

  pedidosFiltrados.forEach(pedido => {

    const total = parseFloat(pedido.totalPagar) || 0;
    let abono = parseFloat(pedido.abono) || 0;
    if (pedido.estadoPago === 'Pagado') {

      abono = total;

    }

    ventasTotales += total;
    dineroRecaudado += abono;
    dineroPendiente += (total - abono);

  });

  const porcentajeRecaudado = ventasTotales > 0 ? Math.round((dineroRecaudado / ventasTotales) * 100) : 0;
  const porcentajePendiente = ventasTotales > 0 ? 100 - porcentajeRecaudado : 0;

  const formatoPlata = (valor) => {

    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-40 overflow-y-auto w-full h-full">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-emerald-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Balance Financiero</h2>
            <p className="text-sm text-gray-500">Control de ingresos y cartera</p>
          </div>
          
          <div className="flex w-full sm:w-auto gap-4 items-center">
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setFiltroTiempo('semana')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filtroTiempo === 'semana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Esta Semana
              </button>
              <button 
                onClick={() => setFiltroTiempo('mes')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filtroTiempo === 'mes' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Este Mes
              </button>
              <button 
                onClick={() => setFiltroTiempo('año')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filtroTiempo === 'año' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Este Año
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition shrink-0"
            >
              Volver al Menú
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-10"><p className="text-gray-500 font-bold">Calculando finanzas...</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                <span className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3 text-2xl">📈</span>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ventas Totales</p>
                <h3 className="text-3xl font-black text-gray-800 mt-1">{formatoPlata(ventasTotales)}</h3>
                <p className="text-xs text-gray-400 mt-2">Valor total de los trabajos</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
                <span className="bg-emerald-100 text-emerald-600 p-3 rounded-full mb-3 text-2xl">💵</span>
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Dinero en Caja (Recaudado)</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{formatoPlata(dineroRecaudado)}</h3>
                <p className="text-xs text-gray-400 mt-2">Abonos y pagos completados</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-orange-500"></div>
                <span className="bg-orange-100 text-orange-600 p-3 rounded-full mb-3 text-2xl">⏳</span>
                <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Cartera Pendiente (Por Cobrar)</p>
                <h3 className="text-3xl font-black text-orange-600 mt-1">{formatoPlata(dineroPendiente)}</h3>
                <p className="text-xs text-gray-400 mt-2">Dinero en la calle</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                📊 Diagrama de Flujo de Efectivo
              </h3>
              
              {ventasTotales === 0 ? (
                <p className="text-center text-gray-400 font-medium py-4">No hay movimientos registrados en este periodo.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-emerald-600">Recaudado ({porcentajeRecaudado}%)</span>
                    <span className="text-orange-600">Pendiente ({porcentajePendiente}%)</span>
                  </div>
                  
                  {/* La barra gráfica */}
                  <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner bg-gray-100">
                    <div 
                      className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-1000"
                      style={{ width: `${porcentajeRecaudado}%` }}
                    >
                      {porcentajeRecaudado > 10 && 'Caja'}
                    </div>
                    <div 
                      className="bg-orange-400 flex items-center justify-center text-white text-xs font-bold transition-all duration-1000 striped-bg"
                      style={{ width: `${porcentajePendiente}%` }}
                    >
                      {porcentajePendiente > 10 && 'Calle'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {dineroPendiente > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                    🚨 Trabajos Pendientes por Cobrar
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {pedidosFiltrados
                    .filter(p => (parseFloat(p.totalPagar) - parseFloat(p.abono || 0)) > 0 && p.estadoPago !== 'Pagado')
                    .map(pedido => {
                      const deuda = parseFloat(pedido.totalPagar) - parseFloat(pedido.abono || 0);
                      return (
                        <div key={pedido.idPedido} className="p-4 flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <p className="font-bold text-gray-800">{pedido.cliente?.nombreCompleto || 'Desconocido'}</p>
                            <p className="text-xs text-gray-500 mt-1">Orden #{pedido.idPedido} • {pedido.tipoProducto}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-orange-600">{formatoPlata(deuda)}</p>
                            <p className="text-xs text-gray-400 mt-1">De {formatoPlata(pedido.totalPagar)}</p>
                          </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Finanzas;