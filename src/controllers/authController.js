const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const userConfig = require('../../users.config.js');

const authController = {
    register: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            // Verificamos si el usuario ya existe
            const existingUser = userConfig.validateCredentials(username, password);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario ya existe'
                });
            }

            // Agregamos el nuevo usuario
            const user = userConfig.addUser({
                username,
                password,
                role: 'teacher',
                active: true
            });

            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente'
            });
        } catch (error) {
            console.error('Error en registro:', error);
            return res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const user = userConfig.validateCredentials(username, password);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const token = jwt.sign(
                { 
                    username: user.username,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRATION }
            );

            return res.json({
                success: true,
                token,
                role: user.role
            });
        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    }
};

module.exports = authController;