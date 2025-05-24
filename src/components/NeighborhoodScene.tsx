import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import type * as THREE from 'three'

// Building component that can be clicked
function Building({ position, size, color, onClick }: { 
  position: [number, number, number], 
  size: [number, number, number], 
  color: string,
  onClick: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={hovered ? '#ff6b6b' : color} 
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  )
}

// Ground plane component
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#e0e0e0" />
    </mesh>
  )
}

// Main scene component
function Scene() {
  const { camera } = useThree()
  
  // Set up initial camera position for airplane-like view
  camera.position.set(0, 500, 0)  // Increased from 100 to 500 for much higher view
  camera.lookAt(0, 0, 0)
  camera.rotation.x = -Math.PI / 2 // Look straight down

  // Example buildings data - scaled down even further
  const buildings = [
    { position: [-5, 0.05, -5], size: [0.1, 0.2, 0.1], color: '#4a90e2', name: 'Coffee Shop' },
    { position: [5, 0.1, -3], size: [0.15, 0.3, 0.15], color: '#50c878', name: 'Restaurant' },
    { position: [0, 0.075, 5], size: [0.2, 0.25, 0.2], color: '#e2a84a', name: 'Store' },
    { position: [-8, 0.05, 2], size: [0.1, 0.15, 0.1], color: '#e24a4a', name: 'Gym' },
  ]

  const handleBuildingClick = (name: string) => {
    console.log(`Clicked on ${name}`)
    // Here you can add your click handling logic
  }

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[0, 1, 0]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Ground />
      {buildings.map((building, index) => (
        <Building
          key={index}
          position={building.position as [number, number, number]}
          size={building.size as [number, number, number]}
          color={building.color}
          onClick={() => handleBuildingClick(building.name)}
        />
      ))}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={1}
        far={0.1}
        resolution={256}
        color="#000000"
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}  
        maxDistance={15}  
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

// Main component that wraps the Canvas
export default function NeighborhoodScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 50, 0], fov: 50 }}>  {/* Increased from 100 to 500 */}
        <Scene />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
} 