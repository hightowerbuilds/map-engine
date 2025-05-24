import React, { useEffect, useRef } from 'react'

interface FloatingElement {
  x: number
  y: number
  text: string
  speed: number
  opacity: number
  rotation: number
  fontSize: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const elementsRef = useRef<Array<FloatingElement>>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Generate random math expressions
  const generateMathExpression = (): string => {
    const expressions = [
      // Trigonometric functions with dollar amounts
      '$sin(π)', '$cos(π)', '$tan(π)',
      '$sin(3π)', '$cos(3π)', '$tan(3π)',
      '$sin(5π)', '$cos(5π)', '$tan(5π)',
      '$sin(7π)', '$cos(7π)', '$tan(7π)',
      '$sin(9π)', '$cos(9π)', '$tan(9π)',
      
      // Calculus with dollar amounts
      '$∫dx', '$∫3dx', '$∫5dx', '$∫7dx', '$∫9dx',
      '$d/dx', '$d²/dx²', '$d³/dx³',
      '$∂f/∂x', '$∂³f/∂x³', '$∂⁵f/∂x⁵',
      
      // Specific dollar amounts with math
      '$3π', '$5π', '$7π', '$9π',
      '$3e', '$5e', '$7e', '$9e',
      '$3√2', '$5√2', '$7√2', '$9√2',
      '$3∞', '$5∞', '$7∞', '$9∞',
      
      // Complex expressions
      '$3∫sin(x)dx', '$5∫cos(x)dx', '$7∫tan(x)dx',
      '$3d/dx(sin)', '$5d/dx(cos)', '$7d/dx(tan)',
      '$3∂/∂x(sin)', '$5∂/∂x(cos)', '$7∂/∂x(tan)',
      
      // Limits and series
      '$3lim', '$5lim', '$7lim', '$9lim',
      '$3∑', '$5∑', '$7∑', '$9∑',
      '$3∏', '$5∏', '$7∏', '$9∏'
    ]
    return expressions[Math.floor(Math.random() * expressions.length)]
  }

  // Initialize floating elements
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create initial elements
    const createElements = (): Array<FloatingElement> => {
      const elements: Array<FloatingElement> = []
      const numElements = Math.floor(window.innerWidth * window.innerHeight / 10000) // Density based on screen size

      for (let i = 0; i < numElements; i++) {
        elements.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          text: generateMathExpression(),
          speed: 0.5 + Math.random() * 1.5, // Speed between 0.5 and 2
          opacity: 0.1 + Math.random() * 0.4, // Opacity between 0.1 and 0.5
          rotation: Math.random() * Math.PI * 2, // Random rotation
          fontSize: 12 + Math.random() * 20 // Font size between 12 and 32
        })
      }
      return elements
    }

    elementsRef.current = createElements()

    // Animation loop
    const animate = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas with a slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)' // Changed to black background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw elements
      elementsRef.current.forEach(element => {
        // Update position
        element.y -= element.speed
        element.x += Math.sin(element.y * 0.01) * 0.5 // Slight horizontal movement
        element.rotation += 0.002 // Slow rotation

        // Reset position if element goes off screen
        if (element.y < -50) {
          element.y = canvas.height + 50
          element.x = Math.random() * canvas.width
          element.text = generateMathExpression()
        }

        // Draw element
        ctx.save()
        ctx.translate(element.x, element.y)
        ctx.rotate(element.rotation)
        ctx.globalAlpha = element.opacity
        ctx.font = `${element.fontSize}px 'Courier New', monospace`
        ctx.fillStyle = '#ffffff' // Changed to white text
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(element.text, 0, 0)
        ctx.restore()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
} 