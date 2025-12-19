
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { Orientation, TarotCardData, GestureType } from '../types';
import { CARD_ASPECT_RATIO, CARD_BACK_URL } from '../constants';
import { ParticleSystem } from './ParticleSystem';

interface ThreeSceneProps {
  onCardConfirmed: (card: TarotCardData, orientation: Orientation) => void;
}

export interface ThreeSceneHandle {
  setGesture: (gesture: GestureType, x: number, y: number) => void;
  resetDeck: () => void;
  setActiveCard: (card: TarotCardData) => void;
}

const ThreeScene = forwardRef<ThreeSceneHandle, ThreeSceneProps>(({ onCardConfirmed }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    card: THREE.Group | null;
    particles: ParticleSystem;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    activeCardData: TarotCardData | null;
    isConfirmed: boolean;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    setGesture: (gesture, x, y) => {
      if (!sceneRef.current) return;
      const { raycaster, camera, scene, card, isConfirmed } = sceneRef.current;
      
      // Update normalized coordinates for raycasting
      sceneRef.current.mouse.set(x * 2 - 1, -(y * 2 - 1));

      if (isConfirmed) return;

      if (gesture === GestureType.PINCH && card) {
          // Logic to "pull" the card to camera
          const targetPos = new THREE.Vector3(x * 6 - 3, -(y * 6 - 3), 4);
          card.position.lerp(targetPos, 0.1);
          card.lookAt(camera.position);
      } else if (gesture === GestureType.FIST && card) {
          // Confirm Draw
          sceneRef.current.isConfirmed = true;
          const orientation = Math.random() < 0.5 ? Orientation.UPRIGHT : Orientation.REVERSED;
          
          // Animate rotation based on orientation
          if (orientation === Orientation.REVERSED) {
            card.rotation.z = Math.PI;
          }

          // Trigger ash effect
          sceneRef.current.particles.createAshEffect(card.position.clone());
          
          // Callback after slight delay
          setTimeout(() => {
            if (sceneRef.current?.activeCardData) {
               onCardConfirmed(sceneRef.current.activeCardData, orientation);
            }
          }, 1000);
      } else if (gesture === GestureType.OPEN && card) {
        // Floating idle
        card.position.y += Math.sin(Date.now() * 0.002) * 0.005;
      }
    },
    setActiveCard: (cardData) => {
      if (!sceneRef.current) return;
      sceneRef.current.activeCardData = cardData;
      sceneRef.current.isConfirmed = false;
      
      const { scene } = sceneRef.current;
      if (sceneRef.current.card) scene.remove(sceneRef.current.card);

      // Create new card mesh
      const group = new THREE.Group();
      const loader = new THREE.TextureLoader();
      
      // Card Front
      const frontTex = loader.load(cardData.imageUrl, undefined, undefined, () => {
        // Fallback for failed images
        loader.load('https://picsum.photos/300/500?text=Error', (t) => {
          (frontMat as THREE.MeshBasicMaterial).map = t;
        });
      });
      const backTex = loader.load(CARD_BACK_URL);

      const geometry = new THREE.BoxGeometry(2, 2 * CARD_ASPECT_RATIO, 0.05);
      const frontMat = new THREE.MeshStandardMaterial({ map: frontTex });
      const backMat = new THREE.MeshStandardMaterial({ map: backTex });
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

      const materials = [
        sideMat, sideMat, sideMat, sideMat, 
        frontMat, // Front
        backMat   // Back
      ];

      const mesh = new THREE.Mesh(geometry, materials);
      group.add(mesh);
      group.position.set(0, 0, 0);
      
      // Start face down
      group.rotation.y = Math.PI;

      scene.add(group);
      sceneRef.current.card = group;
    },
    resetDeck: () => {
      if (sceneRef.current?.card) {
        sceneRef.current.scene.remove(sceneRef.current.card);
        sceneRef.current.card = null;
        sceneRef.current.isConfirmed = false;
      }
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x000000, 5, 15);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    const particles = new ParticleSystem();
    scene.add(particles.group);

    sceneRef.current = {
      scene, camera, renderer, 
      card: null, 
      particles, 
      raycaster: new THREE.Raycaster(), 
      mouse: new THREE.Vector2(),
      activeCardData: null,
      isConfirmed: false
    };

    const animate = () => {
      requestAnimationFrame(animate);
      particles.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || 0;
      const h = mountRef.current?.clientHeight || 0;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-none" />;
});

export default ThreeScene;
