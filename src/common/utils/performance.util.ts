/**
 * Утилиты для измерения производительности
 */

/**
 * Измеряет время выполнения функции
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label?: string,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Синхронная версия measureTime
 */
export function measureTimeSync<T>(
  fn: () => T,
  label?: string,
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Декоратор для измерения времени выполнения метода
 */
export function MeasureTime(label?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const targetName = (target as { constructor?: { name?: string } }).constructor?.name || 'Unknown';
      const methodLabel = label || `${targetName}.${propertyKey}`;
      return measureTime(() => originalMethod.apply(this, args), methodLabel);
    };

    return descriptor;
  };
}

/**
 * Создает профилировщик для отслеживания нескольких операций
 */
export class PerformanceProfiler {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.measurements.get(label) || [];
      existing.push(duration);
      this.measurements.set(label, existing);
    };
  }

  getStats(label: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, val) => sum + val, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      total,
      average,
      min,
      max,
    };
  }

  getAllStats(): Record<string, { count: number; total: number; average: number; min: number; max: number } | null> {
    const stats: Record<string, { count: number; total: number; average: number; min: number; max: number } | null> = {};
    this.measurements.forEach((_, label) => {
      stats[label] = this.getStats(label);
    });
    return stats;
  }

  reset(): void {
    this.measurements.clear();
  }
}

