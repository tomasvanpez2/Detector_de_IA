document.addEventListener('DOMContentLoaded', () => {
    const courseSelect = document.getElementById('course-select');
    const studentManagementSection = document.getElementById('student-management');
    const studentSelect = document.getElementById('student-select');
    const addStudentBtn = document.getElementById('add-student-btn');
    const editStudentBtn = document.getElementById('edit-student-btn');
    const deleteStudentBtn = document.getElementById('delete-student-btn');
    const continueToDashboardBtn = document.getElementById('continue-to-dashboard');
    const studentModal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');
    const studentModalTitle = document.getElementById('student-modal-title');
    const cancelStudentModalBtn = document.getElementById('cancel-student-modal');
    const studentNameInput = document.getElementById('student-name');
    const studentIdInput = document.getElementById('student-id');

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/index.html';
        return;
    }


    // Lógica para cargar cursos (grados)
    function loadCourses() {
        const grados = [
            ...Array.from({ length: 11 }, (_, i) => ({ id: `${i + 1}`, name: `Grado ${i + 1}` })),
            { id: 'universitario', name: 'Universitario' }
        ];

        courseSelect.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
        grados.forEach(grado => {
            const option = document.createElement('option');
            option.value = grado.id;
            option.textContent = grado.name;
            courseSelect.appendChild(option);
        });
    }



    // Lógica para cargar estudiantes de un curso (desde el backend)
    function loadStudents(courseId) {
        studentManagementSection.style.display = 'block';
        fetch(`/api/students?course=${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(students => {
            studentSelect.innerHTML = '<option value="" disabled selected>Seleccione un estudiante</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = student.name;
                studentSelect.appendChild(option);
            });
            studentSelect.value = '';
            editStudentBtn.disabled = true;
            deleteStudentBtn.disabled = true;
            continueToDashboardBtn.style.display = 'none';
        })
        .catch(error => console.error('Error al cargar estudiantes:', error));
    }

    courseSelect.addEventListener('change', () => {
        if (courseSelect.value) {
            loadStudents(courseSelect.value);
        } else {
            studentManagementSection.style.display = 'none';
        }
    });

    studentSelect.addEventListener('change', () => {
        const studentSelected = !!studentSelect.value;
        editStudentBtn.disabled = !studentSelected;
        deleteStudentBtn.disabled = !studentSelected;
        continueToDashboardBtn.style.display = studentSelected ? 'block' : 'none';
    });

    function openStudentModal(title, student = {}) {
        studentModalTitle.textContent = title;
        studentIdInput.value = student.id || '';
        studentNameInput.value = student.name || '';
        studentModal.style.display = 'flex';
    }

    function closeStudentModal() {
        studentModal.style.display = 'none';
        studentForm.reset();
    }

    addStudentBtn.addEventListener('click', () => {
        openStudentModal('Agregar Estudiante');
    });

    editStudentBtn.addEventListener('click', () => {
        const studentId = studentSelect.value;
        const studentName = studentSelect.options[studentSelect.selectedIndex].text;
        openStudentModal('Editar Estudiante', { id: studentId, name: studentName });
    });

    deleteStudentBtn.addEventListener('click', () => {
        const studentId = studentSelect.value;
        if (confirm('¿Está seguro de que desea eliminar a este estudiante?')) {
            fetch(`/api/students/${studentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    loadStudents(courseSelect.value);
                } else {
                    alert(result.message);
                }
            })
            .catch(error => console.error('Error al eliminar estudiante:', error));
        }
    });

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = studentIdInput.value;
        const studentData = {
            name: studentNameInput.value,
            course: courseSelect.value
        };

        const isEdit = !!studentId;
        const url = isEdit ? `/api/students/${studentId}` : '/api/students';
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(studentData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeStudentModal();
                loadStudents(courseSelect.value);
            } else {
                alert(result.message);
            }
        })
        .catch(error => console.error('Error al guardar estudiante:', error));
    });

    cancelStudentModalBtn.addEventListener('click', closeStudentModal);

    continueToDashboardBtn.addEventListener('click', () => {
        const courseId = courseSelect.value;

        const studentId = studentSelect.value;
        if (courseId && studentId) {
            // Guardar en localStorage y redirigir
            localStorage.setItem('selectedCourse', courseId);
            localStorage.setItem('selectedStudent', studentId);
            localStorage.setItem('selectedStudentName', studentSelect.options[studentSelect.selectedIndex].text);
            localStorage.setItem('selectedCourseName', courseSelect.options[courseSelect.selectedIndex].text);
            window.location.href = '/dashboard.html';
        }
    });

    loadCourses();
});