import { obtenerToken } from "./authService";

const API_URL = "http://192.168.100.51:3000/api/agendas";

export interface Agenda {
    idAgenda: number;
    idUsuario: number;
    nombre: string;
    estatus: number | boolean;
}

// LISTAR AGENDAS
export const listarAgendas = async (): Promise<Agenda[]> => {
    const token = await obtenerToken();

    if (!token) {
        throw new Error("No existe una sesión activa.");
    }

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al obtener las agendas.");
    }

    return data.agendas as Agenda[];
};

// CREAR AGENDA
export const crearAgenda = async (nombre: string) => {
    const token = await obtenerToken();

    if (!token) {
        throw new Error("No existe una sesión activa.");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al crear la agenda.");
    }

    return data;
};

// SELECCIONAR AGENDA
export const seleccionarAgenda = async (idAgenda: number) => {
    const token = await obtenerToken();

    if (!token) {
        throw new Error("No existe una sesión activa.");
    }

    const response = await fetch(
        `${API_URL}/${idAgenda}/seleccionar`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al seleccionar la agenda.");
    }

    return data;
};

// EDITAR AGENDA
export const editarAgenda = async (
    idAgenda: number,
    nombre: string
) => {
    const token = await obtenerToken();

    if (!token) {
        throw new Error("No existe una sesión activa.");
    }

    const response = await fetch(`${API_URL}/${idAgenda}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al editar la agenda.");
    }

    return data;
};

// ELIMINAR AGENDA
export const eliminarAgenda = async (idAgenda: number) => {
    const token = await obtenerToken();

    if (!token) {
        throw new Error("No existe una sesión activa.");
    }

    const response = await fetch(`${API_URL}/${idAgenda}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al eliminar la agenda.");
    }

    return data;
};
