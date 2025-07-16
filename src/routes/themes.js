const express = require('express');
const router = express.Router();
const { loadThemes, saveThemes } = require('../utils/themes');

// Obtener temas de un curso
router.get('/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const themes = loadThemes();
    res.json(themes[courseId] || []);
});

// Agregar tema a un curso
router.post('/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
        return res.status(400).json({ success: false, message: 'Tema inválido' });
    }
    const themes = loadThemes();
    if (!themes[courseId]) themes[courseId] = [];
    if (!themes[courseId].includes(topic)) {
        themes[courseId].push(topic);
        saveThemes(themes);
    }
    res.json({ success: true, topics: themes[courseId] });
});

// Eliminar tema de un curso
router.delete('/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const { topic } = req.body;
    const themes = loadThemes();
    if (themes[courseId]) {
        themes[courseId] = themes[courseId].filter(t => t !== topic);
        saveThemes(themes);
    }
    res.json({ success: true, topics: themes[courseId] || [] });
});

module.exports = router;
