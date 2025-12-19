
import * as THREE from 'three';

export class ParticleSystem {
  group: THREE.Group;
  particles: { mesh: THREE.Points; life: number; velocity: THREE.Vector3 }[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  createAshEffect(position: THREE.Vector3, count: number = 300) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    
    for (let i = 0; i < count; i++) {
      vertices.push(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1
      );
      sizes.push(Math.random() * 0.1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    points.position.copy(position);

    const particleData = {
      mesh: points,
      life: 1.0,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.05 + 0.02,
        (Math.random() - 0.5) * 0.02
      )
    };

    this.particles.push(particleData);
    this.group.add(points);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= 0.01;
      
      // Upward movement + turbulence
      p.mesh.position.add(p.velocity);
      p.velocity.x += (Math.random() - 0.5) * 0.005;
      p.velocity.z += (Math.random() - 0.5) * 0.005;

      const mat = p.mesh.material as THREE.PointsMaterial;
      mat.opacity = p.life;
      
      if (p.life <= 0) {
        this.group.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}
