/**
 * useResponsive.js
 * Hook para detección de tamaño de pantalla
 * Mobile-first + Notebook optimizado
 */

import { useState, useEffect } from 'react'

export function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )
  const [height, setHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = width < 768      // < 768px
  const isTablet = width >= 768 && width < 1024  // 768px - 1024px
  const isDesktop = width >= 1024   // >= 1024px
  const isNotebook = width >= 1024 && width <= 1600  // notebook range

  // Padding responsivo
  const paddingX = isMobile ? 'px-4' : 'px-6'
  const maxWidth = isDesktop ? 'max-w-full' : 'max-w-full'

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isNotebook,
    paddingX,
    maxWidth,
  }
}
