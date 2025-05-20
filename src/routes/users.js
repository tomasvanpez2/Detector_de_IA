const express = require('express');
const router = express.Router();
const userConfig = require('../../users.config');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Middleware para verificar que el usuario es administrador
const isAdmin = checkRole(['admin']);

// Obtener todos los usuarios (solo administradores)
router.get('/', verifyToken, isAdmin, (req, res) => {
    try {
        const users = userConfig.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
});

// Obtener un usuario específico (solo administradores)
router.get('/:username', verifyToken, isAdmin, (req, res) => {
    try {
        const { username } = req.params;
        const user = userConfig.getUserInfo(username);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario'
        });
    }
});

// Crear un nuevo usuario (solo administradores)
router.post('/', verifyToken, isAdmin, (req, res) => {
    try {
        const { username, password, role, active } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }
        
        const result = userConfig.addUser({
            username,
            password,
            role,
            active: active !== undefined ? active : true
        });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
});

// Actualizar un usuario existente (solo administradores)
router.put('/:username', verifyToken, isAdmin, (req, res) => {
    try {
        const { username } = req.params;
        const { password, role, active } = req.body;
        
        const updatedData = {};
        if (password) updatedData.password = password;
        if (role) updatedData.role = role;
        if (active !== undefined) updatedData.active = active;
        
        const result = userConfig.updateUser(username, updatedData);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario'
        });
    }
});

// Eliminar un usuario (solo administradores)
router.delete('/:username', verifyToken, isAdmin, (req, res) => {
    try {
        const { username } = req.params;
        
        // Evitar que se elimine el usuario administrador principal
        if (username === 'Administradordelsistema') {
            return res.status(403).json({
                success: false,
                message: 'No se puede eliminar el administrador principal'
            });
        }
        
        const result = userConfig.deleteUser(username);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
});

module.exports = router;