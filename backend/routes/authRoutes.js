const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Registro
router.post("/registro", authController.registrar);

// Inicio de sesión
router.post("/login", authController.login);

// Recuperar contraseña
router.post("/recuperar", authController.recuperarPassword);

// Restablecer contraseña
router.post("/restablecer", authController.restablecerPassword);

// Verificar código de recuperación
router.post("/verificar-codigo", authController.verificarCodigoRecuperacion);

// Verificar sesión y obtener perfil
router.get("/perfil", authMiddleware, async (req, res) => {
  try {
    const [usuarios] = await require("../config/database").execute(
      `SELECT idUsuario, nombre, correo, tipo
             FROM usuario
             WHERE idUsuario = ?`,
      [req.usuario.idUsuario],
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado.",
      });
    }

    res.json({
      mensaje: "Sesión válida.",
      usuario: usuarios[0],
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);

    res.status(500).json({
      mensaje: "Error al obtener el perfil.",
    });
  }
});

module.exports = router;
