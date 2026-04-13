// Performance optimization utilities

/**
 * Throttle function - limits how often a function can be called
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Debounce function - delays function execution until after wait time
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Request Idle Callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1);

/**
 * Chunk array processing - prevents UI blocking
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    results.push(...chunk.map(processor));
    
    // Yield to main thread
    await new Promise(resolve => requestIdleCallback(() => resolve(undefined)));
  }
  
  return results;
}

/**
 * Memory-efficient cache with TTL
 */
export class Cache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: K, value: V, ttl?: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl || this.defaultTTL),
    });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * API Response Cache
 */
export const apiCache = new Cache<string, unknown>(3 * 60 * 1000); // 3 minutes

/**
 * Memoize function with cache
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number[]>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): number {
    return performance.now();
  }

  endMeasure(name: string, startTime: number): number {
    const duration = performance.now() - startTime;
    const metric = this.metrics.get(name) || [];
    metric.push(duration);
    if (metric.length > 100) metric.shift();
    this.metrics.set(name, metric);
    return duration;
  }

  getAverageTime(name: string): number {
    const metric = this.metrics.get(name);
    if (!metric || metric.length === 0) return 0;
    return metric.reduce((a, b) => a + b, 0) / metric.length;
  }

  getMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};
    for (const [name, times] of this.metrics.entries()) {
      result[name] = {
        avg: this.getAverageTime(name),
        count: times.length,
      };
    }
    return result;
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();

/**
 * Production-safe logger - strips console calls in production builds
 * This avoids leaking debug info and wasting CPU on string formatting
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, but consider using error tracking service in production
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  },
};

/**
 * Batch updates to prevent excessive re-renders
 */
export function createBatchUpdater() {
  let pending = false;
  const updates: (() => void)[] = [];

  return {
    add(update: () => void): void {
      updates.push(update);
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          const toProcess = [...updates];
          updates.length = 0;
          pending = false;
          toProcess.forEach(u => u());
        });
      }
    },
  };
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for save-data mode
  const connection = (navigator as Navigator & { 
    connection?: { saveData?: boolean; effectiveType?: string } 
  }).connection;
  
  if (connection?.saveData) return true;
  
  // Check for slow connection
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return true;
  }
  
  // Check device memory (if available)
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return true;
  
  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
  
  return false;
}

/**
 * Adaptive quality based on device capabilities
 */
export function getAdaptiveQuality(): {
  particlesCount: number;
  enableOrbs: boolean;
  enableWaves: boolean;
  enableConnectingLines: boolean;
  animationFrameSkip: number;
} {
  const lowEnd = isLowEndDevice();
  
  if (lowEnd) {
    return {
      particlesCount: 15,
      enableOrbs: false,
      enableWaves: false,
      enableConnectingLines: false,
      animationFrameSkip: 2,
    };
  }
  
  return {
    particlesCount: 50,
    enableOrbs: true,
    enableWaves: true,
    enableConnectingLines: true,
    animationFrameSkip: 1,
  };
}
