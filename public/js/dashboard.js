document.addEventListener('DOMContentLoaded', function() {
    // Función para verificar si el token es válido
    function isValidToken(token) {
        if (!token) return false;
        
        // Verificar si el token ha expirado (decodificando sin verificar)
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            const expirationTime = payload.exp * 1000; // Convertir a milisegundos
            
            return Date.now() < expirationTime;
        } catch (e) {
            console.error('Error al decodificar token:', e);
            return false;
        }
    }
    // Verificar si el usuario está autenticado
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    // Eliminar la verificación de acceso directo para evitar doble inicio de sesión
    
    // Verificar si el token existe y es válido
    if (!authToken || !isValidToken(authToken)) {
        // Limpiar el token por seguridad
        localStorage.removeItem('authToken');
        // Redirigir al login
        window.location.href = '/index.html';
        return;
    }
    
    // Mejorar la experiencia del input de archivo
    const fileInput = document.getElementById('document-upload');
    const fileLabel = document.querySelector('.custom-file-label');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                fileLabel.textContent = fileName;
                fileLabel.parentElement.classList.add('file-selected');
            } else {
                fileLabel.textContent = 'Seleccionar archivo';
                fileLabel.parentElement.classList.remove('file-selected');
            }
        });
    }

    // Mostrar el nombre de usuario y configurar la interfaz según el rol
    const usernameDisplay = document.getElementById('username-display');
    const adminSection = document.getElementById('admin-section');
    
    if (usernameDisplay) {
        const username = localStorage.getItem('username');
        usernameDisplay.textContent = username || 'Usuario';
    }

    // Mostrar/ocultar sección de administración según el rol
    if (adminSection) {
        if (userRole === 'admin') {
            adminSection.style.display = 'block';
            initializeAdminInterface();
        } else {
            adminSection.style.display = 'none';
        }
    }

    // Configurar el botón de logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Eliminar datos de autenticación
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            // Redirigir al login
            window.location.href = '/index.html';
        });
    }

    // Configurar el botón de añadir tema
    const addTopicBtn = document.getElementById('add-topic-btn');
    const topicsContainer = document.getElementById('topics-container');
    
    if (addTopicBtn && topicsContainer) {
        addTopicBtn.addEventListener('click', function() {
            // Crear un nuevo elemento de tema
            const topicItem = document.createElement('div');
            topicItem.className = 'topic-item';
            
            // Crear el input para el tema
            const topicInput = document.createElement('input');
            topicInput.type = 'text';
            topicInput.name = 'topics[]';
            topicInput.placeholder = 'Ingrese un tema expuesto en clase';
            
            // Crear el botón para eliminar
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-topic-btn';
            removeBtn.textContent = 'X';
            
            // Añadir evento para eliminar el tema
            removeBtn.addEventListener('click', function() {
                topicsContainer.removeChild(topicItem);
            });
            
            // Añadir elementos al contenedor
            topicItem.appendChild(topicInput);
            topicItem.appendChild(removeBtn);
            topicsContainer.appendChild(topicItem);
        });
        
        // Añadir evento para los botones de eliminar existentes
        const removeButtons = document.querySelectorAll('.remove-topic-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const topicItem = this.parentElement;
                topicsContainer.removeChild(topicItem);
            });
        });
    }

    // Configurar el formulario de subida de archivos
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('document-upload');
            if (!fileInput.files.length) {
                alert('Por favor, seleccione un archivo para analizar');
                return;
            }

            const formData = new FormData();
            formData.append('document', fileInput.files[0]);

            // Enviar el archivo al servidor
            fetch('/api/analysis/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Archivo subido correctamente. Iniciando análisis...');
                    // Aquí podríamos redirigir a una página de resultados
                } else {
                    alert(data.message || 'Error al subir el archivo');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            });
        });
    }

    // Funciones de administración de usuarios
    function initializeAdminInterface() {
        const addUserBtn = document.getElementById('add-user-btn');
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        const usersTableBody = document.getElementById('users-table-body');

        // Cargar lista de usuarios
        loadUsers();

        // Configurar modal de usuario
        addUserBtn.addEventListener('click', () => {
            userModal.style.display = 'block';
            userForm.reset();
            userForm.dataset.mode = 'create';
        });

        // Manejar envío del formulario
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(userForm);
            const userData = {
                username: formData.get('username'),
                password: formData.get('password'),
                role: formData.get('role'),
                active: formData.get('active') === 'true'
            };

            try {
                const response = await fetch('/api/users', {
                    method: userForm.dataset.mode === 'create' ? 'POST' : 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    closeUserModal();
                    loadUsers();
                } else {
                    const error = await response.json();
                    alert(error.message || 'Error al guardar usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }

    function loadUsers() {
        const usersTableBody = document.getElementById('users-table-body');
        
        fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(users => {
            usersTableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>${user.active ? 'Activo' : 'Inactivo'}</td>
                    <td class="user-actions">
                        <button class="btn-edit" onclick="editUser('${user.username}')">Editar</button>
                        <button class="btn-delete" onclick="deleteUser('${user.username}')">Eliminar</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar usuarios');
        });
    }

    function editUser(username) {
        fetch(`/api/users/${username}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(user => {
            const userForm = document.getElementById('user-form');
            userForm.username.value = user.username;
            userForm.role.value = user.role;
            userForm.active.value = user.active.toString();
            userForm.dataset.mode = 'edit';
            document.getElementById('user-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar datos del usuario');
        });
    }

    function deleteUser(username) {
        if (confirm(`¿Está seguro de eliminar al usuario ${username}?`)) {
            fetch(`/api/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            .then(response => {
                if (response.ok) {
                    loadUsers();
                } else {
                    alert('Error al eliminar usuario');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            });
        }
    }

    function closeUserModal() {
        document.getElementById('user-modal').style.display = 'none';
    }

    // Exponer funciones necesarias globalmente
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.closeUserModal = closeUserModal;
});