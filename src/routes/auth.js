const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = process.env;
const userConfig = require('../../users.config');

// Ruta para registro de usuarios
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Usuario y contraseña son requeridos'
        });
    }

    // Verificar si el usuario ya existe
    if (userConfig.users.find(u => u.username === username)) {
        return res.status(400).json({
            success: false,
            message: 'El usuario ya existe'
        });
    }

    // Guardar usuario (en producción hashear la contraseña)
    userConfig.users.push({ username, password });

    res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente'
    });
});

// Ruta para inicio de sesión
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Usuario y contraseña son requeridos'
        });
    }

    // Verificar credenciales usando la configuración de usuarios
    const user = userConfig.validateCredentials(username, password);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });
    }

    // Generar token JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    res.json({
        success: true,
        token
    });
});

module.exports = router;