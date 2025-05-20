/**
 * Módulo para registrar el uso de tokens por estudiante
 * Este módulo permite registrar, consultar y gestionar el uso de tokens
 * por cada estudiante que utiliza el sistema
 * También genera un archivo de texto plano con el registro de uso de tokens
 */

const fs = require('fs');
const path = require('path');

class TokenLogger {
    constructor() {
        this.logFilePath = path.join(__dirname, '../../logs');
        this.txtLogFilePath = path.join(__dirname, '../../logs/token_usage.txt');
        this.ensureLogDirectoryExists();
    }

    /**
     * Asegura que el directorio de logs exista
     */
    ensureLogDirectoryExists() {
        if (!fs.existsSync(this.logFilePath)) {
            fs.mkdirSync(this.logFilePath, { recursive: true });
        }
    }

    /**
     * Registra el uso de tokens para un estudiante específico
     * @param {string} studentName - Nombre del estudiante
     * @param {Object} tokenUsage - Información de uso de tokens
     * @param {string} documentInfo - Información adicional del documento (opcional)
     * @returns {Promise<boolean>} - Resultado de la operación
     */
    async logTokenUsage(studentName, tokenUsage, documentInfo = '') {
        try {
            if (!studentName || !tokenUsage) {
                console.error('Datos incompletos para registrar uso de tokens');
                return false;
            }

            const timestamp = new Date().toISOString();
            const logFileName = `${studentName.replace(/\s+/g, '_')}_tokens.log`;
            const logFilePath = path.join(this.logFilePath, logFileName);

            // Crear el contenido del registro
            const logEntry = {
                timestamp,
                studentName,
                tokenUsage,
                documentInfo
            };

            // Convertir a formato legible
            const logContent = `${timestamp} - ${studentName} = ${JSON.stringify(tokenUsage)}${documentInfo ? ` - ${documentInfo}` : ''}\n`;

            // Escribir en el archivo de registro individual
            await fs.promises.appendFile(logFilePath, logContent, 'utf8');
            
            // Actualizar el archivo de texto global con el registro de tokens
            await this.updateTokenTextFile(studentName, tokenUsage, documentInfo, timestamp);
            
            console.log(`Uso de tokens registrado para ${studentName}`);
            return true;
        } catch (error) {
            console.error('Error al registrar uso de tokens:', error);
            return false;
        }
    }

    /**
     * Obtiene el historial de uso de tokens para un estudiante
     * @param {string} studentName - Nombre del estudiante
     * @returns {Promise<Array>} - Historial de uso de tokens
     */
    async getTokenUsageHistory(studentName) {
        try {
            if (!studentName) {
                return [];
            }

            const logFileName = `${studentName.replace(/\s+/g, '_')}_tokens.log`;
            const logFilePath = path.join(this.logFilePath, logFileName);

            if (!fs.existsSync(logFilePath)) {
                return [];
            }

            const content = await fs.promises.readFile(logFilePath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim() !== '');

            return lines.map(line => {
                const parts = line.split(' - ');
                const timestamp = parts[0];
                const tokenInfo = parts[1];
                const documentInfo = parts[2] || '';

                return {
                    timestamp,
                    tokenInfo,
                    documentInfo
                };
            });
        } catch (error) {
            console.error('Error al obtener historial de tokens:', error);
            return [];
        }
    }

    /**
     * Obtiene el uso total de tokens para un estudiante
     * @param {string} studentName - Nombre del estudiante
     * @returns {Promise<number>} - Total de tokens utilizados
     */
    async getTotalTokenUsage(studentName) {
        try {
            const history = await this.getTokenUsageHistory(studentName);
            let totalTokens = 0;

            history.forEach(entry => {
                const tokenInfo = entry.tokenInfo;
                const match = tokenInfo.match(/total_tokens"?:\s*(\d+)/i);
                if (match && match[1]) {
                    totalTokens += parseInt(match[1], 10);
                }
            });

            return totalTokens;
        } catch (error) {
            console.error('Error al calcular uso total de tokens:', error);
            return 0;
        }
    }

    /**
     * Actualiza el archivo de texto con el registro de uso de tokens
     * @param {string} studentName - Nombre del estudiante
     * @param {Object} tokenUsage - Información de uso de tokens
     * @param {string} documentInfo - Información adicional del documento
     * @param {string} timestamp - Marca de tiempo
     * @returns {Promise<boolean>} - Resultado de la operación
     */
    async updateTokenTextFile(studentName, tokenUsage, documentInfo, timestamp) {
        try {
            // Formatear la información de tokens para el archivo de texto
            const promptTokens = tokenUsage.prompt_tokens || 0;
            const completionTokens = tokenUsage.completion_tokens || 0;
            const totalTokens = tokenUsage.total_tokens || 0;
            
            // Crear una línea formateada para el archivo de texto
            const textLine = `[${timestamp}] Estudiante: ${studentName} | Tokens: ${totalTokens} (Prompt: ${promptTokens}, Completion: ${completionTokens}) | ${documentInfo}\n`;
            
            // Escribir en el archivo de texto global
            await fs.promises.appendFile(this.txtLogFilePath, textLine, 'utf8');
            console.log(`Archivo de texto de tokens actualizado: ${this.txtLogFilePath}`);
            return true;
        } catch (error) {
            console.error('Error al actualizar archivo de texto de tokens:', error);
            return false;
        }
    }
}

module.exports = new TokenLogger();