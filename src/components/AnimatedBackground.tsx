import React, { useEffect, useRef } from 'react'

interface FloatingElement {
  x: number
  y: number
  text: string
  speed: number
  opacity: number
  rotation: number
  fontSize: number
  swayOffset: number  // Add sway offset for natural movement
  swaySpeed: number   // Add sway speed for variation
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const elementsRef = useRef<Array<FloatingElement>>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Generate random math expressions
  const generateMathExpression = (): string => {
    // Helper function to generate random dollar amount with commas
    const randomDollarAmount = (): string => {
      const amount = Math.random() * (100000 - 200) + 200
      // Format number with commas and 2 decimal places
      return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      })}`
    }

    // Helper function to generate random date between 03/08/1955 and 12/20/2012
    const randomDate = (): string => {
      const startDate = new Date(1955, 2, 8) // March 8, 1955 (months are 0-based)
      const endDate = new Date(2012, 11, 20) // December 20, 2012
      
      const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      const date = new Date(randomTimestamp)
      
      // Format as MM/DD/YYYY
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = date.getFullYear()
      
      return `${month}/${day}/${year}`
    }

    const expressions = [
      // Random dates with amounts
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`,
      `${randomDate()} ${randomDollarAmount()}`
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
      // Increase divisor to reduce density (from 5000 to 20000)
      const numElements = Math.floor(window.innerWidth * window.innerHeight / 20000)

      for (let i = 0; i < numElements; i++) {
        elements.push({
          x: -100,
          y: Math.random() * canvas.height,
          text: generateMathExpression(),
          speed: 3 + Math.random() * 7,
          opacity: 0.15 + Math.random() * 0.35,
          rotation: -0.4 + Math.random() * 0.8,
          fontSize: 14 + Math.random() * 24,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 1 + Math.random() * 2
        })
      }
      return elements
    }

    elementsRef.current = createElements()

    // Animation loop
    const animate = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas with a stronger fade effect for more motion blur
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw elements
      elementsRef.current.forEach(element => {
        // Update position with stronger wind effect
        element.x += element.speed
        // More pronounced vertical sway
        element.y += Math.sin(element.x * 0.02 + element.swayOffset) * 1.5
        element.swayOffset += element.swaySpeed * 0.02 // Faster sway update
        
        // Reset position if element goes off screen
        if (element.x > canvas.width + 100) {
          element.x = -100
          element.y = Math.random() * canvas.height
          element.text = generateMathExpression()
          element.rotation = -0.4 + Math.random() * 0.8 // More pronounced tilt
          element.swayOffset = Math.random() * Math.PI * 2
          // Randomize speed on reset for more dynamic movement
          element.speed = 3 + Math.random() * 7
        }

        // Draw element with slight blur effect
        ctx.save()
        ctx.translate(element.x, element.y)
        ctx.rotate(element.rotation)
        ctx.globalAlpha = element.opacity
        ctx.font = `${element.fontSize}px 'Courier New', monospace`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // Draw multiple times with slight offset for motion blur effect
        ctx.fillText(element.text, 0, 0)
        ctx.globalAlpha = element.opacity * 0.5
        ctx.fillText(element.text, -1, 0)
        ctx.fillText(element.text, 1, 0)
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