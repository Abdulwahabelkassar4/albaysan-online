import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D Procedural Blooming Flower Component
 * - 100% Autonomous & faces directly forward towards the viewer
 * - Perfectly symmetrical concentric petal crown
 * - Gentle floating bob, rhythmic blooming/breathing, and smooth spin
 * - 100% transparent WebGL canvas
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
    camera.lookAt(0, 0, 0);

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
    const ambientLight = new THREE.AmbientLight(0xfff0f6, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(2, 4, 6);
    scene.add(mainLight);

    const roseLight = new THREE.PointLight(0xf43f8e, 2.5, 15);
    roseLight.position.set(-2, -1, 3);
    scene.add(roseLight);

    const goldCoreLight = new THREE.PointLight(0xfde047, 2.0, 8);
    goldCoreLight.position.set(0, 0, 2);
    scene.add(goldCoreLight);

    // Create 3D curved petal geometry
    const createPetalGeometry = (widthFactor = 1, lengthFactor = 1, curveFactor = 0.4) => {
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

      // Natural forward cup curvature
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const normY = y / (1.55 * lengthFactor);
        const z = -Math.sin(normY * Math.PI) * curveFactor - (x * x) * 0.15;
        pos.setZ(i, z);
      }
      geometry.computeVertexNormals();
      return geometry;
    };

    // Master Flower & Spinner Hierarchy (faces directly at the camera)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    const spinnerGroup = new THREE.Group();
    masterGroup.add(spinnerGroup);

    // Flower petal layers (calibrated open bloom facing the user)
    const tiers = [
      // Outer broad petals
      { count: 8, radius: 0.42, scale: 1.38, pitch: 0.7, color: 0xf43f8e, roughness: 0.35, curve: 0.5 },
      // Mid-outer petals
      { count: 7, radius: 0.3, scale: 1.15, pitch: 0.55, color: 0xff639f, roughness: 0.3, curve: 0.45 },
      // Mid-inner petals
      { count: 6, radius: 0.2, scale: 0.92, pitch: 0.4, color: 0xfda4af, roughness: 0.25, curve: 0.38 },
      // Inner core blossom
      { count: 5, radius: 0.1, scale: 0.68, pitch: 0.25, color: 0xffe4e6, roughness: 0.2, curve: 0.3 },
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
        opacity: 0.95,
      });
      materialsToDispose.push(mat);

      for (let i = 0; i < tier.count; i++) {
        const angle = (i / tier.count) * Math.PI * 2 + tierIdx * 0.42;
        const mesh = new THREE.Mesh(geom, mat);

        mesh.position.x = Math.cos(angle) * tier.radius;
        mesh.position.y = Math.sin(angle) * tier.radius;
        mesh.position.z = -tierIdx * 0.08;

        mesh.scale.set(tier.scale, tier.scale, tier.scale);

        mesh.rotation.z = angle - Math.PI / 2;
        mesh.rotation.x = tier.pitch;

        spinnerGroup.add(mesh);

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
      const r = Math.random() * 0.25;
      const theta = Math.random() * Math.PI * 2;
      stamenPositions[i] = Math.cos(theta) * r;
      stamenPositions[i + 1] = Math.sin(theta) * r;
      stamenPositions[i + 2] = 0.08 + Math.random() * 0.3;
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
    spinnerGroup.add(stamen);

    // Render loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth slow rotation on Z axis (spinning directly facing the user)
      spinnerGroup.rotation.z = elapsedTime * 0.14;

      // Gentle vertical floating bob
      masterGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.06;

      // Organic blooming / breathing pulse (petals open & close softly)
      const bloomFactor = Math.sin(elapsedTime * 1.3) * 0.1;
      const breatheScale = 1 + Math.sin(elapsedTime * 1.6) * 0.025;

      petalMeshes.forEach((p) => {
        const layerMultiplier = 1 + (4 - p.tierIdx) * 0.28;
        p.mesh.rotation.x = p.baseRotX + bloomFactor * layerMultiplier;
      });

      spinnerGroup.scale.set(breatheScale, breatheScale, breatheScale);
      stamen.rotation.z = -elapsedTime * 0.22;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);

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
