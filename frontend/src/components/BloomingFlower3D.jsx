import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D Procedural Blooming Flower Component
 * - Features concentric layers of 3D rose/lotus petals
 * - Smooth breathing & blooming animation (petals open/close organically)
 * - Interactive 3D tilt towards mouse cursor
 * - 100% transparent background (no white box or circular frames)
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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lighting for luxury specular reflections
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff6b9d, 2.5, 20);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const topLight = new THREE.DirectionalLight(0xffe4e6, 1.8);
    topLight.position.set(-2, 5, 4);
    scene.add(topLight);

    const goldLight = new THREE.PointLight(0xfde047, 1.5, 15);
    goldLight.position.set(0, 0, 3);
    scene.add(goldLight);

    // Create a 3D curved petal geometry
    const createPetalGeometry = (widthFactor = 1, lengthFactor = 1, curveFactor = 0.5) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(
        0.5 * widthFactor,
        0.3 * lengthFactor,
        0.7 * widthFactor,
        1.0 * lengthFactor,
        0,
        1.5 * lengthFactor
      );
      shape.bezierCurveTo(
        -0.7 * widthFactor,
        1.0 * lengthFactor,
        -0.5 * widthFactor,
        0.3 * lengthFactor,
        0,
        0
      );

      const geometry = new THREE.ShapeGeometry(shape, 12);
      
      // Bend the petal along the z-axis for natural 3D curvature
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = -Math.sin((y / (1.5 * lengthFactor)) * Math.PI) * curveFactor - (x * x) * 0.15;
        pos.setZ(i, z);
      }
      geometry.computeVertexNormals();
      return geometry;
    };

    // Master Flower Group
    const flowerGroup = new THREE.Group();
    scene.add(flowerGroup);

    // Tier definitions for a multi-layered luxury blooming rose
    const tiers = [
      // Outer layer (large petals)
      { count: 8, radius: 0.35, scale: 1.35, pitch: 1.15, color: 0xf43f8e, roughness: 0.3, curve: 0.7 },
      // Middle layer
      { count: 7, radius: 0.25, scale: 1.1, pitch: 0.9, color: 0xff639f, roughness: 0.25, curve: 0.6 },
      // Inner layer
      { count: 6, radius: 0.15, scale: 0.85, pitch: 0.65, color: 0xfda4af, roughness: 0.2, curve: 0.5 },
      // Core bud petals
      { count: 5, radius: 0.08, scale: 0.6, pitch: 0.4, color: 0xffe4e6, roughness: 0.15, curve: 0.4 },
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
        metalness: 0.12,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });
      materialsToDispose.push(mat);

      for (let i = 0; i < tier.count; i++) {
        const angle = (i / tier.count) * Math.PI * 2 + (tierIdx * 0.45);
        const mesh = new THREE.Mesh(geom, mat);

        // Position on circle
        mesh.position.x = Math.cos(angle) * tier.radius;
        mesh.position.y = Math.sin(angle) * tier.radius;
        mesh.position.z = -tierIdx * 0.12;

        mesh.scale.set(tier.scale, tier.scale, tier.scale);

        // Orient petal pointing outward and flared back
        mesh.rotation.z = angle - Math.PI / 2;
        mesh.rotation.x = tier.pitch;

        flowerGroup.add(mesh);

        petalMeshes.push({
          mesh,
          baseRotX: tier.pitch,
          baseRotZ: angle - Math.PI / 2,
          tierIdx,
          angleOffset: i * 0.2 + tierIdx * 0.5,
        });
      }
    });

    // Glowing Golden Stamen (Center Particle Cluster)
    const stamenCount = 45;
    const stamenGeo = new THREE.BufferGeometry();
    const stamenPositions = new Float32Array(stamenCount * 3);

    for (let i = 0; i < stamenCount * 3; i += 3) {
      const r = Math.random() * 0.25;
      const theta = Math.random() * Math.PI * 2;
      stamenPositions[i] = Math.cos(theta) * r;
      stamenPositions[i + 1] = Math.sin(theta) * r;
      stamenPositions[i + 2] = 0.1 + Math.random() * 0.35;
    }

    stamenGeo.setAttribute("position", new THREE.BufferAttribute(stamenPositions, 3));
    geometriesToDispose.push(stamenGeo);

    const stamenMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.12,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(stamenMat);

    const stamen = new THREE.Points(stamenGeo, stamenMat);
    flowerGroup.add(stamen);

    // Initial slight angle for beauty
    flowerGroup.rotation.x = 0.35;

    // Mouse Tracking for Interactive 3D Parallax Tilt
    let targetRotX = 0.35;
    let targetRotY = 0;
    let currentRotX = 0.35;
    let currentRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.75;
      targetRotX = 0.35 - y * 0.75;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Render loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow lerp
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;

      flowerGroup.rotation.x = currentRotX;
      flowerGroup.rotation.y = currentRotY;
      // Gentle slow continuous spin
      flowerGroup.rotation.z = elapsedTime * 0.12;

      // Breathing / Blooming effect (Petals open and close smoothly)
      const bloomCycle = Math.sin(elapsedTime * 1.2) * 0.16; // gentle opening/closing amplitude
      const breatheScale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;

      petalMeshes.forEach((p) => {
        // Outer petals flare open wider than inner petals
        const layerMultiplier = 1 + (4 - p.tierIdx) * 0.35;
        p.mesh.rotation.x = p.baseRotX + bloomCycle * layerMultiplier;
      });

      // Scale stamen and flower gently
      flowerGroup.scale.set(breatheScale, breatheScale, breatheScale);

      // Stamen sparkle
      stamen.rotation.z = -elapsedTime * 0.2;

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
      className={`relative flex items-center justify-center pointer-events-auto cursor-pointer ${className}`}
      style={{ width: "220px", height: "220px" }}
    />
  );
};

export default React.memo(BloomingFlower3D);
