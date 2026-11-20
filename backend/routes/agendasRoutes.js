const express = require("express");
const router = express.Router();

const agendasController = require("../controllers/agendasController");
const verificarToken = require("../middleware/authMiddleware");

router.use(verificarToken);

// Listar agendas
router.get("/", agendasController.listarAgendas);

// Crear agenda
router.post("/", agendasController.crearAgenda);

// Controlador de selección
router.put("/:idAgenda/seleccionar", agendasController.seleccionarAgenda);

// Editar agenda
router.put("/:idAgenda", agendasController.editarAgenda);

// Eliminar agenda
router.delete("/:idAgenda", agendasController.eliminarAgenda);

module.exports = router;
