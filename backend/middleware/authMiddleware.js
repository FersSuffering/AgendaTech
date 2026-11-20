const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                mensaje: "No autorizado. Inicia sesión."
            });
        }

        const token = authorization.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            mensaje: "Sesión inválida o expirada."
        });
    }
};