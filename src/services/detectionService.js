const fileParser = require('./fileParser');
const deepseekService = require('./deepseekService');

class DetectionService {
    constructor() {
        this.deepseekService = deepseekService;
    }

    /**
     * Analiza un archivo para detectar si fue generado por IA
     * @param {string} filePath - Ruta del archivo a analizar
     * @param {Object} context - Contexto académico del documento
     * @returns {Promise<Object>} - Resultado del análisis
     */
    async analyzeFile(filePath, context) {
        try {
            // Extraer texto del archivo
            const extractedText = await fileParser.extractText(filePath);
            
            // Verificar que el texto tenga un tamaño adecuado
            if (!extractedText || extractedText.trim().length < 10) {
                throw new Error('El texto extraído es demasiado corto para un análisis preciso');
            }

            // Enviar el texto a la API para análisis
            const analysisResult = await this.deepseekService.analyzeText(extractedText, context);
            
            return {
                success: true,
                text: extractedText.substring(0, 500) + '...', // Muestra solo una parte del texto
                analysis: analysisResult
            };
        } catch (error) {
            console.error('Error en el servicio de detección:', error);
            throw error;
        }
    }

    /**
     * Genera preguntas para verificar la autoría del documento
     * @param {string} filePath - Ruta del archivo
     * @param {Object} context - Contexto académico del documento
     * @returns {Promise<Object>} - Preguntas generadas
     */
    async generateQuestions(filePath, context) {
        try {
            // Extraer texto del archivo
            const extractedText = await fileParser.extractText(filePath);
            
            // Generar preguntas basadas en el contenido
            const questionsResult = await this.deepseekService.generateQuestions(extractedText, context);
            
            return {
                success: true,
                questions: questionsResult
            };
        } catch (error) {
            console.error('Error generando preguntas:', error);
            throw error;
        }
    }
}

module.exports = new DetectionService();