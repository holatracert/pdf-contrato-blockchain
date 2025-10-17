import { DocumentSignatureService, DocumentSignature } from './DocumentSignatureService';
import { BlockchainConfig, IPFSConfig } from '../types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface MonitoringConfig {
  checkInterval: number; // en milisegundos
  autoSign: boolean;
  autoVerify: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface MonitoringStats {
  startTime: Date;
  lastCheck: Date;
  totalChecks: number;
  documentsProcessed: number;
  signaturesCreated: number;
  verificationsCompleted: number;
  errors: number;
}

export class DocumentMonitoringService {
  private signatureService: DocumentSignatureService;
  private config: MonitoringConfig;
  private stats: MonitoringStats;
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private logFile: string;

  constructor(
    signatureService: DocumentSignatureService,
    config: Partial<MonitoringConfig> = {}
  ) {
    this.signatureService = signatureService;
    this.config = {
      checkInterval: 10 * 60 * 1000, // 10 minutos por defecto
      autoSign: true,
      autoVerify: true,
      logLevel: 'info',
      ...config
    };
    
    this.logFile = join(process.cwd(), 'monitoring.log');
    this.stats = {
      startTime: new Date(),
      lastCheck: new Date(),
      totalChecks: 0,
      documentsProcessed: 0,
      signaturesCreated: 0,
      verificationsCompleted: 0,
      errors: 0
    };
  }

  /**
   * Inicia el monitoreo automático
   */
  start(): void {
    if (this.isRunning) {
      this.log('warn', 'El monitoreo ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.log('info', `🚀 Iniciando monitoreo automático (intervalo: ${this.config.checkInterval / 1000}s)`);
    
    // Ejecutar verificación inicial
    this.performCheck();
    
    // Configurar intervalo
    this.monitoringInterval = setInterval(() => {
      this.performCheck();
    }, this.config.checkInterval);
  }

  /**
   * Detiene el monitoreo automático
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('warn', 'El monitoreo no está ejecutándose');
      return;
    }

    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.log('info', '⏹️  Monitoreo automático detenido');
  }

  /**
   * Realiza una verificación completa
   */
  private async performCheck(): Promise<void> {
    try {
      this.stats.totalChecks++;
      this.stats.lastCheck = new Date();
      
      this.log('info', `\n🔄 Verificación #${this.stats.totalChecks} - ${new Date().toISOString()}`);
      
      // 1. Verificar documentos pendientes
      const pendingDocs = this.signatureService.getPendingDocuments();
      this.log('info', `📄 Documentos pendientes: ${pendingDocs.length}`);
      
      // 2. Firmar automáticamente si está habilitado
      if (this.config.autoSign && pendingDocs.length > 0) {
        this.log('info', '🔏 Iniciando firma automática...');
        const signResult = await this.signatureService.signAllPendingDocuments();
        
        this.stats.signaturesCreated += signResult.success;
        this.stats.documentsProcessed += signResult.success + signResult.failed;
        
        this.log('info', `✅ Firmas creadas: ${signResult.success}, Fallidas: ${signResult.failed}`);
      }
      
      // 3. Verificar documentos firmados si está habilitado
      if (this.config.autoVerify) {
        this.log('info', '🔍 Iniciando verificación automática...');
        await this.signatureService.verifyAllDocuments();
        this.stats.verificationsCompleted++;
      }
      
      // 4. Mostrar estadísticas
      this.showStats();
      
      // 5. Guardar log
      this.saveLog();
      
    } catch (error) {
      this.stats.errors++;
      this.log('error', `❌ Error en verificación: ${error}`);
    }
  }

  /**
   * Muestra estadísticas del sistema
   */
  private showStats(): void {
    const systemStats = this.signatureService.getSystemStats();
    
    this.log('info', '📊 Estadísticas del Sistema:');
    this.log('info', `   📄 Total documentos: ${systemStats.totalDocuments}`);
    this.log('info', `   🔏 Firmados: ${systemStats.signedDocuments}`);
    this.log('info', `   ✅ Verificados: ${systemStats.verifiedDocuments}`);
    this.log('info', `   ❌ Fallidos: ${systemStats.failedDocuments}`);
    this.log('info', `   ⏳ Pendientes: ${systemStats.pendingDocuments}`);
    
    this.log('info', '📊 Estadísticas del Monitoreo:');
    this.log('info', `   🔄 Verificaciones realizadas: ${this.stats.totalChecks}`);
    this.log('info', `   📄 Documentos procesados: ${this.stats.documentsProcessed}`);
    this.log('info', `   🔏 Firmas creadas: ${this.stats.signaturesCreated}`);
    this.log('info', `   ✅ Verificaciones completadas: ${this.stats.verificationsCompleted}`);
    this.log('info', `   ❌ Errores: ${this.stats.errors}`);
  }

  /**
   * Registra un mensaje en el log
   */
  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Mostrar en consola
    console.log(logMessage);
    
    // Guardar en archivo
    this.appendToLogFile(logMessage);
  }

  /**
   * Añade mensaje al archivo de log
   */
  private appendToLogFile(message: string): void {
    try {
      writeFileSync(this.logFile, message + '\n', { flag: 'a' });
    } catch (error) {
      console.error('Error escribiendo al log:', error);
    }
  }

  /**
   * Guarda el log completo
   */
  private saveLog(): void {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        stats: this.stats,
        systemStats: this.signatureService.getSystemStats(),
        config: this.config
      };
      
      const logFile = join(process.cwd(), 'monitoring-status.json');
      writeFileSync(logFile, JSON.stringify(logData, null, 2));
    } catch (error) {
      this.log('error', `Error guardando log: ${error}`);
    }
  }

  /**
   * Obtiene el estado del monitoreo
   */
  getStatus(): {
    isRunning: boolean;
    config: MonitoringConfig;
    stats: MonitoringStats;
    systemStats: any;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      stats: this.stats,
      systemStats: this.signatureService.getSystemStats()
    };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('info', `⚙️  Configuración actualizada: ${JSON.stringify(newConfig)}`);
  }

  /**
   * Fuerza una verificación inmediata
   */
  async forceCheck(): Promise<void> {
    this.log('info', '🔄 Forzando verificación inmediata...');
    await this.performCheck();
  }

  /**
   * Obtiene el historial de logs
   */
  getLogHistory(lines: number = 100): string[] {
    try {
      if (!existsSync(this.logFile)) {
        return [];
      }
      
      const content = readFileSync(this.logFile, 'utf8');
      const lines_array = content.split('\n').filter(line => line.trim());
      
      return lines_array.slice(-lines);
    } catch (error) {
      this.log('error', `Error leyendo historial: ${error}`);
      return [];
    }
  }

  /**
   * Limpia logs antiguos
   */
  cleanOldLogs(maxLines: number = 1000): void {
    try {
      const lines = this.getLogHistory(maxLines);
      writeFileSync(this.logFile, lines.join('\n') + '\n');
      this.log('info', `🧹 Logs limpiados, manteniendo ${lines.length} líneas`);
    } catch (error) {
      this.log('error', `Error limpiando logs: ${error}`);
    }
  }

  /**
   * Exporta estadísticas a archivo
   */
  exportStats(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      monitoring: this.stats,
      system: this.signatureService.getSystemStats(),
      config: this.config
    };
    
    const exportFile = join(process.cwd(), `monitoring-export-${Date.now()}.json`);
    writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    this.log('info', `📊 Estadísticas exportadas a: ${exportFile}`);
    return exportFile;
  }
}
