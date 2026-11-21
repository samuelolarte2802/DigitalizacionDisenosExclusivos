import {useState, useEffect} from 'react';
import clienteAxios from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

export default function NuevoPedidoWizard({ onClose }) {

    const [paso, setPaso] = useState(1);
    const [formData, setFormData] = useState({

        tipoCliente: 'Adulto',
        nombreCompleto: '',
        celular: '',
        aliasCliente: '',
        nombreResponsable: '',
        tipoProducto: '',
        piezas: [],
        totalPagar: '',
        abono: '',
        fechaEntrega: '',
        responsablePago: '',
        tipoTallaje: 'estandar',
        tallaEstandar: '',
        medidas: { pecho: '', cintura: '', cadera: '', largoEspalda: '' }
    
    });
    const usuario = useAuthStore((state) => state.usuario);
    const [guardando, setGuardando] = useState(false);
    const [hayCambios, setHayCambios] = useState(false);
    const [nuevaPieza, setNuevaPieza] = useState('');
    const [esClienteNuevo, setEsClienteNuevo] = useState(true);
    const [listaClientes, setListaClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [listaInstituciones, setListaInstituciones] = useState([]);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState('');
    const [listaPrecios, setListaPrecios] = useState([]);
    const [nuevaPiezaLibre, setNuevaPiezaLibre] = useState('');
    const [prendaSeleccionada, setPrendaSeleccionada] = useState('');
    const [tallaSeleccionada, setTallaSeleccionada] = useState('');
    const [cantidadPieza, setCantidadPieza] = useState(1);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [detalleArreglo, setDetalleArreglo] = useState('');
    const [numPersonasDotacion, setNumPersonasDotacion] = useState(1);
    const [empleadosDotacion, setEmpleadosDotacion] = useState([{

        nombre: '', tipoTallaje: 'estandar', tallaEstandar: '', 
        medidas: { pecho: '', cintura: '', cadera: '', largoEspalda: '' },
        cantidades: {} 

    }]);

    useEffect(() => {

      const cargarClientes = async () => {

        try{

          const respuesta = await clienteAxios.get('/clientes');
          setListaClientes(respuesta.data);
          const resInstituciones = await clienteAxios.get('/instituciones');
          console.log("✅ RESPUESTA INSTITUCIONES:", resInstituciones.data); // <-- Este chismoso nos dirá la verdad
          setListaInstituciones(resInstituciones.data);

        } catch (error){

          console.error("Error al cargar clientes: ", error);

        }
      };
      cargarClientes();
    }, []);

    useEffect(() => {
        const cargarPrecios = async () => {

            if (institucionSeleccionada) {

                try {

                    const resPrecios = await clienteAxios.get('/listasprecios');
                    const preciosFiltrados = resPrecios.data.filter(p => p.idInstitucion === parseInt(institucionSeleccionada));
                    setListaPrecios(preciosFiltrados);
                    setCategoriaSeleccionada('');
                    setPrendaSeleccionada('');
                    setTallaSeleccionada('');

                } catch (error) {

                    console.error("Error al cargar precios:", error);

                }
            } else {

                setListaPrecios([]);

            }
        };
        cargarPrecios();
    }, [institucionSeleccionada]);

    useEffect(() => {

        if (formData.tipoProducto === 'Uniforme' && formData.piezas.length > 0) {
          
            const total = formData.piezas.reduce((sum, p) => sum + (parseFloat(p.precio) || 0), 0);
            setFormData(prev => ({ ...prev, totalPagar: total }));

        }
    }, [formData.piezas, formData.tipoProducto]);

    const manejarCambio = (e) => {

        setHayCambios(true);
        const { name, value } = e.target;
        if (name === 'totalPagar' || name === 'abono') {

            const numeroLimpio = value.replace(/\./g, '');
            setFormData({ ...formData, [name]: numeroLimpio });

        } else {

            setFormData({ ...formData, [name]: value });

        }
    };

    const manejarCambioMedidas = (e) => {

        setHayCambios(true);
        setFormData({

            ...formData,
            medidas: { ...formData.medidas, [e.target.name]: e.target.value }

        });

    };
    const agregarPiezaLibre = () => {

        const cant = parseInt(cantidadPieza) || 1;
        if (nuevaPiezaLibre.trim() === '' || cant < 1) return;
        setHayCambios(true);
        let descripcionLimpia = nuevaPiezaLibre.trim();
        if (formData.tipoProducto === 'Arreglo' && detalleArreglo.trim() !== '') {

            descripcionLimpia = `${descripcionLimpia} - Arreglo: ${detalleArreglo.trim()}`;

        }
        const indiceExistente = formData.piezas.findIndex(p => p.descripcion.toLowerCase() === descripcionLimpia.toLowerCase());
        if (indiceExistente >= 0) {

            const nuevasPiezas = [...formData.piezas];
            nuevasPiezas[indiceExistente].cantidad += cant;
            setFormData({ ...formData, piezas: nuevasPiezas });

        } else {

            setFormData({ 

                ...formData, 
                piezas: [...formData.piezas, { 

                    descripcion: descripcionLimpia, 
                    precio: 0, 
                    precioUnitario: 0,
                    cantidad: cant 

                }] 
            });
        }
        setNuevaPiezaLibre('');
        setDetalleArreglo('');
        setCantidadPieza(1);
    };

    const manejarCambioNumEmpleados = (num) => {
        const cantidad = parseInt(num) || 1;
        setNumPersonasDotacion(cantidad);
        const nuevos = [...empleadosDotacion];
        if (cantidad > nuevos.length) {
            for (let i = nuevos.length; i < cantidad; i++) {
                nuevos.push({ nombre: '', tipoTallaje: 'estandar', tallaEstandar: '', medidas: { pecho: '', cintura: '', cadera: '', largoEspalda: '' }, cantidades: {} });
            }
        } else if (cantidad < nuevos.length) {
            nuevos.splice(cantidad);
        }
        setEmpleadosDotacion(nuevos);
    };

    const actualizarEmpleado = (index, campo, valor) => {
        const nuevos = [...empleadosDotacion];
        nuevos[index][campo] = valor;
        setEmpleadosDotacion(nuevos);
    };

    const actualizarMedidaEmpleado = (index, campo, valor) => {
        const nuevos = [...empleadosDotacion];
        nuevos[index].medidas[campo] = valor;
        setEmpleadosDotacion(nuevos);
    };

    const actualizarCantidadPrendaEmpleado = (index, prenda, cantidad) => {
        const nuevos = [...empleadosDotacion];
        nuevos[index].cantidades[prenda] = parseInt(cantidad) || 0;
        setEmpleadosDotacion(nuevos);
    };
    const agregarPiezaCatalogo = () => {

        const cant = parseInt(cantidadPieza) || 1;
        if (!prendaSeleccionada || !tallaSeleccionada) return;
        const tarifa = listaPrecios.find(p => p.tipoPrenda === prendaSeleccionada && p.talla === tallaSeleccionada);
        if (!tarifa) return;
        setHayCambios(true);
        const descripcionNueva = `${tarifa.tipoPrenda} (Talla ${tarifa.talla})`;
        const indiceExistente = formData.piezas.findIndex(p => p.descripcion === descripcionNueva);
        if (indiceExistente >= 0) {
            
            const nuevasPiezas = [...formData.piezas];
            nuevasPiezas[indiceExistente].cantidad += cant;
            nuevasPiezas[indiceExistente].precio = nuevasPiezas[indiceExistente].precioUnitario * nuevasPiezas[indiceExistente].cantidad;
            setFormData({ ...formData, piezas: nuevasPiezas });

        } else {
            
            setFormData({ 

                ...formData, 
                piezas: [...formData.piezas, { 

                    descripcion: descripcionNueva, 
                    precioUnitario: parseFloat(tarifa.precio),
                    precio: parseFloat(tarifa.precio) * cant,
                    cantidad: cant,
                    tallaBase: tarifa.talla

                }] 
            });
        }
        setTallaSeleccionada(''); 
        setCantidadPieza(1);
    };

    const eliminarPieza = (index) => {

        const listaActualizada = formData.piezas.filter((_, i) => i !== index);
        setFormData({ ...formData, piezas: listaActualizada });

    };

    const categoriasDisponibles = [...new Set(listaPrecios
        .filter(p => p.tipoPrenda.includes(' - '))
        .map(p => p.tipoPrenda.split(' - ')[0].trim())
    )];

    const prendasDisponibles = [...new Set(listaPrecios
        .filter(p => {
            if (categoriasDisponibles.length > 0 && categoriaSeleccionada) {
                return p.tipoPrenda.startsWith(categoriaSeleccionada + ' -');
            }
            // Si no hay categorías en la BD, muestra todo
            return categoriasDisponibles.length === 0; 
        })
        .map(p => p.tipoPrenda)
    )];

    // --- 2. ALGORITMO INTELIGENTE DE TALLAS ---
    const ordenTallasLetras = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, 'XXXL': 8 };
    const ordenarTallas = (a, b) => {

        const numA = parseInt(a);
        const numB = parseInt(b);
        const isNumA = !isNaN(numA);
        const isNumB = !isNaN(numB);
        if (isNumA && isNumB) return numA - numB;
        if (isNumA && !isNumB) return -1; 
        if (!isNumA && isNumB) return 1;  
        const valA = ordenTallasLetras[a.toUpperCase()] || 99;
        const valB = ordenTallasLetras[b.toUpperCase()] || 99;
        return valA - valB;

    };

    const tallasDisponibles = listaPrecios
        .filter(p => p.tipoPrenda === prendaSeleccionada)
        .map(p => p.talla)
        .sort(ordenarTallas);
    const validarPasoActual = () => {

        if (paso === 1) {

            if (esClienteNuevo) {

                if (!formData.nombreCompleto.trim() || !formData.celular.trim()) {

                    alert("⚠️ Por favor, ingresa el Nombre Completo y el Celular.");
                    return false;

                }
                if ((formData.tipoCliente === 'Niño' || formData.tipoCliente === 'Empresa') && !formData.nombreResponsable.trim()) {

                    alert("⚠️ Para niños o empresas, debes indicar el adulto o contacto responsable.");
                    return false;

                }
            } else {

                if (!clienteSeleccionado) {

                    alert("⚠️ Por favor, selecciona un cliente de la lista.");
                    return false;

                }
            }
        }
        if (paso === 2) {

            if (!formData.tipoProducto) {

                alert("⚠️ Debes seleccionar un tipo de trabajo.");
                return false;

            }
            if (formData.tipoProducto === 'Uniforme' && !institucionSeleccionada) {

                alert("⚠️ Has seleccionado Uniforme. Debes escoger la Institución/Colegio.");
                return false;

            }
        }
        if (paso === 3 && formData.piezas.length === 0) {

            alert("⚠️ Por favor, agrega al menos una pieza al pedido.");
            return false;

        }
        if (paso === 5) {

            if (formData.totalPagar === '' || formData.abono === '' || !formData.fechaEntrega) {

                alert("⚠️ Debes ingresar el Total, el Abono y seleccionar una Fecha de Entrega.");
                return false;

            }
            if (!formData.fechaEntrega || formData.fechaEntrega.trim() === '') {

                alert("⚠️ ALERTA: Debes seleccionar una Fecha de Entrega obligatoriamente.");
                return false;

            }
        }
        return true;
    };

    const siguientePaso = () => {

        if (validarPasoActual()){

            setPaso(paso + 1);

        }
    };

    const pasoAnterior = () => setPaso(paso - 1);

    const intentarCerrar = (e) => {

        if (e){

            e.preventDefault();
            e.stopPropagation();

        }

        if (hayCambios){

            const confirmar = window.confirm("No se ha guardado el pedido. ¿Estás seguro de que deseas salir y perder los datos ingresados?");
            if (!confirmar){

                return;

            }

        }
        onClose();
    };

    const guardarPedidoCompleto = async () => {

      setGuardando(true);
      
      try {

        let idParaPedido = clienteSeleccionado;

        if (esClienteNuevo) {

          const payloadCliente = {

            nombreCompleto: formData.nombreCompleto,
            celular: formData.celular,
            aliasCliente: formData.aliasCliente,
            tipoCliente: formData.tipoCliente,
            nombreResponsable: formData.nombreResponsable,
            fechaRegistro: new Date().toISOString(),
            medidas: formData.tipoTallaje === 'estandar'
                ? { tipo: 'estandar', talla: formData.tallaEstandar }
                : formData.medidas

          };
          const resCliente = await clienteAxios.post('/clientes', payloadCliente);
          idParaPedido = resCliente.data.idCliente;
        }

        const totalFinal = parseFloat(String(formData.totalPagar || "0").replace(/\./g, '')) || 0;
        const abonoFinal = parseFloat(String(formData.abono || "0").replace(/\./g, '')) || 0;
        let estadoPagoCalculado = "Pendiente";
        if (abonoFinal > 0) {

          estadoPagoCalculado = abonoFinal >= totalFinal ? "Pagado" : "Abonado";          

        }

        const payloadPedido = {

          idCliente: idParaPedido,
          idUsuario: usuario?.idUsuario || 1, 
          tipoProducto: formData.tipoProducto,
          piezas: formData.tipoProducto === 'Dotacion' 
                        ? empleadosDotacion.map(emp => ({ ...emp, isDotacion: true })) 
                        : formData.piezas,
          medidas_especificas: formData.tipoTallaje === 'medida' && formData.tipoProducto !== 'Dotacion'
                        ? formData.medidas 
                        : {},
          fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega).toISOString() : null,
          responsablePago: formData.responsablePago || formData.nombreResponsable,
          fechaPedido: new Date().toISOString(),
          totalPagar: parseFloat(formData.totalPagar) || 0,
          abono: parseFloat(formData.abono) || 0,
          estado: "En Corte",
          estadoPago: estadoPagoCalculado

        };

        await clienteAxios.post('/pedidos', payloadPedido);

        alert("¡Pedido registrado con éxito!");
        setHayCambios(false);
        onClose();

      } catch (error) {

        console.error("Error en la transacción:", error);
        alert("Hubo un error al comunicarse con el servidor. Revisa la consola.");

      } finally {

        setGuardando(false);

      }
    };

    const clientesFiltrados = listaClientes.filter(cliente => {

      const busqueda = terminoBusqueda.toLowerCase();
      return (

        cliente.nombreCompleto.toLowerCase().includes(busqueda) ||
        (cliente.aliasCliente && cliente.aliasCliente.toLowerCase().includes(busqueda)) ||
        cliente.celular.includes(busqueda)

      );
    })
    const formatearDinero = (valor) => {
        if (!valor) return "0";
        return new Intl.NumberFormat('es-CO').format(valor);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full h-auto max-h-[95vh] flex flex-col relative overflow-hidden">
          
          <button 
            type="button"
            onClick={intentarCerrar}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 z-20 bg-white shadow-sm border border-gray-100"
            title="Cerrar ventana"
          >
            ✕
          </button>

          <div className="p-8 pb-12 flex-1 overflow-y-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Pedido</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  Paso {paso} de 5
                </span>
              </div>
            
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-300"
                  style={{ width: `${((paso - 1) / 4) * 100}%` }}
                ></div>

                {[
                  { num: 1, label: "Cliente" },
                  { num: 2, label: "Producto" },
                  { num: 3, label: "Piezas" },
                  { num: 4, label: "Tallaje" },
                  { num: 5, label: "Pagos" }
                ].map((item) => (
                  <div key={item.num} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                        paso > item.num ? 'bg-blue-600 border-blue-600 text-white' : // Pasos completados
                        paso === item.num ? 'bg-white border-blue-600 text-blue-600 shadow-md ring-4 ring-blue-100' : // Paso actual
                        'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {paso > item.num ? '✓' : item.num}
                    </div>
                    <span className={`text-xs font-bold ${paso >= item.num ? 'text-gray-800' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {paso === 1 && (
              <div className="space-y-6 animate-fade-in">          
              <div className="flex gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setEsClienteNuevo(true)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 shadow-sm ${
                    esClienteNuevo 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <span className="text-3xl">✨</span>
                  <span className="font-bold text-lg">Cliente Nuevo</span>
                  <span className="text-xs opacity-75 text-center">Registrar a alguien por primera vez</span>
                </button>
              
                <button
                  type="button"
                  onClick={() => setEsClienteNuevo(false)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 shadow-sm ${
                    !esClienteNuevo 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200' 
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-3xl">🔍</span>
                  <span className="font-bold text-lg">Buscar Existente</span>
                  <span className="text-xs opacity-75 text-center">Elegir un cliente que ya nos ha comprado</span>
                </button>
              </div>

              {esClienteNuevo ? (
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-2 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                    <select name="tipoCliente" value={formData.tipoCliente} onChange={manejarCambio} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50 text-lg">
                      <option value="Adulto">Adulto</option>
                      <option value="Niño">Niño / Menor de edad</option>
                      <option value="Empresa">Empresa / Institución</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={manejarCambio} placeholder={formData.tipoCliente === 'Empresa' ? "Nombre de la empresa" : "Nombre del cliente"} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"/>
                  </div>
                  {(formData.tipoCliente === 'Niño' || formData.tipoCliente === 'Empresa') && (
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <label className="block text-sm font-bold text-blue-800 mb-1">{formData.tipoCliente === 'Niño' ? "Nombre del Padre / Adulto Responsable" : "Nombre del Contacto Encargado"}</label>
                      <input type="text" name="nombreResponsable" value={formData.nombreResponsable} onChange={manejarCambio} className="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"/>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Celular de Contacto</label>
                    <input type="text" name="celular" value={formData.celular} onChange={manejarCambio} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alias (Opcional)</label>
                    <input type="text" name="aliasCliente" value={formData.aliasCliente} onChange={manejarCambio} placeholder="Ej: La señora de la chaqueta" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"/>
                  </div>
                </div>
              
              ) : (
              
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in shadow-inner">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Escribe para buscar al cliente:</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xl">🔎</span>
                      <input 
                        type="text"
                        placeholder="Nombre, celular o alias..."
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-lg shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 mt-4">
                    {clientesFiltrados.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-dashed border-gray-300">
                        No se encontraron clientes con esos datos.
                      </div>
                    ) : (
                      clientesFiltrados.map(cliente => (
                        <div 
                          key={cliente.idCliente}
                          onClick={() => { setClienteSeleccionado(cliente.idCliente); setHayCambios(true); }}
                          className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-center ${
                            clienteSeleccionado === cliente.idCliente 
                              ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 hover:shadow'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-800 text-lg">{cliente.nombreCompleto}</p>
                            {clienteSeleccionado === cliente.idCliente && (
                              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">¡Seleccionado!</span>
                            )}
                          </div>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600 font-medium">
                              <span>📱 {cliente.celular}</span>
                              {cliente.aliasCliente && cliente.aliasCliente.trim() !== '' && cliente.aliasCliente !== cliente.nombreCompleto && <span>🏷️ {cliente.aliasCliente}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Clasificación del Pedido</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué tipo de trabajo se va a realizar?</label>
                  <select 
                    name="tipoProducto" 
                    value={formData.tipoProducto} 
                    onChange={manejarCambio}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-gray-50"
                  >
                    <option value="">-- Selecciona una opción --</option>
                    <option value="Uniforme">Uniforme</option>
                    <option value="Arreglo">Arreglo / Modificación</option>
                    <option value="Dotacion">Dotación</option>
                    <option value="Prenda Especifica">Prenda Específica (Vestido, Chaqueta, etc.)</option>
                  </select>
                </div>
                {formData.tipoProducto === 'Uniforme' && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fade-in mt-4">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Selecciona la Institución / Colegio:</label>
                    <select 
                      value={institucionSeleccionada} 
                      onChange={(e) => setInstitucionSeleccionada(e.target.value)}
                      className="w-full rounded-md border-blue-300 shadow-sm p-3 border text-lg focus:ring-blue-500"
                    >
                      <option value="">-- Escoge un colegio --</option>
                      {listaInstituciones && listaInstituciones.length > 0 ? (
                          listaInstituciones.map(inst => (
                            <option key={inst.idInstitucion || inst.id} value={inst.idInstitucion || inst.id}>
                              {inst.nombre || inst.nombreInstitucion || "Colegio sin nombre"}
                            </option>
                          ))
                      ) : (
                          <option value="" disabled>Cargando colegios o BD vacía...</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Armar el Pedido</h3>
                {formData.tipoProducto === 'Uniforme' && institucionSeleccionada ? (
                  <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
                    {categoriasDisponibles.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-600 mb-2">Selecciona el tipo de uniforme:</label>
                            <div className="flex gap-2 flex-wrap">
                                {categoriasDisponibles.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setCategoriaSeleccionada(cat);
                                            setPrendaSeleccionada('');
                                            setTallaSeleccionada('');
                                        }}
                                        className={`px-4 py-2 rounded-md font-bold transition-all shadow-sm ${categoriaSeleccionada === cat ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-[2]">
                            <label className="block text-xs font-bold text-gray-600 mb-1">1. Prenda</label>
                            <select value={prendaSeleccionada} onChange={(e) => { setPrendaSeleccionada(e.target.value); setTallaSeleccionada(''); }} disabled={categoriasDisponibles.length > 0 && !categoriaSeleccionada} className="w-full p-2 border rounded-md bg-gray-50 disabled:opacity-50">
                                <option value="">-- Elige prenda --</option>
                                {prendasDisponibles.map(p => {
                                    const nombreLimpio = p.includes(' - ') ? p.split(' - ')[1].trim() : p;
                                    return <option key={p} value={p}>{nombreLimpio}</option>
                                })}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-600 mb-1">2. Talla</label>
                            <select value={tallaSeleccionada} onChange={(e) => setTallaSeleccionada(e.target.value)} disabled={!prendaSeleccionada} className="w-full p-2 border rounded-md bg-gray-50 disabled:opacity-50">
                                <option value="">-- Talla --</option>
                                {tallasDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cant.</label>
                            <input type="number" min="1" value={cantidadPieza} onChange={(e) => setCantidadPieza(e.target.value)} className="w-full p-2 border rounded-md font-bold text-center" />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={agregarPiezaCatalogo} disabled={!tallaSeleccionada} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium px-5 py-2.5 rounded-md">
                                + Añadir
                            </button>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className={formData.tipoProducto === 'Arreglo' ? "flex-1" : "flex-[2]"}>
                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                {formData.tipoProducto === 'Arreglo' ? 'Prenda' : 'Descripción de la Prenda'}
                            </label>
                            <input 
                                type="text" 
                                value={nuevaPiezaLibre} 
                                onChange={(e) => setNuevaPiezaLibre(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPiezaLibre())} 
                                placeholder={formData.tipoProducto === 'Arreglo' ? "Ej: Pantalón Jean" : "Ej: Vestido de gala a medida..."} 
                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500"
                            />
                        </div>

                        {formData.tipoProducto === 'Arreglo' && (
                            <div className="flex-[2]">
                                <label className="block text-xs font-bold text-gray-600 mb-1">¿Qué se le va a hacer?</label>
                                <input 
                                    type="text" 
                                    value={detalleArreglo} 
                                    onChange={(e) => setDetalleArreglo(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPiezaLibre())} 
                                    placeholder="Ej: Coger dobladillo 2cm y ajustar cintura" 
                                    className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {formData.tipoProducto !== 'Dotacion' && (
                            <div className="w-20">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Cant.</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={cantidadPieza} 
                                    onChange={(e) => setCantidadPieza(e.target.value)} 
                                    className="w-full p-2.5 border border-gray-300 rounded-md font-bold text-center" 
                                />
                            </div>
                        )}
                        <div className="flex items-end">
                            <button 
                                type="button" 
                                onClick={agregarPiezaLibre} 
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
                            >
                              + Añadir
                            </button>
                        </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-md border border-gray-200 min-h-[150px] p-4">
                  {formData.piezas.length === 0 ? (
                    <p className="text-gray-400 text-center mt-6 text-sm">Aún no has agregado piezas al pedido.</p>
                  ) : (
                    <ul className="space-y-2">
                      {formData.piezas.map((pieza, index) => (
                        <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <div>
                            <span className="text-gray-700 font-bold block flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">{pieza.cantidad || 1}x</span>
                                {pieza.descripcion}
                            </span>
                            {pieza.precio > 0 && <span className="text-emerald-600 text-sm font-semibold block mt-1">$ {formatearDinero(pieza.precio)}</span>}
                          </div>
                          <button onClick={() => eliminarPieza(index)} className="text-red-500 hover:bg-red-50 font-bold px-3 py-1 rounded-md">✕ Quitar</button>
                        </li>
                      ))}
                    </ul>
                  )}  
                </div>
              </div>
            )}

            {paso === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Especificaciones de Tallaje</h3>

                {formData.tipoProducto === 'Dotacion' ? (
                  <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm animate-fade-in">
                      <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                          <label className="font-bold text-indigo-900 flex-1">¿A cuántas personas se les entregará dotación?</label>
                          <input type="number" min="1" value={numPersonasDotacion} onChange={(e) => manejarCambioNumEmpleados(e.target.value)} className="w-24 p-2 rounded-md border-2 border-indigo-300 text-center font-bold text-lg" />
                      </div>

                      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                         {empleadosDotacion.map((emp, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm relative">
                               <h4 className="font-bold text-indigo-800 mb-3 border-b pb-2">👤 Persona #{i + 1}</h4>
                               <input type="text" placeholder="Nombre completo del empleado" value={emp.nombre} onChange={(e) => actualizarEmpleado(i, 'nombre', e.target.value)} className="w-full mb-4 p-2.5 border rounded-md font-medium bg-gray-50 focus:bg-white" />
                               
                               <div className="flex gap-6 mb-4">
                                   <label className="flex items-center gap-2 cursor-pointer font-medium text-sm"><input type="radio" className="w-4 h-4 text-indigo-600" checked={emp.tipoTallaje === 'estandar'} onChange={() => actualizarEmpleado(i, 'tipoTallaje', 'estandar')} /> Talla Estándar</label>
                                   <label className="flex items-center gap-2 cursor-pointer font-medium text-sm"><input type="radio" className="w-4 h-4 text-indigo-600" checked={emp.tipoTallaje === 'medida'} onChange={() => actualizarEmpleado(i, 'tipoTallaje', 'medida')} /> A Medida</label>
                               </div>

                               {emp.tipoTallaje === 'estandar' ? (
                                   <select value={emp.tallaEstandar} onChange={(e) => actualizarEmpleado(i, 'tallaEstandar', e.target.value)} className="w-full mb-4 p-2.5 border rounded-md bg-white">
                                       <option value="">-- Selecciona Talla --</option>
                                       <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                                       <option value="28">28 (Pantalón)</option><option value="30">30 (Pantalón)</option><option value="32">32 (Pantalón)</option><option value="34">34 (Pantalón)</option>
                                   </select>
                               ) : (
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                       <input type="number" placeholder="Pecho (cm)" value={emp.medidas.pecho} onChange={(e) => actualizarMedidaEmpleado(i, 'pecho', e.target.value)} className="p-2 border rounded text-center text-sm" />
                                       <input type="number" placeholder="Cintura (cm)" value={emp.medidas.cintura} onChange={(e) => actualizarMedidaEmpleado(i, 'cintura', e.target.value)} className="p-2 border rounded text-center text-sm" />
                                       <input type="number" placeholder="Cadera (cm)" value={emp.medidas.cadera} onChange={(e) => actualizarMedidaEmpleado(i, 'cadera', e.target.value)} className="p-2 border rounded text-center text-sm" />
                                       <input type="number" placeholder="Espalda (cm)" value={emp.medidas.largoEspalda} onChange={(e) => actualizarMedidaEmpleado(i, 'largoEspalda', e.target.value)} className="p-2 border rounded text-center text-sm" />
                                   </div>
                               )}

                               <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                   <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">📦 Prendas a entregar a esta persona</p>
                                   {formData.piezas.map((piezaBase, j) => (
                                       <div key={j} className="flex justify-between items-center mb-2 bg-white p-2 rounded shadow-sm border border-gray-100">
                                           <span className="text-sm font-bold text-gray-800">{piezaBase.descripcion}</span>
                                           <div className="flex items-center gap-2">
                                               <span className="text-xs text-gray-500">Cant:</span>
                                               <input type="number" min="0" placeholder="0" value={emp.cantidades[piezaBase.descripcion] || ''} onChange={(e) => actualizarCantidadPrendaEmpleado(i, piezaBase.descripcion, e.target.value)} className="w-16 p-1.5 border-2 border-gray-300 rounded text-center font-bold" />
                                           </div>
                                       </div>
                                   ))}
                                   {formData.piezas.length === 0 && <p className="text-xs text-red-500 font-bold">⚠️ Vuelve al Paso 3 y agrega las prendas base (Ej: Camisa, Pantalón).</p>}
                               </div>
                            </div>
                         ))}
                      </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-100 p-4 rounded-md mb-6">
                      <h4 className="text-sm font-bold text-gray-600 mb-2">Resumen de Prendas:</h4>
                      <ul className="list-disc pl-5 text-gray-800 text-sm">
                        {formData.piezas.map((p, i) => <li key={i}>{p.cantidad || 1}x {p.descripcion}</li>)}
                      </ul>
                    </div>

                    <div className="flex justify-center mb-4">
                      <button type="button" onClick={() => setFormData({...formData, tipoTallaje: formData.tipoTallaje === 'medida' ? 'estandar' : 'medida'})} className={`px-6 py-2 rounded-full font-bold border-2 transition-colors ${formData.tipoTallaje === 'medida' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}>
                        {formData.tipoTallaje === 'medida' ? '✕ Cerrar Medidas' : '📏 + Añadir Medidas Personalizadas'}
                      </button>
                    </div>

                    {formData.tipoTallaje === 'medida' && (
                      <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-sm animate-fade-in">
                        <h4 className="text-sm text-gray-500 mb-4 text-center">Ingresa las medidas en cm (Opcional)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <input type="number" name="pecho" placeholder="Pecho" value={formData.medidas.pecho || ''} onChange={manejarCambioMedidas} className="w-full text-center rounded border-gray-300 p-2 border" />
                          <input type="number" name="cintura" placeholder="Cintura" value={formData.medidas.cintura || ''} onChange={manejarCambioMedidas} className="w-full text-center rounded border-gray-300 p-2 border" />
                          <input type="number" name="cadera" placeholder="Cadera" value={formData.medidas.cadera || ''} onChange={manejarCambioMedidas} className="w-full text-center rounded border-gray-300 p-2 border" />
                          <input type="number" name="largoEspalda" placeholder="Espalda" value={formData.medidas.largoEspalda || ''} onChange={manejarCambioMedidas} className="w-full text-center rounded border-gray-300 p-2 border" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {paso === 5 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Valores y Tiempos de Entrega</h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <label className="block text-sm font-bold text-emerald-900 mb-1">Total a Pagar ($)</label>
                    <input 
                      type="text" 
                      name="totalPagar" 
                      value={formData.totalPagar ? formatearDinero(formData.totalPagar) : ''} 
                      onChange={manejarCambio} 
                      className="w-full rounded-md border-emerald-300 shadow-sm focus:border-emerald-500 p-2.5 border text-xl font-bold text-emerald-800 bg-white"
                    />
                  </div>

                  <div className="p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abono Inicial ($)</label>
                    <input 
                      type="text" 
                      name="abono" 
                      value={formData.abono ? formatearDinero(formData.abono) : ''} 
                      onChange={manejarCambio} 
                      placeholder="0 si no abona"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 p-2.5 border text-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
                    <input 
                      type="date" 
                      name="fechaEntrega" 
                      value={formData.fechaEntrega || ''}
                      onChange={manejarCambio} 
                      className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable del Pago</label>
                    <input 
                      type="text" 
                      name="responsablePago" 
                      value={formData.responsablePago || ''} 
                      onChange={manejarCambio} 
                      placeholder={formData.nombreResponsable ? formData.nombreResponsable : "Ej: Mamá, etc."}
                      className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}       
          </div>
          
          <div className="p-5 sm:px-8 bg-gray-50 border-t flex justify-between items-center shrink-0">
            <button type="button" onClick={(e) => paso === 1 ? intentarCerrar(e) : pasoAnterior()} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100">
              {paso === 1 ? "Cancelar" : "← Anterior"}
            </button>
        
            <button type="button" disabled={guardando} onClick={paso === 5 ? guardarPedidoCompleto : siguientePaso} className={`px-6 py-2.5 font-medium rounded-md text-white shadow-sm ${guardando ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {paso === 5 ? (guardando ? "Guardando..." : "Finalizar Pedido") : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    );
}