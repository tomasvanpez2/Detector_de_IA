const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const userConfig = require('../../users.config.js');

const authController = {
    signup: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const envPath = path.resolve(__dirname, '../../.env');
            let envContent = fs.readFileSync(envPath, 'utf8');

            envContent = envContent.replace(/^APP_USERNAME=.*/m, `APP_USERNAME=${username}`);
            envContent = envContent.replace(/^APP_PASSWORD=.*/m, `APP_PASSWORD=${password}`);

            fs.writeFileSync(envPath, envContent);

            return res.status(200).json({
                success: true,
                message: 'Usuario registrado exitosamente'
            });
        } catch (error) {
            console.error('Error en signup:', error);
            return res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    },

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

            if (username !== process.env.APP_USERNAME || password !== process.env.APP_PASSWORD) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const user = {
                username: process.env.APP_USERNAME,
                role: 'admin'
            };

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