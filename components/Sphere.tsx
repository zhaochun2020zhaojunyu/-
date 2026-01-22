
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SPHERE_RADIUS, ROTATION_SENSITIVITY, INERTIA_FRICTION } from '../constants';
import { CardData, Vector3, Rotation } from '../types';
import SphereCard from './SphereCard';

interface SphereProps {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

const Sphere: React.FC<SphereProps> = ({ cards, onCardClick }) => {
  const [rotation, setRotation] = useState<Rotation>({ yaw: 0, pitch: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  
  const velocityRef = useRef<Rotation>({ yaw: 0, pitch: 0 });
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const isAutoRotating = useRef(false);

  /**
   * Generates a structured distribution that wraps the sphere densely.
   */
  const getStructuredPositions = (total: number): Vector3[] => {
    const positions: Vector3[] = [];
    const rowConfigs = [
      { phi: Math.PI * 0.12, count: 6 },
      { phi: Math.PI * 0.25, count: 12 },
      { phi: Math.PI * 0.38, count: 15 },
      { phi: Math.PI * 0.50, count: 18 },
      { phi: Math.PI * 0.62, count: 15 },
      { phi: Math.PI * 0.75, count: 12 },
      { phi: Math.PI * 0.88, count: 6 },
    ];

    let currentCardIndex = 0;
    rowConfigs.forEach((row) => {
      for (let i = 0; i < row.count; i++) {
        if (currentCardIndex >= total) break;
        const theta = (i / row.count) * Math.PI * 2;
        positions.push({
          x: Math.cos(theta) * Math.sin(row.phi) * SPHERE_RADIUS,
          y: Math.cos(row.phi) * SPHERE_RADIUS,
          z: Math.sin(theta) * Math.sin(row.phi) * SPHERE_RADIUS,
        });
        currentCardIndex++;
      }
    });

    while (positions.length < total) {
      const i = positions.length;
      const phi = Math.acos(1 - 2 * (i + 0.5) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      positions.push({
        x: Math.cos(theta) * Math.sin(phi) * SPHERE_RADIUS,
        y: Math.cos(phi) * SPHERE_RADIUS,
        z: Math.sin(theta) * Math.sin(phi) * SPHERE_RADIUS,
      });
    }

    return positions;
  };

  const initialPositions = useRef<Vector3[]>(getStructuredPositions(cards.length));

  /**
   * Identifies the card closest to the viewer.
   * Based on the transform rotateX(P) rotateY(Y), the 'front' vector in world space
   * is [0, 0, 1]. To find which card is at the front, we transform this vector
   * back to the initial space using the inverse rotation R_y(-Y) * R_x(-P).
   */
  const updateFrontCard = useCallback((yaw: number, pitch: number) => {
    // If we are auto-rotating to a specific card, we keep that card as "active"
    if (isAutoRotating.current) return;

    let maxDot = -Infinity;
    let closestId = null;

    // The vector in local space that currently faces [0, 0, 1] in world space:
    const vx = -Math.cos(pitch) * Math.sin(yaw);
    const vy = Math.sin(pitch);
    const vz = Math.cos(pitch) * Math.cos(yaw);

    cards.forEach((_, i) => {
      const p = initialPositions.current[i];
      // Dot product to find closeness to the front-facing vector
      const dot = p.x * vx + p.y * vy + p.z * vz;
      if (dot > maxDot) {
        maxDot = dot;
        closestId = i;
      }
    });

    setActiveCardId(closestId);
  }, [cards]);

  const animate = useCallback(() => {
    if (!isDragging && !isAutoRotating.current) {
      if (Math.abs(velocityRef.current.yaw) > 0.0001 || Math.abs(velocityRef.current.pitch) > 0.0001) {
        setRotation(prev => {
          const newRotation = {
            yaw: prev.yaw + velocityRef.current.yaw,
            pitch: prev.pitch + velocityRef.current.pitch
          };
          updateFrontCard(newRotation.yaw, newRotation.pitch);
          return newRotation;
        });
        
        velocityRef.current.yaw *= INERTIA_FRICTION;
        velocityRef.current.pitch *= INERTIA_FRICTION;
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isDragging, updateFrontCard]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    isAutoRotating.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !lastMousePos.current) return;

    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - lastMousePos.current.x;
    const dy = clientY - lastMousePos.current.y;

    const vYaw = dx * ROTATION_SENSITIVITY;
    const vPitch = -dy * ROTATION_SENSITIVITY;

    velocityRef.current = { yaw: vYaw, pitch: vPitch };
    
    setRotation(prev => {
      const next = { yaw: prev.yaw + vYaw, pitch: prev.pitch + vPitch };
      updateFrontCard(next.yaw, next.pitch);
      return next;
    });

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const options = { passive: true };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as any, options);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleCardInteraction = (index: number) => {
    if (index === activeCardId) {
      onCardClick(cards[index]);
    } else {
      // Immediately set active ID for visual feedback
      setActiveCardId(index);
      isAutoRotating.current = true;
      velocityRef.current = { yaw: 0, pitch: 0 };
      
      const targetPos = initialPositions.current[index];
      // theta is angle in XZ plane, phi is angle from Y axis
      const theta = Math.atan2(targetPos.z, targetPos.x);
      const phi = Math.acos(targetPos.y / SPHERE_RADIUS);

      // To bring targetPos to [0, 0, R]:
      const targetYaw = theta - Math.PI / 2;
      const targetPitch = Math.PI / 2 - phi;

      let frame = 0;
      const totalFrames = 60; // 1 second roughly
      const startYaw = rotation.yaw;
      const startPitch = rotation.pitch;

      // Ensure shortest path rotation for yaw
      let diffYaw = targetYaw - startYaw;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

      // Shortest path for pitch
      let diffPitch = targetPitch - startPitch;
      while (diffPitch > Math.PI) diffPitch -= Math.PI * 2;
      while (diffPitch < -Math.PI) diffPitch += Math.PI * 2;

      const animateToTarget = () => {
        if (!isAutoRotating.current) return;
        frame++;
        const t = frame / totalFrames;
        const ease = 1 - Math.pow(1 - t, 5); // easeOutQuint

        const nextYaw = startYaw + diffYaw * ease;
        const nextPitch = startPitch + diffPitch * ease;

        setRotation({ yaw: nextYaw, pitch: nextPitch });

        if (frame < totalFrames) {
          requestAnimationFrame(animateToTarget);
        } else {
          isAutoRotating.current = false;
          // After auto-rotation ends, update active ID properly just in case
          updateFrontCard(nextYaw, nextPitch);
        }
      };

      animateToTarget();
    }
  };

  return (
    <div 
      className="sphere-container relative w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <div 
        style={{
          position: 'relative',
          width: '1px',
          height: '1px',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.pitch}rad) rotateY(${rotation.yaw}rad)`,
          transition: isDragging ? 'none' : 'transform 0.05s linear'
        }}
      >
        {cards.map((card, i) => (
          <SphereCard 
            key={card.id}
            card={card}
            position={initialPositions.current[i]}
            isActive={i === activeCardId}
            onClick={() => handleCardInteraction(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sphere;
