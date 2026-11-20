import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.100.51:3000/api/auth";

const guardarToken = async (token) => {
  await SecureStore.setItemAsync("agendaToken", token);
};

export const obtenerToken = async () => {
  return await SecureStore.getItemAsync("agendaToken");
};

export const cerrarSesion = async () => {
  await SecureStore.deleteItemAsync("agendaToken");
};

// INICIAR SESIÓN
export const iniciarSesion = async (correo, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al iniciar sesión.");
  }

  await guardarToken(data.token);

  return data;
};

// REGISTRAR USUARIO
export const registrarUsuario = async (nombre, correo, password) => {
  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      correo,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al registrarse.");
  }

  return data;
};

// RECUPERAR CONTRASEÑA
export const recuperarPassword = async (correo) => {
  const response = await fetch(`${API_URL}/recuperar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al enviar el código.");
  }

  return data;
};

// VERIFICAR CÓDIGO DE RECUPERACIÓN
export const verificarCodigoRecuperacion = async (correo, codigo) => {
  const response = await fetch(`${API_URL}/verificar-codigo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo,
      codigo,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Código incorrecto o expirado.");
  }

  return data;
};

// RESTABLECER CONTRASEÑA
export const restablecerPassword = async (correo, codigo, nuevaPassword) => {
  const response = await fetch(`${API_URL}/restablecer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo,
      codigo,
      nuevaPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al cambiar contraseña.");
  }

  return data;
};

// OBTENER PERFIL DEL USUARIO
export const obtenerPerfil = async () => {
  const token = await obtenerToken();

  if (!token) {
    throw new Error("No existe una sesión activa.");
  }

  const response = await fetch(`${API_URL}/perfil`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    await cerrarSesion();
    throw new Error(data.mensaje || "Sesión inválida.");
  }

  return data.usuario;
};
