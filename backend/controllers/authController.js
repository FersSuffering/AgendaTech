const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { enviarCorreo } = require("../utils/email");

const validarCorreo = (correo) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

// GENERAR HASH DEL CÓDIGO
const generarCodigoHash = (codigo) => {
  return crypto
    .createHmac(
      "sha256",
      process.env.RECOVERY_CODE_SECRET || process.env.JWT_SECRET,
    )
    .update(codigo)
    .digest("hex");
};

// REGISTRO
exports.registrar = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre?.trim() || !correo?.trim() || !password) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios.",
      });
    }

    if (!validarCorreo(correo.trim())) {
      return res.status(400).json({
        mensaje: "El correo electrónico no es válido.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        mensaje:
          "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.",
      });
    }

    if (nombre.trim().length > 100 || correo.trim().length > 100) {
      return res.status(400).json({
        mensaje: "El nombre o correo supera la longitud permitida.",
      });
    }

    const [existente] = await pool.execute(
      "SELECT idUsuario FROM usuario WHERE correo = ?",
      [correo.trim().toLowerCase()],
    );

    if (existente.length > 0) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const conexion = await pool.getConnection();

    try {
      await conexion.beginTransaction();

      const [usuario] = await conexion.execute(
        `INSERT INTO usuario
         (correo, contraseña, nombre, tipo)
         VALUES (?, ?, ?, 'Usuario')`,
        [correo.trim().toLowerCase(), passwordHash, nombre.trim()],
      );

      // Crear agenda principal
      await conexion.execute(
        `INSERT INTO agenda (idUsuario, nombre, estatus)
         VALUES (?, 'Mi Agenda', 1)`,
        [usuario.insertId],
      );

      await conexion.commit();

      return res.status(201).json({
        mensaje: "Usuario registrado correctamente.",
        usuario: {
          idUsuario: usuario.insertId,
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          tipo: "Usuario",
        },
      });
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  } catch (error) {
    console.error("Error en registro:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado.",
      });
    }

    return res.status(500).json({
      mensaje: "Error interno al registrar el usuario.",
    });
  }
};

// INICIO DE SESIÓN
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (
      typeof correo !== "string" ||
      typeof password !== "string" ||
      !correo.trim() ||
      !password
    ) {
      return res.status(400).json({
        mensaje: "Ingresa tu correo y contraseña.",
      });
    }

    const [usuarios] = await pool.execute(
      `SELECT idUsuario, correo, contraseña, nombre, tipo
       FROM usuario
       WHERE correo = ?`,
      [correo.trim().toLowerCase()],
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    const usuario = usuarios[0];

    const passwordCorrecta = await bcrypt.compare(password, usuario.contraseña);

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    const token = jwt.sign(
      {
        idUsuario: usuario.idUsuario,
        tipo: usuario.tipo,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
      },
    );

    return res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      mensaje: "Error al iniciar sesión.",
    });
  }
};

// OBTENER PERFIL DEL USUARIO
exports.obtenerPerfil = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;

    const [usuarios] = await pool.execute(
      `SELECT idUsuario, nombre, correo, tipo
       FROM usuario
       WHERE idUsuario = ?`,
      [idUsuario],
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado.",
      });
    }

    return res.json({
      usuario: usuarios[0],
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);

    return res.status(500).json({
      mensaje: "Error al obtener el perfil.",
    });
  }
};

// SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA
exports.recuperarPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (typeof correo !== "string" || !validarCorreo(correo.trim())) {
      return res.status(400).json({
        mensaje: "Ingresa un correo válido.",
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const [usuarios] = await pool.execute(
      "SELECT idUsuario, correo FROM usuario WHERE correo = ?",
      [correoNormalizado],
    );

    const respuesta = {
      mensaje:
        "Si el correo está registrado, recibirás un código de recuperación.",
    };

    if (usuarios.length === 0) {
      return res.json(respuesta);
    }

    const usuario = usuarios[0];

    // Generar código aleatorio de 6 dígitos
    const codigo = crypto.randomInt(100000, 1000000).toString();

    // Generar hash
    const codigoHash = generarCodigoHash(codigo);

    const conexion = await pool.getConnection();

    let idRecuperacion;

    try {
      await conexion.beginTransaction();

      // Invalidar códigos anteriores
      await conexion.execute(
        `UPDATE recuperacion
         SET usado = TRUE
         WHERE idUsuario = ? AND usado = FALSE`,
        [usuario.idUsuario],
      );

      // Registrar nuevo código con 10 minutos de expiración
      const [resultado] = await conexion.execute(
        `INSERT INTO recuperacion
         (idUsuario, codigoHash, expiracion)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        [usuario.idUsuario, codigoHash],
      );

      idRecuperacion = resultado.insertId;

      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }

    // Enviar código por correo
    try {
      await enviarCorreo(usuario.correo, codigo);
    } catch (error) {
      console.error("Error enviando código:", error);

      await pool.execute(
        `UPDATE recuperacion
         SET usado = TRUE
         WHERE idRecuperacion = ?`,
        [idRecuperacion],
      );

      return res.status(503).json({
        mensaje: "No fue posible enviar el correo. Inténtalo más tarde.",
      });
    }

    return res.json(respuesta);
  } catch (error) {
    console.error("Error recuperando contraseña:", error);

    return res.status(500).json({
      mensaje: "No fue posible procesar la solicitud.",
    });
  }
};

// VERIFICAR CÓDIGO DE RECUPERACIÓN
exports.verificarCodigoRecuperacion = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    if (
      typeof correo !== "string" ||
      !validarCorreo(correo.trim()) ||
      typeof codigo !== "string" ||
      !/^\d{6}$/.test(codigo)
    ) {
      return res.status(400).json({
        mensaje: "Ingresa un correo y un código válido de 6 dígitos.",
      });
    }

    const codigoHash = generarCodigoHash(codigo);

    const [registros] = await pool.execute(
      `SELECT r.idRecuperacion
       FROM recuperacion r
       INNER JOIN usuario u
         ON u.idUsuario = r.idUsuario
       WHERE u.correo = ?
       AND r.codigoHash = ?
       AND r.usado = FALSE
       AND r.expiracion > NOW()
       LIMIT 1`,
      [correo.trim().toLowerCase(), codigoHash],
    );

    if (registros.length === 0) {
      return res.status(400).json({
        mensaje: "El código es incorrecto o ha expirado.",
      });
    }

    return res.json({
      mensaje: "Código verificado correctamente.",
    });
  } catch (error) {
    console.error("Error verificando código:", error);

    return res.status(500).json({
      mensaje: "No fue posible verificar el código.",
    });
  }
};

// RESTABLECER CONTRASEÑA
exports.restablecerPassword = async (req, res) => {
  let conexion;
  let transaccionIniciada = false;

  try {
    const { correo, codigo, nuevaPassword } = req.body;

    if (
      typeof correo !== "string" ||
      !validarCorreo(correo.trim()) ||
      typeof codigo !== "string" ||
      !/^\d{6}$/.test(codigo) ||
      typeof nuevaPassword !== "string" ||
      nuevaPassword.length < 8 ||
      Buffer.byteLength(nuevaPassword, "utf8") > 72
    ) {
      return res.status(400).json({
        mensaje: "Los datos proporcionados no son válidos.",
      });
    }

    const codigoHash = generarCodigoHash(codigo);

    const passwordHash = await bcrypt.hash(nuevaPassword, 12);

    conexion = await pool.getConnection();

    await conexion.beginTransaction();
    transaccionIniciada = true;

    // Verificar nuevamente el código
    const [registros] = await conexion.execute(
      `SELECT r.idRecuperacion, r.idUsuario
       FROM recuperacion r
       INNER JOIN usuario u
         ON u.idUsuario = r.idUsuario
       WHERE u.correo = ?
       AND r.codigoHash = ?
       AND r.usado = FALSE
       AND r.expiracion > NOW()
       LIMIT 1
       FOR UPDATE`,
      [correo.trim().toLowerCase(), codigoHash],
    );

    if (registros.length === 0) {
      await conexion.rollback();
      transaccionIniciada = false;

      return res.status(400).json({
        mensaje: "El código es incorrecto o ha expirado.",
      });
    }

    const idUsuario = registros[0].idUsuario;

    // Actualizar contraseña
    await conexion.execute(
      `UPDATE usuario
       SET contraseña = ?
       WHERE idUsuario = ?`,
      [passwordHash, idUsuario],
    );

    // Invalidar códigos de recuperación
    await conexion.execute(
      `UPDATE recuperacion
       SET usado = TRUE
       WHERE idUsuario = ? AND usado = FALSE`,
      [idUsuario],
    );

    await conexion.commit();
    transaccionIniciada = false;

    return res.json({
      mensaje: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    if (conexion && transaccionIniciada) {
      await conexion.rollback();
    }

    console.error("Error restableciendo contraseña:", error);

    return res.status(500).json({
      mensaje: "No fue posible cambiar la contraseña.",
    });
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
};
