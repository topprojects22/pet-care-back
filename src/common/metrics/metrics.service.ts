import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

/**
 * Сервис для работы с метриками Prometheus
 */
@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // HTTP метрики
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly httpRequestErrors: Counter<string>;

  // Бизнес метрики
  private readonly databaseQueryDuration: Histogram<string>;
  private readonly cacheHits: Counter<string>;
  private readonly cacheMisses: Counter<string>;

  // Системные метрики
  private readonly activeConnections: Gauge<string>;
  private readonly queueSize: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    // HTTP метрики
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_requests_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // Бизнес метрики
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.registry],
    });

    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });

    // Системные метрики
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });

    this.queueSize = new Gauge({
      name: 'queue_size',
      help: 'Size of processing queue',
      labelNames: ['queue_name'],
      registers: [this.registry],
    });
  }

  /**
   * Записать метрику длительности HTTP запроса
   */
  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
  ): void {
    this.httpRequestDuration.observe(
      { method, route, status: status.toString() },
      duration / 1000, // Конвертируем в секунды
    );
    this.httpRequestTotal.inc({ method, route, status: status.toString() });
  }

  /**
   * Записать метрику ошибки HTTP запроса
   */
  recordHttpError(
    method: string,
    route: string,
    errorType: string,
  ): void {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  /**
   * Записать метрику длительности запроса к БД
   */
  recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
  ): void {
    this.databaseQueryDuration.observe(
      { operation, table },
      duration / 1000,
    );
  }

  /**
   * Записать попадание в кэш
   */
  recordCacheHit(key: string): void {
    this.cacheHits.inc({ cache_key: key });
  }

  /**
   * Записать промах кэша
   */
  recordCacheMiss(key: string): void {
    this.cacheMisses.inc({ cache_key: key });
  }

  /**
   * Установить количество активных соединений
   */
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  /**
   * Установить размер очереди
   */
  setQueueSize(queueName: string, size: number): void {
    this.queueSize.set({ queue_name: queueName }, size);
  }

  /**
   * Получить метрики в формате Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Получить registry для использования в других местах
   */
  getRegistry(): Registry {
    return this.registry;
  }
}

