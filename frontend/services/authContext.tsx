import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  cerrarSesion,
  obtenerPerfil,
  iniciarSesion,
} from "./authService";

interface AuthContextType {
  user: any;
  nombreCompleto: string;
  loading: boolean;
  correo: string;
  setUser: (user: any) => void;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [loading, setLoading] = useState(true);
  const [correo, setCorreo] = useState("");

  const actualizarUsuario = (usuario: any) => {
    setUser(usuario);
    setNombreCompleto(usuario?.nombre || "");
    setCorreo(usuario?.correo || "");
  };

  useEffect(() => {
    let activo = true;

    const verificarSesion = async () => {
      try {
        const usuario = await obtenerPerfil();

        if (activo) {
          actualizarUsuario(usuario);
        }
      } catch (error) {
        if (activo) {
          actualizarUsuario(null);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    verificarSesion();

    return () => {
      activo = false;
    };
  }, []);

  const login = async (correo: string, password: string) => {
    await iniciarSesion(correo, password);

    const usuario = await obtenerPerfil();

    actualizarUsuario(usuario);
  };

  const logout = async () => {
    await cerrarSesion();
    actualizarUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        nombreCompleto,
        loading,
        correo,
        setUser: actualizarUsuario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}