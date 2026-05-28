import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({

    idCliente: '',
    totalPagar: '',
    abono: ''

  });
  const navigate = useNavigate();
  const handleLogout = () => {

    navigate('/'); 

  };

  const API_URL = "https://localhost:7242/api/pedidos";

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(API_URL);
      setPedidos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCrearPedido = async (e) => {
    e.preventDefault();
    try {

      const nuevoPedido = {

        idCliente: parseInt(formData.idCliente),
        fechaPedido: new Date().toISOString(),
        totalPagar: parseFloat(formData.totalPagar),
        abono: parseFloat(formData.abono),
        idUsuario: 1,
        estado: "En Corte",
        estadoPago: formData.abono >= formData.totalPagar ? "Pagado" : "Abonado"

      };

      await axios.post(API_URL, nuevoPedido);
      
      setIsModalOpen(false);
      setFormData({ idCliente: '', totalPagar: '', abono: '' });
      fetchPedidos(); 
      
    } catch (error) {

      console.error("Error al crear el pedido:", error);
      alert("Hubo un error al guardar el pedido. Revisa la consola.");

    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-semibold">Cargando datos de la base de datos...</div>;

  return (

    <div className="min-h-screen bg-gray-100 p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Pedidos - Diseños Exclusivos</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
            >
              + Nuevo Pedido
            
            </button>
            <button 

              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"

            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="py-4 px-6 font-semibold">No. Pedido</th>
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Fecha</th>
                <th className="py-4 px-6 font-semibold">Total a Pagar</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidos.map((pedido) => (
                <tr key={pedido.idPedido} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-700">#{pedido.idPedido}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{pedido.clienteNombre}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-4 px-6 font-medium text-green-700">
                    {pedido.totalPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                      pedido.estado === "Entregado" ? "bg-green-100 text-green-800 border border-green-200" : 
                      pedido.estado === "En Corte" ? "bg-blue-100 text-blue-800 border border-blue-200" : 
                      "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}>
                      {pedido.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nuevo Pedido</h2>
            
            <form onSubmit={handleCrearPedido} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ID del Cliente</label>
                <input 
                  type="number" 
                  name="idCliente"
                  value={formData.idCliente}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 109"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Total a Pagar ($)</label>
                <input 
                  type="number" 
                  name="totalPagar"
                  value={formData.totalPagar}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 150000"
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Abono Inicial ($)</label>
                <input 
                  type="number" 
                  name="abono"
                  value={formData.abono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 50000"
                  required 
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;