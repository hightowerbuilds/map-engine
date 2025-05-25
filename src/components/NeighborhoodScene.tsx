import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { db } from '../lib/supabase'
import { BuildingModal, ModalManager } from '../features/BuildingModal'
import type { BuildingInfo, ModalManagerHandle } from '../features/BuildingModal'

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

type MountainData = {
  position: [number, number, number]
  size: [number, number, number]
  color: string
}

type RoadSegment = {
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  length: number
}

// Building component that can be clicked
function Building({ position, size, color, onClick, name, type, id }: { 
  position: [number, number, number], 
  size: [number, number, number], 
  color: string,
  onClick: () => void,
  name: string,
  type: string,
  id: string
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
  const groundWidth = 20 // Keep the same width
  const groundLength = 60 // Increased length to extend beyond buildings
  const borderWidth = 0.1

  return (
    <>
      {/* Black border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[groundLength + borderWidth * 2, groundWidth + borderWidth * 2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[groundLength, groundWidth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[groundLength, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  )
}

// Text label component that lives inside the Canvas
function BuildingLabel({ position, name }: { position: [number, number, number], name: string }) {
  return (
    <Html
      position={[position[0] + 1.2, position[1], position[2]]}
      transform
      occlude
      style={{
        transform: 'rotate(-90deg)',
        color: 'black',
        fontFamily: 'Courier, monospace',
        fontSize: '56px',
        whiteSpace: 'nowrap',
        textShadow: '0 0 4px white',
        pointerEvents: 'none',
        userSelect: 'none',
        fontWeight: 'bold',
      }}
    >
      {name}
    </Html>
  )
}

// Lake component for the background
function Lake() {
  return (
    <group>
      {/* Main lake surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -100]}>
        <circleGeometry args={[40, 32]} />
        <meshStandardMaterial 
          color="#1e88e5"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Lake shore */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -100]}>
        <ringGeometry args={[39, 40, 32]} />
        <meshStandardMaterial 
          color="#1565c0"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

// Tree component
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Tree top */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} flatShading />
      </mesh>
    </group>
  )
}

// Forest component that groups multiple trees
function Forest() {
  // Define tree positions around the mountains
  const treePositions: Array<[number, number, number]> = [
    // Front trees - closest to the buildings
    [-40, 0, -25], [-35, 0, -24], [-30, 0, -23], [-25, 0, -22],
    [-20, 0, -21], [-15, 0, -20], [-10, 0, -19], [-5, 0, -18],
    [0, 0, -18], [5, 0, -19], [10, 0, -20], [15, 0, -21],
    [20, 0, -22], [25, 0, -23], [30, 0, -24], [35, 0, -25],
    // Additional front trees for density
    [-37, 0, -26], [-27, 0, -25], [-17, 0, -24], [-7, 0, -23],
    [7, 0, -23], [17, 0, -24], [27, 0, -25], [37, 0, -26],
    
    // Left side trees - first row
    [-45, 0, -45], [-42, 0, -42], [-38, 0, -40], [-35, 0, -38],
    [-32, 0, -36], [-28, 0, -35], [-25, 0, -34], [-22, 0, -33],
    // Left side trees - second row
    [-48, 0, -48], [-44, 0, -46], [-40, 0, -44], [-36, 0, -42],
    [-33, 0, -40], [-29, 0, -39], [-26, 0, -38], [-23, 0, -37],
    
    // Right side trees - first row
    [45, 0, -45], [42, 0, -42], [38, 0, -40], [35, 0, -38],
    [32, 0, -36], [28, 0, -35], [25, 0, -34], [22, 0, -33],
    // Right side trees - second row
    [48, 0, -48], [44, 0, -46], [40, 0, -44], [36, 0, -42],
    [33, 0, -40], [29, 0, -39], [26, 0, -38], [23, 0, -37],
    
    // Back trees - first row
    [-35, 0, -50], [-25, 0, -52], [-15, 0, -54], [-5, 0, -55],
    [0, 0, -55], [5, 0, -55], [15, 0, -54], [25, 0, -52], [35, 0, -50],
    // Back trees - second row
    [-30, 0, -53], [-20, 0, -55], [-10, 0, -57], [-5, 0, -58],
    [5, 0, -58], [10, 0, -57], [20, 0, -55], [30, 0, -53],
    
    // Additional scattered trees
    [-15, 0, -45], [-8, 0, -43], [-5, 0, -41], [-2, 0, -39],
    [2, 0, -39], [5, 0, -41], [8, 0, -43], [15, 0, -45],
    [-12, 0, -48], [-6, 0, -46], [-3, 0, -44], [3, 0, -44],
    [6, 0, -46], [12, 0, -48]
  ]

  // Random scale variations for trees
  const getRandomScale = (position: [number, number, number]) => {
    // Make front trees slightly larger
    if (position[2] > -30) {
      return 0.9 + Math.random() * 0.6
    }
    return 0.7 + Math.random() * 0.6
  }

  return (
    <group>
      {treePositions.map((position, index) => (
        <Tree 
          key={`tree-${index}`} 
          position={position} 
          scale={getRandomScale(position)}
        />
      ))}
    </group>
  )
}

// Mountain component for the background
function Mountains() {
  // Define mountain positions and sizes
  const mountains: Array<MountainData> = [
    { position: [-40, 20, -30], size: [15, 40, 15], color: '#4a5568' }, // Left mountain
    { position: [-20, 25, -35], size: [12, 50, 12], color: '#2d3748' }, // Left-center mountain
    { position: [0, 30, -40], size: [18, 60, 18], color: '#1a202c' },   // Center mountain
    { position: [25, 22, -35], size: [14, 44, 14], color: '#2d3748' },  // Right-center mountain
    { position: [45, 18, -30], size: [16, 36, 16], color: '#4a5568' },  // Right mountain
  ]

  return (
    <group>
      {mountains.map((mountain, index) => (
        <mesh
          key={index}
          position={mountain.position}
          rotation={[0, Math.PI / 4, 0]} // Rotate to create a more interesting shape
        >
          <coneGeometry args={[mountain.size[0] / 2, mountain.size[1], 4]} />
          <meshStandardMaterial 
            color={mountain.color}
            roughness={0.8}
            metalness={0.2}
            flatShading
          />
        </mesh>
      ))}
      {/* Add some smaller hills in front of the mountains */}
      {Array.from({ length: 8 }).map((_, index) => {
        const x = (index - 4) * 15
        const height = 5 + Math.random() * 5
        const position: [number, number, number] = [x, height / 2, -20]
        return (
          <mesh
            key={`hill-${index}`}
            position={position}
            rotation={[0, Math.PI / 4, 0]}
          >
            <coneGeometry args={[4, height, 4]} />
            <meshStandardMaterial 
              color="#718096"
              roughness={0.9}
              metalness={0.1}
              flatShading
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Main scene component
function Scene({ buildings, onBuildingClick }: NeighborhoodSceneProps) {
  const { camera } = useThree()
  
  // Set up initial camera position with much higher vantage point
  camera.position.set(0, 600, 0)
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
      <Lake />
      <Forest />
      <Mountains />
      <Ground />
      {buildings.map((building) => (
        <group key={building.id}>
          <Building
            position={building.position}
            size={building.size}
            color={building.color}
            onClick={() => onBuildingClick({
              name: building.name,
              type: building.category,
              description: `Total Spent: $${building.totalSpent.toLocaleString()}`,
              hours: 'Hours not available',
              address: 'Address not available',
              features: [],
              id: building.id
            })}
            name={building.name}
            type={building.category}
            id={building.id}
          />
          <BuildingLabel position={building.position} name={building.name} />
        </group>
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
        maxDistance={800}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 2.3}
      />
    </>
  )
}

// Main component that wraps the Canvas
export default function NeighborhoodScene({ buildings, onBuildingClick }: NeighborhoodSceneProps) {
  const modalManagerRef = useRef<ModalManagerHandle>(null)

  const handleBuildingClick = (info: BuildingInfo) => {
    modalManagerRef.current?.addModal(info)
    onBuildingClick(info)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 600, 0], fov: 50 }}>
        <Scene buildings={buildings} onBuildingClick={handleBuildingClick} />
        <Environment preset="city" />
      </Canvas>
      <ModalManager ref={modalManagerRef} />
    </div>
  )
} 