import { useState, useEffect, useEffectEvent } from 'react';
import clienteAxios from '../api/axiosConfig';

const HistorialPedidos = ({ onClose }) => {

    const [pedidos, setPedidos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    useEffect(() => {

        cargarHistorial();
        document.body.style.overflow = 'hidden';
        return () => {

          document.body.style.overflow = 'unset';

        }

    }, []);

    const cargarHistorial = async () => {

        try {

            const respuesta = await clienteAxios.get('/pedidos');
            console.log("Pedidos crudos desde la base de datos: ", respuesta.data)
            const historicos = respuesta.data.filter(

                p => p.estado === 'Entregado' || p.estado === 'Cancelado'

            );
            setPedidos(historicos);
        } catch (error){

            console.error("Error al cargar el hsitorial", error)

        }
    };

    const pedidosFiltrados = pedidos.filter(pedido => {

        const nombreCliente = pedido.cliente?.nombreCompleto?.toLowerCase() || "";
        const tipoPrenda = pedido.tipoProducto?.toLowerCase() || "";
        const terminoBusqueda = busqueda.toLocaleLowerCase();
        return nombreCliente.includes(terminoBusqueda) || tipoPrenda.includes(terminoBusqueda);

    });

    const formatearFecha = (cadenaFecha) => {

        if (!cadenaFecha) return 'Sin fecha';
        const fecha = new Date(cadenaFecha);
        return fecha.toLocaleDateString('es-CO');

    };
    const formatearDinero = (valor) => {
        if (!valor) return "0";
        return new Intl.NumberFormat('es-CO').format(valor);
    };
    
    return (

        <div className="fixed inset-0 bg-gray-100 z-40 overflow-y-auto w-full h-full">
            <div className="p-8 max-w-7xl mx-auto space-y-6">    
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Historial de Trabajos</h2>
                    <p className="text-sm text-gray-500">Pedidos entregados y finalizados</p>
                </div>
          
                <div className="flex w-full sm:w-auto gap-4 items-center">
                    <div className="w-full sm:w-96 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        🔍
                    </span>
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente o prenda..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    />
                </div>                    
                <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition shrink-0"
                >
                  Volver Atrás
                </button>
            </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No se encontraron pedidos en el historial.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosFiltrados.map(pedido => (
                <div 
                    key={pedido.idPedido} 
                    onClick={() => setPedidoSeleccionado(pedido)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 cursor-pointer transition-all flex flex-col"
                >
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">
                        {pedido.cliente ? pedido.cliente.nombreCompleto : `Cliente ID: ${pedido.idCliente}`}
                    </h3>
              
                    <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                        <span className="text-base">🏷️</span> 
                        {pedido.tipoProducto ? pedido.tipoProducto.toUpperCase() : 'Sin clasificar'}
                    </p>
              
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                        <span className="text-lg">📅</span> Entregado el: {formatearFecha(pedido.fechaEntrega)}
                    </p>
              
                    <div className="mt-auto">
                        <div className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded border border-gray-200">
                        <span className="text-gray-600 font-medium">Estado de Pago:</span>
                          <span className={`font-bold ${pedido.estadoPago === 'Pagado' ? 'text-emerald-700' : 'text-red-600'}`}>
                            {pedido.estadoPago}
                        </span>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}

        {pedidoSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 sm:p-6 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col relative overflow-hidden">
                    <div className="bg-gray-900 p-6 flex justify-between items-start shrink-0">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-gray-400">📦</span> Expediente Histórico #{pedidoSeleccionado.idPedido}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                            Ingresó: {formatearFecha(pedidoSeleccionado.fechaPedido)} | Se entregó: {formatearFecha(pedidoSeleccionado.fechaEntrega)}
                            </p>
                        </div>
                        <button 
                            onClick={() => setPedidoSeleccionado(null)} 
                            className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        >
                        ✕
                        </button>
                    </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50">  
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                                    👤 Perfil del Cliente
                                    </h4>
                                    <p className="text-xl font-bold text-gray-900">{pedidoSeleccionado.cliente?.nombreCompleto || 'Desconocido'}</p>
                                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                                    <li><strong>📱 Celular:</strong> {pedidoSeleccionado.cliente?.celular || 'No registrado'}</li>
                                        {pedidoSeleccionado.cliente?.aliasCliente && (
                                            <li><strong>🏷️ Alias:</strong> {pedidoSeleccionado.cliente.aliasCliente}</li>
                                        )}
                                        <li><strong>🆔 ID en sistema:</strong> {pedidoSeleccionado.idCliente}</li>
                                    </ul>
                                </div>


                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                                💰 Cierre Financiero
                                </h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="text-gray-600">Costo Total:</span>
                                        <span className="font-bold text-gray-800">$ {formatearDinero(pedidoSeleccionado.totalPagar)}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="text-gray-600">Abono Inicial:</span>
                                        <span className="font-bold text-gray-800">$ {formatearDinero(pedidoSeleccionado.abono)}</span>
                                    </li>
                                    <li className="flex justify-between items-center pt-2">
                                        <span className="text-gray-600 font-bold">Saldo Pendiente a Cobrar:</span>
                                        <span className="text-red-600 font-bold text-lg">
                                            $ {formatearDinero(pedidoSeleccionado.totalPagar - pedidoSeleccionado.abono)}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                            ✂️ Especificaciones Técnicas del Trabajo
                            </h4>
                 
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold mb-2">TIPO DE TRABAJO</p>
                                    <p className="text-sm font-bold text-blue-900 bg-blue-50 px-3 py-2 rounded-lg inline-block border border-blue-100">
                                    {pedidoSeleccionado.tipoProducto}
                                    </p>

                                    <p className="text-xs text-gray-500 font-bold mt-5 mb-2">PIEZAS CONFECCIONADAS</p>
                                    {pedidoSeleccionado.piezas && pedidoSeleccionado.piezas.length > 0 ? (
                                        pedidoSeleccionado.piezas[0].isDotacion ? (
                                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                                {pedidoSeleccionado.piezas.map((emp, i) => (
                                                    <div key={i} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                                                        <p className="font-bold text-indigo-900 text-sm">
                                                            👤 {emp.nombre || `Empleado ${i+1}`}
                                                            <span className="ml-2 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-xs">
                                                                {emp.tipoTallaje === 'estandar' ? `Talla: ${emp.tallaEstandar || 'N/A'}` : 'A Medida'}
                                                            </span>
                                                        </p>
                                        
                                                        {emp.tipoTallaje === 'medida' && (
                                                            <p className="text-xs text-gray-600 mt-2 mb-2 bg-white p-2 rounded border border-gray-200 shadow-inner font-mono">
                                                                Pecho: {emp.medidas?.pecho || '-'} | Cint: {emp.medidas?.cintura || '-'} | Cad: {emp.medidas?.cadera || '-'} | Espalda: {emp.medidas?.largoEspalda || '-'}
                                                            </p>
                                                        )}
                                    
                                                    <ul className="mt-3 border-t border-indigo-100 pt-2 space-y-1">
                                                        {Object.entries(emp.cantidades || {}).map(([prenda, cant]) => (
                                                            cant > 0 ? (
                                                                <li key={prenda} className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
                                                                    <span className="bg-white border px-1.5 rounded text-emerald-700">{cant}x</span> {prenda}
                                                                </li>
                                                            ) : null
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ul className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {pedidoSeleccionado.piezas.map((pieza, i) => (
                                                <li key={i} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 
                                                    {typeof pieza === 'object' && pieza !== null ? `${pieza.cantidad || 1}x ${pieza.descripcion}` : pieza}
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                ) : (
                                    <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg">No hay piezas registradas.</p>
                                )}
                            </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold mb-2">MEDIDAS HISTÓRICAS (TALLAJE)</p>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-gray-800 h-full shadow-inner">
                                        {pedidoSeleccionado.medidas_especificas ? (
                                             <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                                                {JSON.stringify(pedidoSeleccionado.medidas_especificas, null, 2).replace(/["{}]/g, '')}
                                             </pre>
                                        ) : 
                                        pedidoSeleccionado.cliente?.medidas ? (
                                           typeof pedidoSeleccionado.cliente.medidas === 'string' ? (
                                              <p className="whitespace-pre-wrap leading-relaxed">{pedidoSeleccionado.cliente.medidas}</p>
                                           ) : (
                                              <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                                                {JSON.stringify(pedidoSeleccionado.cliente.medidas, null, 2).replace(/["{}]/g, '')}
                                              </pre>
                                           )
                                        ) : (
                                           <p className="text-gray-500 italic">No hay registro de medidas guardadas para este pedido.</p>
                                        )}
                                    </div>
                                </div>   
                            </div>
                        </div>

                    </div>
                    <div className="bg-white p-4 border-t flex justify-end shrink-0 rounded-b-2xl">
                        <button 
                            onClick={() => setPedidoSeleccionado(null)} 
                            className="px-6 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                        >
                        Cerrar Expediente
                       </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    </div>
    );
};

export default HistorialPedidos;