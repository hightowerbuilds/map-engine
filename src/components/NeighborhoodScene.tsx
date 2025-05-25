import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { db } from '../lib/supabase'
import { BuildingModal } from '../features/BuildingModal'
import type { BuildingInfo } from '../features/BuildingModal'
import type * as THREE from 'three'

type Building = {
  id: string
  name: string
  category: string
  position: [number, number, number]
  size: [number, number, number]
  color: string
  totalSpent: number
}

interface NeighborhoodSceneProps {
  buildings: Array<Building>
  onBuildingClick: (info: BuildingInfo) => void
}

// Building component that can be clicked
function Building({ position, size, color, onClick, name, type }: { 
  position: [number, number, number], 
  size: [number, number, number], 
  color: string,
  onClick: () => void,
  name: string,
  type: string
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

// Ground plane component with border
function Ground() {
  const groundSize = 20
  const borderWidth = 0.1

  return (
    <>
      {/* Black border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[groundSize + borderWidth * 2, groundSize + borderWidth * 2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </>
  )
}

// Main scene component
function Scene({ buildings, onBuildingClick }: NeighborhoodSceneProps) {
  const { camera } = useThree()
  
  // Set up initial camera position with steeper angle
  camera.position.set(0, 150, 0)
  camera.lookAt(0, 0, 0)
  camera.rotation.x = -Math.PI / 2.2

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
      {buildings.map((building) => (
        <Building
          key={building.id}
          position={building.position}
          size={building.size}
          color={building.color}
          onClick={() => onBuildingClick({
            name: building.name,
            type: building.category,
            description: `Total Spent: $${building.totalSpent.toLocaleString()}`,
            hours: 'Hours not available',
            address: 'Address not available',
            features: []
          })}
          name={building.name}
          type={building.category}
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
        maxDistance={125}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 2.3}
      />
    </>
  )
}

// Main component that wraps the Canvas
export default function NeighborhoodScene({ buildings, onBuildingClick }: NeighborhoodSceneProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null)

  const handleBuildingClick = (info: BuildingInfo) => {
    setSelectedBuilding(info)
    onBuildingClick(info)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 150, 0], fov: 50 }}>
        <Scene buildings={buildings} onBuildingClick={handleBuildingClick} />
        <Environment preset="city" />
      </Canvas>
      <BuildingModal 
        isOpen={!!selectedBuilding} 
        buildingInfo={selectedBuilding} 
        onClose={() => setSelectedBuilding(null)} 
      />
    </div>
  )
} 