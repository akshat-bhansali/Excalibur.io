import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { CharacterSoldier } from "./CharacterSoldier";
import { useRef } from "react";
import React from "react";

const RotatingCharacter = ({ color, weapon, animation }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01; // Rotate in place on Y axis
    }
  });

  return (
    <CharacterSoldier
      color={color}
      weapon={weapon}
      animation={animation}
      scale={0.5}
      ref={groupRef}
      position={[0, -1, 0]}
    />
  );
};

export const CharacterShowcase = ({
  color = "black",
  weapon = "AK",
  animation = "Idle",
}) => {
  return (
    <Canvas camera={{ position: [0, -5, 0], fov: 25 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} intensity={1} castShadow />

      <RotatingCharacter color={color} weapon={weapon} animation={animation} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};
