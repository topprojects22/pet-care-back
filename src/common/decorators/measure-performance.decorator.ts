import { Logger } from '@nestjs/common';

/**
 * Декоратор для измерения производительности методов
 * 
 * @example
 * @MeasurePerformance()
 * async expensiveOperation() {
 *   // Долгая операция
 * }
 */
export function MeasurePerformance(label?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);
    const methodLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        logger.debug(`${methodLabel} completed in ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        logger.error(
          `${methodLabel} failed after ${duration.toFixed(2)}ms: ${error}`,
        );
        throw error;
      }
    };

    return descriptor;
  };
}

