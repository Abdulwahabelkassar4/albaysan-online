import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D Procedural Blooming Flower Component
 * - Concentric layers of 3D curved petals with soft rose/peony velvet finish
 * - Smooth, natural mouse tracking (flower gently faces cursor like leaning towards the light)
 * - Calibrated Euler angles: no inverted flips or extreme wobbling
 * - Seamless transparent WebGL canvas
 */
const BloomingFlower3D = ({ className = "" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 220;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xfff0f6, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(2, 4, 6);
    scene.add(mainLight);

    const roseLight = new THREE.PointLight(0xf43f8e, 2.5, 15);
    roseLight.position.set(-2, -1, 3);
    scene.add(roseLight);

    const goldCoreLight = new THREE.PointLight(0xfde047, 1.8, 8);
    goldCoreLight.position.set(0, 0, 2);
    scene.add(goldCoreLight);

    // Create 3D curved petal geometry
    const createPetalGeometry = (widthFactor = 1, lengthFactor = 1, curveFactor = 0.45) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(
        0.55 * widthFactor,
        0.35 * lengthFactor,
        0.75 * widthFactor,
        1.05 * lengthFactor,
        0,
        1.55 * lengthFactor
      );
      shape.bezierCurveTo(
        -0.75 * widthFactor,
        1.05 * lengthFactor,
        -0.55 * widthFactor,
        0.35 * lengthFactor,
        0,
        0
      );

      const geometry = new THREE.ShapeGeometry(shape, 12);

      // Natural bowl curvature
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const normY = y / (1.55 * lengthFactor);
        const z = -Math.sin(normY * Math.PI) * curveFactor - (x * x) * 0.18;
        pos.setZ(i, z);
      }
      geometry.computeVertexNormals();
      return geometry;
    };

    // Master Pivot & Flower Group
    // Master pivot handles mouse tilt; inner group handles slow ambient spin and breathing
    const tiltPivot = new THREE.Group();
    const flowerGroup = new THREE.Group();
    tiltPivot.add(flowerGroup);
    scene.add(tiltPivot);

    // Flower petal layers
    const tiers = [
      // Outer layer
      { count: 8, radius: 0.38, scale: 1.35, pitch: 1.15, color: 0xf43f8e, roughness: 0.35, curve: 0.65 },
      // Mid-outer layer
      { count: 7, radius: 0.28, scale: 1.12, pitch: 0.92, color: 0xff639f, roughness: 0.3, curve: 0.55 },
      // Mid-inner layer
      { count: 6, radius: 0.18, scale: 0.9, pitch: 0.7, color: 0xfda4af, roughness: 0.25, curve: 0.45 },
      // Inner bud layer
      { count: 5, radius: 0.09, scale: 0.65, pitch: 0.45, color: 0xffe4e6, roughness: 0.2, curve: 0.38 },
    ];

    const petalMeshes = [];
    const geometriesToDispose = [];
    const materialsToDispose = [];

    tiers.forEach((tier, tierIdx) => {
      const geom = createPetalGeometry(1, 1, tier.curve);
      geometriesToDispose.push(geom);

      const mat = new THREE.MeshStandardMaterial({
        color: tier.color,
        roughness: tier.roughness,
        metalness: 0.08,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
      });
      materialsToDispose.push(mat);

      for (let i = 0; i < tier.count; i++) {
        const angle = (i / tier.count) * Math.PI * 2 + tierIdx * 0.42;
        const mesh = new THREE.Mesh(geom, mat);

        mesh.position.x = Math.cos(angle) * tier.radius;
        mesh.position.y = Math.sin(angle) * tier.radius;
        mesh.position.z = -tierIdx * 0.1;

        mesh.scale.set(tier.scale, tier.scale, tier.scale);

        mesh.rotation.z = angle - Math.PI / 2;
        mesh.rotation.x = tier.pitch;

        flowerGroup.add(mesh);

        petalMeshes.push({
          mesh,
          baseRotX: tier.pitch,
          tierIdx,
        });
      }
    });

    // Glowing Golden Stamen (Core Blossom Particles)
    const stamenCount = 50;
    const stamenGeo = new THREE.BufferGeometry();
    const stamenPositions = new Float32Array(stamenCount * 3);

    for (let i = 0; i < stamenCount * 3; i += 3) {
      const r = Math.random() * 0.28;
      const theta = Math.random() * Math.PI * 2;
      stamenPositions[i] = Math.cos(theta) * r;
      stamenPositions[i + 1] = Math.sin(theta) * r;
      stamenPositions[i + 2] = 0.08 + Math.random() * 0.35;
    }

    stamenGeo.setAttribute("position", new THREE.BufferAttribute(stamenPositions, 3));
    geometriesToDispose.push(stamenGeo);

    const stamenMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.12,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(stamenMat);

    const stamen = new THREE.Points(stamenGeo, stamenMat);
    flowerGroup.add(stamen);

    // Initial slight natural angle facing the viewer
    tiltPivot.rotation.x = 0.15;
    tiltPivot.rotation.y = 0.0;

    // Smooth, Calibrated Mouse Tracking
    let targetTiltX = 0.15;
    let targetTiltY = 0.0;
    let currentTiltX = 0.15;
    let currentTiltY = 0.0;

    const handleMouseMove = (e) => {
      // Normalize mouse to [-1, 1] relative to viewport center
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Restrict max tilt to subtle luxury range (max ±0.28 rad ~ 16 degrees)
      targetTiltY = normX * 0.35;
      targetTiltX = 0.15 - normY * 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Render loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth damped lerp towards target mouse tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.045;
      currentTiltY += (targetTiltY - currentTiltY) * 0.045;

      tiltPivot.rotation.x = currentTiltX;
      tiltPivot.rotation.y = currentTiltY;

      // Slow, relaxing continuous rotation on Z axis
      flowerGroup.rotation.z = elapsedTime * 0.08;

      // Organic blooming / breathing pulse (petals open & close gently)
      const bloomFactor = Math.sin(elapsedTime * 1.3) * 0.12;
      const breatheScale = 1 + Math.sin(elapsedTime * 1.6) * 0.025;

      petalMeshes.forEach((p) => {
        const layerMultiplier = 1 + (4 - p.tierIdx) * 0.3;
        p.mesh.rotation.x = p.baseRotX + bloomFactor * layerMultiplier;
      });

      flowerGroup.scale.set(breatheScale, breatheScale, breatheScale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center pointer-events-none ${className}`}
      style={{ width: "220px", height: "220px" }}
    />
  );
};

export default React.memo(BloomingFlower3D);
