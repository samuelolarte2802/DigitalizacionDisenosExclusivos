import { useState } from 'react';
import clienteAxios from '../api/axiosConfig';


export default function FormularioCliente({ onClose }) {
    
    const [cliente, setCliente] = useState({

        nombreCompleto: '',
        celular: '',
        aliasCliente: ''

    });

    const [medidas, setMedidas] = useState({

        pecho: '',
        cintura: '',
        cadera: '',
        largoEspalda: ''

    });

    const manejarCambioCliente = (e) => {

        setCliente({ ...cliente, [e.target.name]: e.target.value });

    };

    const manejarCambioMedidas = (e) => {

        setMedidas({ ...medidas, [e.target.name]: e.target.value });

    };

    const guardarCliente = async (e) => {

        e.preventDefault();
        const payload = {

            nombreCompleto: cliente.nombreCompleto,
            celular: cliente.celular,
            aliasCliente: cliente.aliasCliente ? cliente.aliasCliente : cliente.nombreCompleto,
            fechaRegistro: new Date().toISOString(),
            medidas: JSON.stringify(medidas)

        };

        try {

            await clienteAxios.post('/clientes', payload);
            alert("¡Cliente y tallaje guardados con éxito!.");
            onClose();

        } catch (error) {

            console.error('Error al guardar el cliente:', error);
            alert("Hubo un error al conectar con la base de datos. Resiva la consola para más detalles.");

        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded shadow-md max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Cliente</h2>   

                <form onSubmit={guardarCliente} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" name="nombreCompleto" onChange={manejarCambioCliente} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Celular</label>
                            <input type="text" name="celular" onChange={manejarCambioCliente} required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"/>
                        </div>
                        <div className="md:col-span-2"> 
                            <label className="block text-sm font-medium text-gray-700">Alias (Opcional)</label>
                            <input type="text" name="aliasCliente" onChange={manejarCambioCliente} placeholder="Ej. La señora de la chaqueta..."
                                className="mt-01 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"/>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <h3 className="text-lg font-semibold text-gray-700">Medidas (cm)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500">Pecho</label>
                            <input type="number" name="pecho" onChange={manejarCambioMedidas}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Cintura</label>
                            <input type="number" name="cintura" onChange={manejarCambioMedidas}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Cadera</label>
                            <input type="number" name="cadera" onChange={manejarCambioMedidas}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Espalda</label>
                            <input type="number" name="largoEspalda" onChange={manejarCambioMedidas}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={onClose} 
                            className="font-medium text-gray-700 hover:text-gray-900">
                            Cancelar
                        </button>
                        <button type="submit"
                            className="bg-[#1d4ed8] text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700">
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}