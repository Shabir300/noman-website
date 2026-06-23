import * as THREE from 'three';
import gsap from 'gsap';

let scene, camera, renderer, mesh, particles;
let mouseX = 0, mouseY = 0;
let targetRotX = 0, targetRotY = 0;
let animId = null;
let initialized = false;

export function initHero3D() {
  const container = document.getElementById('hero-canvas');
  if (!container || initialized) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !initialized) {
          initialized = true;
          setupScene(container);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(container);
}

function setupScene(container) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Ambient + directional light
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0x8b5cf6, 1.5, 20);
  pointLight.position.set(-3, 2, 3);
  scene.add(pointLight);

  const greenLight = new THREE.PointLight(0x22c55e, 0.8, 15);
  greenLight.position.set(3, -2, 2);
  scene.add(greenLight);

  // Torus knot — abstract market orb
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x0a1628,
    emissiveIntensity: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Inner glow sphere
  const innerGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.15,
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  mesh.add(innerSphere);

  // Particle field
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 12;
    positions[i + 1] = (Math.random() - 0.5) * 12;
    positions[i + 2] = (Math.random() - 0.5) * 12;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
  });
  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Wireframe ring
  const ringGeo = new THREE.TorusGeometry(2.2, 0.02, 8, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.3 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Mouse tracking
  const onMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    targetRotY = mouseX * 0.4;
    targetRotX = mouseY * 0.25;
  };

  container.addEventListener('mousemove', onMouseMove);

  // Touch support
  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: true });

  // Entry animation
  gsap.from(container, { opacity: 0, scale: 0.9, duration: 1.2, ease: 'power3.out' });
  gsap.from('.hero-content > *', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.2,
  });

  // CSS 3D chip parallax
  const chips = document.querySelectorAll('.float-chip');
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    chips.forEach((chip, i) => {
      const depth = (i + 1) * 8;
      chip.style.transform = `translateZ(${60 + i * 20}px) translate(${x * depth * -0.5}px, ${y * depth * -0.5}px)`;
    });
  });

  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mesh.rotation.y += 0.003;
    mesh.rotation.x += 0.001;

    mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.05;
    mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.05;

    mesh.position.y = Math.sin(t * 0.8) * 0.15;
    particles.rotation.y = t * 0.02;
    ring.rotation.z = t * 0.15;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
}
