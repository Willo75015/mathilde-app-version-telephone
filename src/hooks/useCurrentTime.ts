import { useState, useEffect } from 'react'

export const useCurrentTime = (updateInterval: number = 1000) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, updateInterval)
    
    return () => clearInterval(timer)
  }, [updateInterval])
  
  return currentTime
}
