// Configuración de usuarios para el sistema de detección de IA
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

// Función para cargar usuarios desde el archivo JSON
function loadUsers() {
    if (fs.existsSync(usersFilePath)) {
        try {
            const data = fs.readFileSync(usersFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al cargar users.json:', error);
        }
    }
    // Si el archivo no existe o hay un error, inicializa con el admin
    return [
        {
            id: uuidv4(),
            username: process.env.APP_USERNAME,
            password: process.env.APP_PASSWORD,
            role: 'admin',
            active: true
        }
    ];
}

// Función para guardar usuarios en el archivo JSON
function saveUsers(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al guardar en users.json:', error);
    }
}

module.exports = {
    // Función para validar credenciales
    validateCredentials: function(username, password) {
        const users = loadUsers();
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.active
        );
        return user || null;
    },

    // Función para obtener información del usuario
    getUserInfo: function(username) {
        const users = loadUsers();
        return users.find(u => u.username === username) || null;
    },

    // Función para verificar permisos
    hasPermission: function(username, permission) {
        const user = this.getUserInfo(username);
        if (!user) return false;
        
        switch(permission) {
            case 'analyze_documents':
                return ['teacher', 'admin'].includes(user.role);
            case 'manage_users':
                return user.role === 'admin';
            default:
                return false;
        }
    },
    
    // Función para agregar un nuevo usuario
    addUser: function(newUser) {
        const users = loadUsers();
        if (users.length >= 4) {
            return { success: false, message: 'Se ha alcanzado el límite de 4 usuarios' };
        }

        if (!newUser.username || !newUser.password || !newUser.role) {
            return { success: false, message: 'Datos de usuario incompletos' };
        }
        
        // Verificar si el usuario ya existe
        if (this.getUserInfo(newUser.username)) {
            return { success: false, message: 'El usuario ya existe' };
        }
        
        // Agregar el nuevo usuario
        users.push({
            id: uuidv4(), // Asignar un ID único
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            active: newUser.active !== undefined ? newUser.active : true
        });
        
        saveUsers(users);
        return { success: true, message: 'Usuario agregado correctamente' };
    },
    
    // Función para actualizar un usuario existente
    updateUser: function(userId, updatedData) {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        // Actualizar los datos del usuario
        users[userIndex] = {
            ...users[userIndex],
            ...updatedData
        };
        
        saveUsers(users);
        return { success: true, message: 'Usuario actualizado correctamente' };
    },
    
    // Función para eliminar un usuario
    deleteUser: function(userId) {
        let users = loadUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        // Eliminar el usuario
        users.splice(userIndex, 1);
        
        saveUsers(users);
        return { success: true, message: 'Usuario eliminado correctamente' };
    },
    
    // Función para obtener todos los usuarios
    getAllUsers: function() {
        const users = loadUsers();
        return users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            active: user.active
        }));
    }
};