import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface ChessPiece3DProps {
  type: string;
  color: 'w' | 'b';
  position: [number, number, number];
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}

const pieceGeometries: Record<string, { height: number; topRadius: number; bottomRadius: number }> = {
  p: { height: 0.6, topRadius: 0.15, bottomRadius: 0.2 },
  r: { height: 0.8, topRadius: 0.25, bottomRadius: 0.25 },
  n: { height: 0.9, topRadius: 0.2, bottomRadius: 0.25 },
  b: { height: 1.0, topRadius: 0.15, bottomRadius: 0.25 },
  q: { height: 1.2, topRadius: 0.2, bottomRadius: 0.3 },
  k: { height: 1.3, topRadius: 0.18, bottomRadius: 0.3 },
};

export const ChessPiece3D = ({ type, color, position, isSelected, onClick }: ChessPiece3DProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const geometry = pieceGeometries[type] || pieceGeometries.p;
  const pieceColor = color === 'w' ? '#f5f5dc' : '#2d2d2d';
  const emissiveColor = isSelected ? '#ffd700' : hovered ? '#88cc88' : '#000000';
  const emissiveIntensity = isSelected ? 0.5 : hovered ? 0.3 : 0;

  // Animate selected pieces
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + geometry.height / 2 + Math.sin(state.clock.elapsedTime * 3) * 0.05 + 0.1;
    } else if (meshRef.current) {
      meshRef.current.position.y = position[1] + geometry.height / 2;
    }
  });

  return (
    <group position={new Vector3(position[0], 0, position[2])}>
      {/* Base */}
      <mesh
        ref={meshRef}
        position={[0, geometry.height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[geometry.topRadius, geometry.bottomRadius, geometry.height, 16]} />
        <meshStandardMaterial 
          color={pieceColor} 
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Top decoration based on piece type */}
      {type === 'k' && (
        <mesh position={[0, geometry.height + 0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      {type === 'k' && (
        <mesh position={[0, geometry.height + 0.25, 0]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      
      {type === 'q' && (
        <mesh position={[0, geometry.height + 0.1, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      
      {type === 'b' && (
        <mesh position={[0, geometry.height + 0.1, 0]} rotation={[0.3, 0, 0]} castShadow>
          <coneGeometry args={[0.12, 0.25, 16]} />
          <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      
      {type === 'n' && (
        <mesh position={[0.05, geometry.height, 0]} rotation={[0, 0, -0.5]} castShadow>
          <boxGeometry args={[0.15, 0.3, 0.1]} />
          <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      
      {type === 'r' && (
        <>
          <mesh position={[-0.12, geometry.height + 0.08, 0]} castShadow>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0.12, geometry.height + 0.08, 0]} castShadow>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, geometry.height + 0.08, -0.12]} castShadow>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, geometry.height + 0.08, 0.12]} castShadow>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
};
