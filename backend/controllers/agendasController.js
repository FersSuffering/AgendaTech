const pool = require("../config/database");

// LISTAR AGENDAS DEL USUARIO
exports.listarAgendas = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;

    const [agendas] = await pool.execute(
      `SELECT idAgenda, idUsuario, nombre, estatus
       FROM agenda
       WHERE idUsuario = ?
       ORDER BY idAgenda DESC`,
      [idUsuario],
    );

    return res.json({
      mensaje: "Agendas obtenidas correctamente.",
      agendas,
    });
  } catch (error) {
    console.error("Error listando agendas:", error);

    return res.status(500).json({
      mensaje: "Error al obtener las agendas.",
    });
  }
};

// CREAR AGENDA
exports.crearAgenda = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    const { nombre } = req.body;

    if (typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre de la agenda es obligatorio.",
      });
    }

    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length > 100) {
      return res.status(400).json({
        mensaje: "El nombre no puede superar los 100 caracteres.",
      });
    }

    const [existente] = await pool.execute(
      `SELECT idAgenda
       FROM agenda
       WHERE nombre = ?`,
      [nombreLimpio],
    );

    if (existente.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una agenda con ese nombre.",
      });
    }

    const [resultado] = await pool.execute(
      `INSERT INTO agenda (idUsuario, nombre, estatus)
       VALUES (?, ?, 0)`,
      [idUsuario, nombreLimpio],
    );

    return res.status(201).json({
      mensaje: "Agenda creada correctamente.",
      agenda: {
        idAgenda: resultado.insertId,
        idUsuario,
        nombre: nombreLimpio,
        estatus: 0,
      },
    });
  } catch (error) {
    console.error("Error creando agenda:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "Ya existe una agenda con ese nombre.",
      });
    }

    return res.status(500).json({
      mensaje: "Error al crear la agenda.",
    });
  }
};

// SELECCIONAR AGENDA
exports.seleccionarAgenda = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    const { idAgenda } = req.params;

    if (!Number.isInteger(Number(idAgenda)) || Number(idAgenda) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la agenda no es válido.",
      });
    }

    const conexion = await pool.getConnection();

    try {
      await conexion.beginTransaction();

      // Verificar que la agenda pertenezca al usuario
      const [agendas] = await conexion.execute(
        `SELECT idAgenda, nombre
         FROM agenda
         WHERE idAgenda = ? AND idUsuario = ?
         FOR UPDATE`,
        [idAgenda, idUsuario],
      );

      if (agendas.length === 0) {
        await conexion.rollback();

        return res.status(404).json({
          mensaje: "Agenda no encontrada.",
        });
      }

      // Desactivar las demás agendas del usuario
      await conexion.execute(
        `UPDATE agenda
         SET estatus = 0
         WHERE idUsuario = ?`,
        [idUsuario],
      );

      // Activar la agenda seleccionada
      await conexion.execute(
        `UPDATE agenda
         SET estatus = 1
         WHERE idAgenda = ? AND idUsuario = ?`,
        [idAgenda, idUsuario],
      );

      await conexion.commit();

      return res.json({
        mensaje: "Agenda seleccionada correctamente.",
        agenda: {
          idAgenda: Number(idAgenda),
          nombre: agendas[0].nombre,
          estatus: 1,
        },
      });
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  } catch (error) {
    console.error("Error seleccionando agenda:", error);

    return res.status(500).json({
      mensaje: "Error al seleccionar la agenda.",
    });
  }
};

// EDITAR AGENDA
exports.editarAgenda = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    const { idAgenda } = req.params;
    const { nombre } = req.body;

    if (!Number.isInteger(Number(idAgenda)) || Number(idAgenda) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la agenda no es válido.",
      });
    }

    if (typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre de la agenda es obligatorio.",
      });
    }

    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length > 100) {
      return res.status(400).json({
        mensaje: "El nombre no puede superar los 100 caracteres.",
      });
    }

    const [agenda] = await pool.execute(
      `SELECT idAgenda
       FROM agenda
       WHERE idAgenda = ? AND idUsuario = ?`,
      [idAgenda, idUsuario],
    );

    if (agenda.length === 0) {
      return res.status(404).json({
        mensaje: "Agenda no encontrada.",
      });
    }

    const [resultado] = await pool.execute(
      `UPDATE agenda
       SET nombre = ?
       WHERE idAgenda = ? AND idUsuario = ?`,
      [nombreLimpio, idAgenda, idUsuario],
    );

    return res.json({
      mensaje: "Agenda actualizada correctamente.",
      agenda: {
        idAgenda: Number(idAgenda),
        nombre: nombreLimpio,
      },
    });
  } catch (error) {
    console.error("Error editando agenda:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "Ya existe una agenda con ese nombre.",
      });
    }

    return res.status(500).json({
      mensaje: "Error al editar la agenda.",
    });
  }
};

// ELIMINAR AGENDA
exports.eliminarAgenda = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    const { idAgenda } = req.params;

    if (!Number.isInteger(Number(idAgenda)) || Number(idAgenda) <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la agenda no es válido.",
      });
    }

    // Verificar que pertenezca al usuario
    const [agendas] = await pool.execute(
      `SELECT idAgenda
       FROM agenda
       WHERE idAgenda = ? AND idUsuario = ?`,
      [idAgenda, idUsuario],
    );

    if (agendas.length === 0) {
      return res.status(404).json({
        mensaje: "Agenda no encontrada.",
      });
    }

    // Evitar eliminar la última agenda del usuario
    const [cantidad] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM agenda
       WHERE idUsuario = ?`,
      [idUsuario],
    );

    if (cantidad[0].total <= 1) {
      return res.status(400).json({
        mensaje: "No puedes eliminar tu única agenda.",
      });
    }

    const [resultado] = await pool.execute(
      `DELETE FROM agenda
       WHERE idAgenda = ? AND idUsuario = ?`,
      [idAgenda, idUsuario],
    );

    return res.json({
      mensaje: "Agenda eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando agenda:", error);

    return res.status(500).json({
      mensaje: "Error al eliminar la agenda.",
    });
  }
};
