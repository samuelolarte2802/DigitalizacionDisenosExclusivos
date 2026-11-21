import { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';

const TALLAS_SUGERIDAS = ['6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL'];

const ListasPrecios = ({ onClose }) => {
  const [instituciones, setInstituciones] = useState([]);
  const [todosLosPrecios, setTodosLosPrecios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de navegación y edición
  const [instSeleccionada, setInstSeleccionada] = useState(null);
  const [anioActivo, setAnioActivo] = useState(new Date().getFullYear());
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const [tabActivo, setTabActivo] = useState('Diario');

  const [preciosEditables, setPreciosEditables] = useState([]);
  const [prendasColumnas, setPrendasColumnas] = useState([]);
  const [tallasActivas, setTallasActivas] = useState([]);

  // Estados para Modales
  const [modalInstAbierto, setModalInstAbierto] = useState(false);
  const [nuevaInst, setNuevaInst] = useState({ nombre: '', descripcion: '' });
  
  const [modalPrendaAbierto, setModalPrendaAbierto] = useState(false);
  const [nuevaPrenda, setNuevaPrenda] = useState({ categoria: 'Diario', nombre: '' });

  const [modalTallaAbierto, setModalTallaAbierto] = useState(false);
  const [nuevaTalla, setNuevaTalla] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    cargarDatosGenerales();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const cargarDatosGenerales = async () => {
    try {
      setCargando(true);
      const [resInst, resPrecios] = await Promise.all([
        clienteAxios.get('/instituciones'),
        clienteAxios.get('/listasprecios')
      ]);
      setInstituciones(resInst.data);
      setTodosLosPrecios(resPrecios.data);
      
      if (instSeleccionada) {
        const instActualizada = resInst.data.find(i => i.idInstitucion === instSeleccionada.idInstitucion);
        if (instActualizada) seleccionarInstitucion(instActualizada, resPrecios.data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // --- EL CEREBRO ORDENADOR DE TALLAS ---
  const ordenarTallas = (arrayTallas) => {
    const ordenLetras = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    
    return [...arrayTallas].sort((a, b) => {
      // Verificamos si son números puros
      const esNumA = !isNaN(a) && a.trim() !== '';
      const esNumB = !isNaN(b) && b.trim() !== '';

      if (esNumA && esNumB) {
        return Number(a) - Number(b); // Ambos son números: de menor a mayor
      }
      if (esNumA && !esNumB) {
        return -1; // 'a' es número y 'b' es letra: el número va arriba
      }
      if (!esNumA && esNumB) {
        return 1; // 'a' es letra y 'b' es número: el número va arriba
      }
      
      // Si ambos son letras, usamos el orden lógico de la ropa
      const indexA = ordenLetras.indexOf(a);
      const indexB = ordenLetras.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Fallback por si escriben algo raro
      return a.localeCompare(b);
    });
  };

  const seleccionarInstitucion = (institucion, preciosGlobales = todosLosPrecios) => {
    setInstSeleccionada(institucion);
    setModoEdicion(false);
    setTabActivo('Diario'); 
    
    const preciosFiltrados = preciosGlobales.filter(
      p => p.idInstitucion === institucion.idInstitucion && p.anioVigencia === anioActivo
    );
    
    setPreciosEditables(preciosFiltrados);
    
    const prendasUnicas = Array.from(new Set(preciosFiltrados.map(p => p.tipoPrenda)));
    setPrendasColumnas(prendasUnicas);

    const tallasBD = Array.from(new Set(preciosFiltrados.map(p => p.talla)));
    
    // Al cargar de la BD, también ordenamos automáticamente
    setTallasActivas(tallasBD.length > 0 ? ordenarTallas(tallasBD) : [...TALLAS_SUGERIDAS]);
  };

  const parsearPrenda = (tipoRaw) => {
    if (tipoRaw.startsWith('Diario - ')) return { cat: 'Diario', nombreLimpiado: tipoRaw.replace('Diario - ', '') };
    if (tipoRaw.startsWith('Sudadera - ')) return { cat: 'Sudadera', nombreLimpiado: tipoRaw.replace('Sudadera - ', '') };
    return { cat: 'General', nombreLimpiado: tipoRaw };
  };

  const columnasVisibles = prendasColumnas.filter(prendaRaw => parsearPrenda(prendaRaw).cat === tabActivo);

  const handleCambioPrecio = (talla, prendaRaw, nuevoValor) => {
    const valorNumerico = parseFloat(nuevoValor) || 0;
    setPreciosEditables(prev => {
      const copia = [...prev];
      const indice = copia.findIndex(p => p.talla === talla && p.tipoPrenda === prendaRaw);

      if (indice >= 0) {
        copia[indice].precio = valorNumerico;
      } else {
        copia.push({
          idPrecio: 0,
          idInstitucion: instSeleccionada.idInstitucion,
          tipoPrenda: prendaRaw,
          talla: talla,
          precio: valorNumerico,
          anioVigencia: anioActivo
        });
      }
      return copia;
    });
  };

  // --- ACCIONES DE TALLAS CON ORDENAMIENTO AUTOMÁTICO ---
  const confirmarNuevaTalla = () => {
    if (!nuevaTalla.trim()) return;
    const tallaLimpia = nuevaTalla.trim().toUpperCase();
    if (!tallasActivas.includes(tallaLimpia)) {
      // Agregamos y enviamos al cerebro ordenador
      const nuevoArregloTallas = [...tallasActivas, tallaLimpia];
      setTallasActivas(ordenarTallas(nuevoArregloTallas));
      setModoEdicion(true);
    }
    setModalTallaAbierto(false);
    setNuevaTalla('');
  };

  const eliminarTalla = (tallaAEliminar) => {
    if(window.confirm(`¿Quitar la talla ${tallaAEliminar} de la tabla?`)) {
      setTallasActivas(tallasActivas.filter(t => t !== tallaAEliminar));
      setPreciosEditables(prev => prev.map(p => 
        p.talla === tallaAEliminar ? { ...p, precio: 0 } : p
      ));
    }
  };

  const confirmarNuevaPrenda = () => {
    if (!nuevaPrenda.nombre.trim()) return;
    const prendaCompuesta = `${nuevaPrenda.categoria} - ${nuevaPrenda.nombre.trim()}`;
    if (!prendasColumnas.includes(prendaCompuesta)) {
      setPrendasColumnas([...prendasColumnas, prendaCompuesta]);
      setTabActivo(nuevaPrenda.categoria); 
      setModoEdicion(true); 
    }
    setModalPrendaAbierto(false);
    setNuevaPrenda({ categoria: 'Diario', nombre: '' });
  };

  const guardarNuevaInstitucion = async (e) => {
    e.preventDefault();
    try {
      await clienteAxios.post('/instituciones', nuevaInst);
      setModalInstAbierto(false);
      setNuevaInst({ nombre: '', descripcion: '' });
      await cargarDatosGenerales();
    } catch (error) {
      alert("Hubo un error al crear la institución.");
    }
  };

  const guardarMatriz = async () => {
    setGuardando(true);
    try {
      const promesas = preciosEditables.map(p => {
        if (p.precio > 0) {
          return p.idPrecio === 0 
            ? clienteAxios.post('/listasprecios', p) 
            : clienteAxios.put(`/listasprecios/${p.idPrecio}`, p);
        } else if (p.idPrecio > 0 && p.precio === 0) {
          return clienteAxios.delete(`/listasprecios/${p.idPrecio}`);
        }
        return null;
      }).filter(Boolean); 

      await Promise.all(promesas);
      alert("¡Lista de precios guardada con éxito!");
      await cargarDatosGenerales();
      setModoEdicion(false);
    } catch (error) {
      alert("Hubo un error al guardar la matriz de precios.");
    } finally {
      setGuardando(false);
    }
  };

  const buscarPrecioEnMatriz = (talla, prendaRaw) => {
    const registro = preciosEditables.find(p => p.talla === talla && p.tipoPrenda === prendaRaw);
    return registro && registro.precio > 0 ? registro.precio : '';
  };

  const formatoPlata = (valor) => {
    if (!valor || valor === 0) return '-';
    return parseFloat(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-40 overflow-y-auto w-full h-full">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-blue-600 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Catálogo y Tarifas</h2>
            <p className="text-sm text-gray-500">Gestión de listas de precios por colegio</p>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition">
            Volver al Menú
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
              <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-900">Instituciones</h3>
                <button 
                  onClick={() => setModalInstAbierto(true)}
                  className="bg-blue-600 text-white w-8 h-8 rounded-full font-bold hover:bg-blue-700 flex items-center justify-center shadow-sm"
                >+</button>
              </div>
              <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                {cargando ? (
                  <p className="p-4 text-center text-gray-500 text-sm">Cargando...</p>
                ) : instituciones.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">No hay colegios creados.</p>
                ) : (
                  instituciones.map(inst => (
                    <button 
                      key={inst.idInstitucion}
                      onClick={() => seleccionarInstitucion(inst)}
                      className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${instSeleccionada?.idInstitucion === inst.idInstitucion ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                    >
                      <p className="font-bold text-gray-800">{inst.nombre}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{inst.descripcion || 'Sin descripción'}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {instSeleccionada ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                <div className="bg-gray-900 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      🏫 {instSeleccionada.nombre}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {!modoEdicion ? (
                      <button onClick={() => setModoEdicion(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors">
                        ✏️ Activar Edición
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setModalTallaAbierto(true)} className="px-3 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition-colors">
                          + Talla
                        </button>
                        <button onClick={() => setModalPrendaAbierto(true)} className="px-3 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors">
                          + Prenda
                        </button>
                        <button onClick={() => seleccionarInstitucion(instSeleccionada)} className="px-3 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-500 transition-colors" disabled={guardando}>
                          Cancelar
                        </button>
                        <button onClick={guardarMatriz} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2" disabled={guardando}>
                          {guardando ? 'Guardando...' : '💾 Guardar Todo'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex border-b border-gray-200 bg-gray-50">
                  <button 
                    onClick={() => setTabActivo('Diario')}
                    className={`flex-1 py-3 font-bold text-sm transition-colors border-b-2 ${tabActivo === 'Diario' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    👔 Uniforme de Diario
                  </button>
                  <button 
                    onClick={() => setTabActivo('Sudadera')}
                    className={`flex-1 py-3 font-bold text-sm transition-colors border-b-2 ${tabActivo === 'Sudadera' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    🏃 Sudadera Deportiva
                  </button>
                </div>

                <div className="overflow-x-auto p-1">
                  {columnasVisibles.length === 0 && !modoEdicion ? (
                    <div className="text-center py-16 bg-white text-gray-500">
                      <span className="text-4xl mb-3 block">👕</span>
                      <p className="font-bold text-lg mb-2">No hay prendas en esta categoría.</p>
                      <button onClick={() => setModoEdicion(true)} className="text-blue-600 hover:underline">
                        Activa la edición para agregar la primera prenda.
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm border-b-2 border-gray-300">
                          <th className="p-3 border-r font-bold bg-gray-200 w-28 text-center sticky left-0 z-10 shadow-sm">Talla</th>
                          {columnasVisibles.map((prendaRaw, i) => (
                            <th key={i} className="p-3 font-bold text-center border-r min-w-[120px] bg-gray-50 text-blue-900">
                              {parsearPrenda(prendaRaw).nombreLimpiado}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tallasActivas.map(talla => (
                          <tr key={talla} className="hover:bg-blue-50 border-b transition-colors group">
                            <td className="p-3 border-r font-black bg-gray-50 text-gray-800 sticky left-0 z-10 group-hover:bg-blue-100 shadow-sm">
                              <div className="flex items-center justify-between px-2">
                                <span>{talla}</span>
                                {modoEdicion && (
                                  <button onClick={() => eliminarTalla(talla)} className="text-red-400 hover:text-red-600 text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center border border-red-200" title="Quitar talla">✕</button>
                                )}
                              </div>
                            </td>
                            {columnasVisibles.map((prendaRaw, i) => {
                              const valorActual = buscarPrecioEnMatriz(talla, prendaRaw);
                              return (
                                <td key={i} className="p-2 border-r text-center">
                                  {modoEdicion ? (
                                    <input 
                                      type="number"
                                      value={valorActual}
                                      onChange={(e) => handleCambioPrecio(talla, prendaRaw, e.target.value)}
                                      className="w-full p-2 border border-blue-200 rounded text-center focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                                      placeholder="0"
                                    />
                                  ) : (
                                    <span className="font-medium text-gray-700">{formatoPlata(valorActual)}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-5xl mb-4">🏫</span>
                <p className="text-lg font-medium text-gray-500">Selecciona una institución para gestionar sus precios.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- MODALES --- */}
        {modalInstAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-blue-900 p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">🏫 Nuevo Colegio</h3>
                <button onClick={() => setModalInstAbierto(false)} className="text-blue-300 hover:text-white font-bold text-xl">✕</button>
              </div>
              <form onSubmit={guardarNuevaInstitucion} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nombre de la Institución</label>
                  <input type="text" required value={nuevaInst.nombre} onChange={e => setNuevaInst({...nuevaInst, nombre: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Colegio San Miguel" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Descripción o Sede (Opcional)</label>
                  <input type="text" value={nuevaInst.descripcion} onChange={e => setNuevaInst({...nuevaInst, descripcion: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Sede Principal Centro" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                  <button type="button" onClick={() => setModalInstAbierto(false)} className="px-5 py-2.5 text-gray-600 font-bold rounded-lg hover:bg-gray-100">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Crear Colegio</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalTallaAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="bg-purple-900 p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">📏 Agregar Talla</h3>
                <button onClick={() => setModalTallaAbierto(false)} className="text-purple-300 hover:text-white font-bold text-xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nombre de la Talla</label>
                  <input type="text" value={nuevaTalla} onChange={e => setNuevaTalla(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Ej. 2, 4, XXL..." />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                  <button onClick={() => setModalTallaAbierto(false)} className="px-5 py-2.5 text-gray-600 font-bold rounded-lg hover:bg-gray-100">Cancelar</button>
                  <button onClick={confirmarNuevaTalla} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Agregar Fila</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modalPrendaAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="bg-gray-800 p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">👕 Agregar Prenda</h3>
                <button onClick={() => setModalPrendaAbierto(false)} className="text-gray-400 hover:text-white font-bold text-xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">¿A qué conjunto pertenece?</label>
                  <select value={nuevaPrenda.categoria} onChange={e => setNuevaPrenda({...nuevaPrenda, categoria: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium">
                    <option value="Diario">👔 Uniforme de Diario</option>
                    <option value="Sudadera">🏃 Sudadera Deportiva</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nombre de la Prenda</label>
                  <input type="text" value={nuevaPrenda.nombre} onChange={e => setNuevaPrenda({...nuevaPrenda, nombre: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Jardinera, Falda, Pantalón..." />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                  <button onClick={() => setModalPrendaAbierto(false)} className="px-5 py-2.5 text-gray-600 font-bold rounded-lg hover:bg-gray-100">Cancelar</button>
                  <button onClick={confirmarNuevaPrenda} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Agregar Columna</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ListasPrecios;