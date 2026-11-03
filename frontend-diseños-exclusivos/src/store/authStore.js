import { create } from "zustand";

const useAuthStore = create((set) => ({

    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    setUsuario: (usuario) => {
        
        localStorage.setItem('usuario', JSON.stringify(usuario));
        set({ usuario });

    },

    logout: () => {

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        set({ usuario: null });
    }

}));  

export default useAuthStore;