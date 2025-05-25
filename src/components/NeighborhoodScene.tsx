import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { db } from '../lib/supabase'
import { BuildingModal, ModalManager } from '../features/BuildingModal/index'
import type { BuildingInfo, ModalManagerHandle } from '../features/BuildingModal/index'

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