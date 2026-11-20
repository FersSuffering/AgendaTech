require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));


app.use((req, res, next) => {
    console.log("\n========== PETICIÓN HTTP ==========");
    console.log("Método:", req.method);
    console.log("Ruta:", req.url);
    console.log("Hora:", new Date().toLocaleTimeString());

    res.on("finish", () => {
        console.log("Respuesta enviada:", res.statusCode);
        console.log("==================================");
    });

    next();
});


// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "API AgendaTech funcionando correctamente."
    });
});

// Ruta de autenticación
app.use("/api/auth", require("./routes/authRoutes"));

// Rutas de agendas (CRUD)
app.use("/api/agendas", require("./routes/agendasRoutes"));

// Iniciar servidor
const iniciarServidor = async () => {
    try {
        await pool.query("SELECT 1");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Servidor AgendaTech activo en puerto ${PORT}`);
        });

    } catch (error) {
        console.error("Error conectando con MySQL:", error);
        process.exit(1);
    }
};

iniciarServidor();
