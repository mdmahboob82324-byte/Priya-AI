import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshWobbleMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

// Inner Reactor Energy Sphere
function CoreSphere({ state }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  // State-based color & wobble intensity
  let color = "#00f0ff";
  let factor = 0.4;
  let speed = 2;

  if (state === 'thinking') {
    color = "#ffd700"; // Gold when thinking
    factor = 0.8;
    speed = 5;
  } else if (state === 'speaking') {
    color = "#0077ff"; // Intense Electric Blue when speaking
    factor = 0.6;
    speed = 8;
  }

  return (
    <Sphere ref={meshRef} args={[1.2, 64, 64]}>
      <MeshWobbleMaterial
        attach="material"
        color={color}
        factor={factor}
        speed={speed}
        roughness={0.1}
        metalness={0.8}
        wireframe={true}
        transparent={true}
        opacity={0.85}
      />
    </Sphere>
  );
}

// Outer Rotating Holographic Rings
function HolographicRings({ state }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const multiplier = state === 'thinking' ? 2.5 : state === 'speaking' ? 4 : 1;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4 * multiplier;
      ring1Ref.current.rotation.y = t * 0.6 * multiplier;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = t * 0.5 * multiplier;
      ring2Ref.current.rotation.x = -t * 0.3 * multiplier;
    }
  });

  const ringColor = state === 'thinking' ? '#ffd700' : '#00f0ff';

  return (
    <group>
      {/* Outer Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardGeometry color={ringColor} wireframe={true} emissive={ringColor} emissiveIntensity={0.8} />
      </mesh>

      {/* Outer Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshStandardGeometry color="#0077ff" wireframe={true} emissive="#0077ff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// Particle Field Background
function ParticleField() {
  const count = 300;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef();

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00f0ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function JarvisCore3D({ state = 'idle' }) {
  return (
    <div className="relative w-full h-[360px] md:h-[450px] hud-panel rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-stark-cyan/30">
      
      {/* State Status HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-stark-dark/80 px-4 py-1.5 rounded-full border border-stark-cyan/40">
        <span className={`w-3 h-3 rounded-full ${
          state === 'thinking' ? 'bg-stark-gold animate-ping' :
          state === 'speaking' ? 'bg-stark-cyan animate-pulse' :
          'bg-emerald-400'
        }`}></span>
        <span className="text-xs font-mono tracking-wider uppercase text-slate-200">
          CORE STATE: <strong className="text-stark-cyan">{state}</strong>
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ffd700" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <CoreSphere state={state} />
          <HolographicRings state={state} />
        </Float>
        
        <ParticleField />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* Futuristic Bottom Grid Decal */}
      <div className="absolute bottom-3 text-center pointer-events-none">
        <p className="text-[10px] font-mono text-stark-cyan/70 tracking-[0.3em] uppercase">
          STARK INDUSTRIES QUANTUM REACTOR CORE v4.2
        </p>
      </div>
    </div>
  );
}
