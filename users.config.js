// Configuración de usuarios para el sistema de detección de IA
module.exports = {
    users: [
        {
            username: '',
            password: '',
            role: 'admin',
            active: true
        },
    ],
    
    // Función para validar credenciales
    validateCredentials: function(username, password) {
        const user = this.users.find(u => 
            u.username === username && 
            u.password === password && 
            u.active
        );
        return user || null;
    },

    // Función para obtener información del usuario
    getUserInfo: function(username) {
        return this.users.find(u => u.username === username) || null;
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
        if (!newUser.username || !newUser.password || !newUser.role) {
            return { success: false, message: 'Datos de usuario incompletos' };
        }
        
        // Verificar si el usuario ya existe
        if (this.getUserInfo(newUser.username)) {
            return { success: false, message: 'El usuario ya existe' };
        }
        
        // Agregar el nuevo usuario
        this.users.push({
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            active: newUser.active !== undefined ? newUser.active : true
        });
        
        return { success: true, message: 'Usuario agregado correctamente' };
    },
    
    // Función para actualizar un usuario existente
    updateUser: function(username, updatedData) {
        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        // Actualizar los datos del usuario
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updatedData
        };
        
        return { success: true, message: 'Usuario actualizado correctamente' };
    },
    
    // Función para eliminar un usuario
    deleteUser: function(username) {
        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        // Eliminar el usuario
        this.users.splice(userIndex, 1);
        
        return { success: true, message: 'Usuario eliminado correctamente' };
    },
    
    // Función para obtener todos los usuarios
    getAllUsers: function() {
        return this.users.map(user => ({
            username: user.username,
            role: user.role,
            active: user.active
        }));
    }
};