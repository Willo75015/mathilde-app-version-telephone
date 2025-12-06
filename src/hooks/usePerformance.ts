import { useCallback, useEffect, useRef, useState } from 'react'
import { PerformanceMetric } from '@/types'

// Hook pour monitoring des performances
export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  
  const measureFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    name: string
  ) => {
    return (...args: T): R => {
      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      
      setMetrics(prev => [...prev, {
        name,
        value: end - start,
        timestamp: new Date()
      }])
      
      return result
    }
  }, [])
  
  const measureAsyncFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    name: string
  ) => {
    return async (...args: T): Promise<R> => {
      const start = performance.now()
      const result = await fn(...args)
      const end = performance.now()
      
      setMetrics(prev => [...prev, {
        name,
        value: end - start,
        timestamp: new Date()
      }])
      
      return result
    }
  }, [])
  
  const clearMetrics = useCallback(() => {
    setMetrics([])
  }, [])
  
  return {
    metrics,
    measureFunction,
    measureAsyncFunction,
    clearMetrics
  }
}

// Hook pour debounce optimisé
export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Hook pour throttle optimisé
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const lastCall = useRef<number>(0)
  
  return useCallback((...args: T) => {
    const now = Date.now()
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    }
  }, [callback, delay])
}

// Hook pour intersection observer optimisé
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }, options)
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [options])
  
  return { elementRef, isIntersecting, entry }
}

// Hook pour gestion du scroll optimisé
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const updatePosition = useThrottle(() => {
    setScrollPosition(window.pageYOffset)
  }, 16) // 60fps
  
  useEffect(() => {
    window.addEventListener('scroll', updatePosition)
    return () => window.removeEventListener('scroll', updatePosition)
  }, [updatePosition])
  
  return scrollPosition
}

// Hook pour gestion du viewport
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  const updateViewport = useThrottle(() => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, 250)
  
  useEffect(() => {
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [updateViewport])
  
  return viewport
}