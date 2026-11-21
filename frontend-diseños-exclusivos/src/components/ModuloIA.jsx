import { useEffect } from 'react';

const ModuloIA = ({ onClose }) => {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };

  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-md bg-gray-900/60 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col">
        
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 opacity-90"></div>
        <div className="absolute top-[-50px] right-[-20px] text-white opacity-10 text-9xl">🧠</div>
        <div className="absolute top-20 left-10 text-white opacity-20 text-4xl">✨</div>
        <div className="absolute top-10 right-32 text-white opacity-20 text-2xl">⚙️</div>
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center font-bold text-xl transition-colors backdrop-blur-sm"
        >
          ✕
        </button>

        <div className="relative z-10 p-10 flex flex-col items-center text-center mt-12">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl mb-6 transform rotate-3 border-4 border-indigo-100">
            🤖
          </div>
          
          <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-widest rounded-full mb-4">
            Fase de Desarrollo 2.0
          </span>
          
          <h2 className="text-3xl font-black text-gray-800 mb-4">
            Asistente Inteligente Diseños Exclusivos
          </h2>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg">
            Estamos entrenando a un modelo de Inteligencia Artificial para que se convierta en tu mano derecha. Muy pronto este módulo analizará tus ventas, predecirá tendencias escolares y automatizará tus respuestas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
              <span className="text-2xl mb-2">📈</span>
              <span className="text-sm font-bold text-gray-700">Predicción de Inventario</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
              <span className="text-2xl mb-2">💬</span>
              <span className="text-sm font-bold text-gray-700">WhatsApp Bot Integrado</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-bold text-gray-700">Cotizador Dinámico</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-md w-full sm:w-auto"
          >
            Entendido, volver 
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuloIA;