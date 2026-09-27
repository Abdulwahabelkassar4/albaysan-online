import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Ultra-lightweight 3D WebGL Petal & Stardust Canvas
 * - Generates soft, fluttering cherry blossom / rose petals in 3D space
 * - Extremely lightweight: minimal vertex count, zero CPU lag, automatic pause when inactive
 */
const FloralCanvas3D = ({ interactive = true, density = 45, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create realistic petal geometry (curved leaf/petal shape)
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.4, 0.4, 0.6, 1.2, 0, 1.8);
    petalShape.bezierCurveTo(-0.6, 1.2, -0.4, 0.4, 0, 0);

    const petalGeometry = new THREE.ShapeGeometry(petalShape, 8);
    petalGeometry.center();

    // Petal color palette (Blush pink, rose gold, soft peony, lavender mist)
    const petalColors = [
      0xffb3c6, // soft blush pink
      0xff758f, // rose blossom
      0xff8fab, // vibrant sakura
      0xfbcfe8, // dreamy light pink
      0xf472b6, // hot rose
      0xe9d5ff, // pastel lilac
    ];

    const materials = petalColors.map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
        })
    );

    // Instanced petals group
    const petalsGroup = new THREE.Group();
    const petalData = [];

    for (let i = 0; i < density; i++) {
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(petalGeometry, mat);

      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 16;
      const scale = 0.25 + Math.random() * 0.45;

      mesh.position.set(x, y, z);
      mesh.scale.set(scale, scale * (1 + Math.random() * 0.3), scale);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      petalsGroup.add(mesh);

      petalData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.025,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
        fallSpeed: 0.012 + Math.random() * 0.02,
        swaySpeed: 0.8 + Math.random() * 1.5,
        swayRange: 0.4 + Math.random() * 0.8,
        timeOffset: Math.random() * 100,
      });
    }

    scene.add(petalsGroup);

    // Golden / Stardust Glimmering Particles (Sparkles)
    const sparkleCount = 35;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePositions[i] = (Math.random() - 0.5) * 30;
      sparklePositions[i + 1] = (Math.random() - 0.5) * 20;
      sparklePositions[i + 2] = (Math.random() - 0.5) * 12;
    }

    sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Render loop with high-efficiency frame throttle
    let animationFrameId;
    let clock = new THREE.Clock();
    let isVisible = true;

    // IntersectionObserver to freeze WebGL when user scrolls out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return; // Save GPU & Battery

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      camera.position.x = mouseX * 0.6;
      camera.position.y = -mouseY * 0.6;
      camera.lookAt(0, 0, 0);

      // Animate Petals falling and swirling
      petalData.forEach((p) => {
        const t = elapsedTime * p.swaySpeed + p.timeOffset;
        p.mesh.position.y -= p.fallSpeed;
        p.mesh.position.x = p.baseX + Math.sin(t) * p.swayRange + mouseX * 0.8;
        p.mesh.position.z = p.baseZ + Math.cos(t * 0.7) * 0.4;

        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.z += p.rotSpeedZ;

        // Reset if petal falls below bottom
        if (p.mesh.position.y < -12) {
          p.mesh.position.y = 12;
          p.mesh.position.x = (Math.random() - 0.5) * 32;
        }
      });

      // Sparkle pulse
      sparkles.rotation.y = elapsedTime * 0.02;
      sparkles.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      // Clean up Three.js resources to prevent memory leak
      petalGeometry.dispose();
      materials.forEach((m) => m.dispose());
      sparkleGeo.dispose();
      sparkleMat.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, density]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
};

export default React.memo(FloralCanvas3D);
