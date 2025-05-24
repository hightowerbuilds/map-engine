import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { BuildingModal } from '../features/BuildingModal'
import type { BuildingInfo } from '../features/BuildingModal'
import type * as THREE from 'three'

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
  const borderWidth = 0.1  // Width of the border

  return (
    <>
      {/* Black border (slightly larger plane underneath) */}
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
function Scene({ onBuildingClick }: { onBuildingClick: (info: BuildingInfo) => void }) {
  const { camera } = useThree()
  
  // Set up initial camera position for airplane-like view
  camera.position.set(0, 500, 0)
  camera.lookAt(0, 0, 0)
  camera.rotation.x = -Math.PI / 2

  // Example buildings data with enhanced information
  const buildings = [
    { 
      position: [-5, 0.05, -5], 
      size: [0.1, 0.2, 0.1], 
      color: '#4a90e2', 
      name: 'Starbucks', 
      type: 'Coffee Shop',
      description: 'Popular coffee chain known for its signature drinks and cozy atmosphere.',
      hours: 'Mon-Fri: 5:30 AM - 9:00 PM, Sat-Sun: 6:00 AM - 8:00 PM',
      address: '123 Coffee Lane, Downtown',
      rating: 4.5,
      features: ['Free WiFi', 'Drive-thru', 'Mobile Order', 'Outdoor Seating']
    },
    { 
      position: [5, 0.1, -3], 
      size: [0.15, 0.3, 0.15], 
      color: '#50c878', 
      name: 'Olive Garden', 
      type: 'Restaurant',
      description: 'Italian restaurant chain offering pasta dishes, salads, and unlimited breadsticks.',
      hours: 'Sun-Thu: 11:00 AM - 10:00 PM, Fri-Sat: 11:00 AM - 11:00 PM',
      address: '456 Pasta Street, Downtown',
      rating: 4.2,
      features: ['Reservations', 'Takeout', 'Full Bar', 'Family Style']
    },
    { 
      position: [0, 0.075, 5], 
      size: [0.2, 0.25, 0.2], 
      color: '#e2a84a', 
      name: 'Whole Foods', 
      type: 'Grocery Store',
      description: 'Organic and natural foods supermarket with a wide selection of fresh produce.',
      hours: 'Daily: 7:00 AM - 10:00 PM',
      address: '789 Organic Avenue, Downtown',
      rating: 4.7,
      features: ['Organic', 'Bulk Foods', 'Hot Bar', 'Parking']
    },
    { 
      position: [-8, 0.05, 2], 
      size: [0.1, 0.15, 0.1], 
      color: '#e24a4a', 
      name: 'Chase Bank', 
      type: 'Bank',
      description: 'Full-service bank offering personal and business banking solutions.',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      address: '321 Finance Road, Downtown',
      rating: 4.0,
      features: ['ATM', 'Drive-thru', '24/7 Online Banking', 'Safe Deposit Boxes']
    },
  ]

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
          onClick={() => onBuildingClick(building)}
          name={building.name}
          type={building.type}
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
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

// Main component that wraps the Canvas
export default function NeighborhoodScene() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 50, 0], fov: 50 }}>
        <Scene onBuildingClick={setSelectedBuilding} />
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