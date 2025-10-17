import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { PDFDocument } from '../types';

export class HashGenerator {
  /**
   * Genera hash SHA-256 de un archivo PDF
   */
  static generatePDFHash(filePath: string): string {
    try {
      const fileBuffer = readFileSync(filePath);
      const hash = createHash('sha256');
      hash.update(fileBuffer);
      return hash.digest('hex');
    } catch (error) {
      throw new Error(`Error generando hash del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera hash SHA-256 de un buffer
   */
  static generateBufferHash(buffer: Buffer): string {
    const hash = createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }

  /**
   * Genera hash SHA-256 de contenido de texto
   */
  static generateTextHash(text: string): string {
    const hash = createHash('sha256');
    hash.update(text, 'utf8');
    return hash.digest('hex');
  }

  /**
   * Verifica si un archivo es un PDF válido
   */
  static isValidPDF(filePath: string): boolean {
    try {
      const buffer = readFileSync(filePath);
      const header = buffer.slice(0, 4).toString();
      // Los archivos PDF comienzan con %PDF
      return header === '%PDF';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información del archivo PDF
   */
  static getPDFInfo(filePath: string): { size: number; isValid: boolean; hash: string } {
    try {
      const stats = require('fs').statSync(filePath);
      const isValid = this.isValidPDF(filePath);
      const hash = isValid ? this.generatePDFHash(filePath) : '';
      
      return {
        size: stats.size,
        isValid,
        hash,
      };
    } catch (error) {
      throw new Error(`Error obteniendo información del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
