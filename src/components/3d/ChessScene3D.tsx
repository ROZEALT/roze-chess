import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Square } from 'chess.js';
import { ChessBoard3D } from './ChessBoard3D';

interface ChessScene3DProps {
  fen: string;
  playerColor: 'w' | 'b';
  onMove: (from: Square, to: Square) => boolean;
  isGameOver: boolean;
  turn: 'w' | 'b';
}

export const ChessScene3D = ({ fen, playerColor, onMove, isGameOver, turn }: ChessScene3DProps) => {
  return (
    <div className="w-full aspect-square max-w-[700px] rounded-lg overflow-hidden shadow-2xl">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera 
            makeDefault 
            position={[0, 8, 8]} 
            fov={45}
          />
          
          <OrbitControls 
            enablePan={false}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0, 0]}
          />
          
          {/* Lighting - darker ambient with subtle directional */}
          <ambientLight intensity={0.15} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 8, -5]} intensity={0.2} color="#4a6fa5" />
          <pointLight position={[0, 6, 0]} intensity={0.15} color="#ffffff" />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* Chess board and pieces */}
          <ChessBoard3D
            fen={fen}
            playerColor={playerColor}
            onMove={onMove}
            isGameOver={isGameOver}
            turn={turn}
          />
          
          {/* Floor/table */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.31, 0]} 
            receiveShadow
          >
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
};
