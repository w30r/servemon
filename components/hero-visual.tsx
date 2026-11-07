"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero's focal point: a procedural 8-pointed Islamic star rendered as
 * frosted glass with lime/gold rim light, a thin orbit and gold dust.
 *
 * three.js is imported lazily inside the effect and only on wide screens with
 * motion allowed, so phones never download the renderer. The inline SVG
 * medallion underneath is both the loading state and the permanent fallback.
 */
function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 8;
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(
        cy +
        radius * Math.sin(angle)
      ).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

const SVG_STAR = starPoints(100, 100, 84, 38);

export default function HeroVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!wide.matches || still.matches) return;

    let disposed = false;
    let disposeScene = () => {};

    void (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import(
          "three/examples/jsm/environments/RoomEnvironment.js"
        );
        if (disposed || !hostRef.current) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        if (!renderer.capabilities.isWebGL2) {
          renderer.dispose();
          return;
        }

        const hostEl = hostRef.current;
        const canvas = renderer.domElement;
        canvas.className = "hero-canvas";
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.98;
        hostEl.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
        camera.position.set(0, 0, 6.4);

        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;

        const group = new THREE.Group();
        group.scale.setScalar(1.08);
        scene.add(group);

        // Two squares rotated 45° against each other make the khatim star.
        const shape = new THREE.Shape();
        const radii = [1, 0.44];
        for (let i = 0; i < 16; i++) {
          const radius = radii[i % 2];
          const angle = Math.PI / 2 + (i * Math.PI) / 8;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();

        const starGeometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.32,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.06,
          bevelSegments: 4,
          curveSegments: 2,
        });
        starGeometry.center();

        const glass = new THREE.MeshPhysicalMaterial({
          color: 0xc9e4dc,
          metalness: 0.05,
          roughness: 0.18,
          transmission: 0.9,
          thickness: 1.35,
          ior: 1.45,
          clearcoat: 1,
          clearcoatRoughness: 0.2,
          envMapIntensity: 0.85,
        });
        const star = new THREE.Mesh(starGeometry, glass);
        group.add(star);

        const edgeGeometry = new THREE.EdgesGeometry(starGeometry, 18);
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: 0xd8f055,
          transparent: true,
          opacity: 0.42,
        });
        group.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xffdf6d,
          transparent: true,
          opacity: 0.45,
        });
        const ringGeometry = new THREE.TorusGeometry(1.78, 0.012, 8, 160);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.set(1.28, 0.18, 0.35);
        group.add(ring);

        const haloGeometry = new THREE.TorusGeometry(1.98, 0.008, 8, 160);
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: 0xa3c6c0,
          transparent: true,
          opacity: 0.32,
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.rotation.set(1.85, 0.6, -0.25);
        group.add(halo);

        const dustCount = 90;
        const positions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
          const radius = 2.1 + Math.random() * 1.4;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.cos(phi);
          positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }
        const dustGeometry = new THREE.BufferGeometry();
        dustGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        const dustMaterial = new THREE.PointsMaterial({
          color: 0xffdf6d,
          size: 0.026,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const dust = new THREE.Points(dustGeometry, dustMaterial);
        group.add(dust);

        const key = new THREE.DirectionalLight(0xe9ffb0, 1.7);
        key.position.set(4, 6, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xff9a70, 0.7);
        rim.position.set(-5, -2, -3);
        scene.add(rim);

        const pointer = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        const onPointerMove = (event: PointerEvent) => {
          const rect = hostEl.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });

        let inView = true;
        const observer = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
          },
          { threshold: 0.05 },
        );
        observer.observe(hostEl);

        const resizeObserver = new ResizeObserver(() => {
          const width = hostEl.clientWidth;
          const height = hostEl.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        });
        resizeObserver.observe(hostEl);

        const timer = new THREE.Timer();
        timer.connect(document);
        let frame = 0;
        let firstFrame = true;

        const tick = (timestamp?: number) => {
          frame = requestAnimationFrame(tick);
          timer.update(timestamp);
          const delta = Math.min(timer.getDelta(), 0.05);
          if (document.hidden || !inView) return;

          const time = timer.getElapsed();
          pointer.x += (target.x - pointer.x) * 0.045;
          pointer.y += (target.y - pointer.y) * 0.045;

          group.rotation.y += delta * 0.16;
          group.rotation.x = Math.sin(time * 0.45) * 0.08 + pointer.y * 0.12;
          group.position.y = Math.sin(time * 0.7) * 0.08;
          ring.rotation.z += delta * 0.09;
          halo.rotation.y -= delta * 0.06;
          dust.rotation.y -= delta * 0.03;

          camera.position.x = pointer.x * 0.34;
          camera.position.y = -pointer.y * 0.24;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);

          if (firstFrame) {
            firstFrame = false;
            canvas.style.opacity = "1";
            setRendered(true);
          }
        };
        tick();

        disposeScene = () => {
          cancelAnimationFrame(frame);
          timer.disconnect();
          observer.disconnect();
          resizeObserver.disconnect();
          window.removeEventListener("pointermove", onPointerMove);
          scene.environment = null;
          envTexture.dispose();
          pmrem.dispose();
          starGeometry.dispose();
          edgeGeometry.dispose();
          ringGeometry.dispose();
          haloGeometry.dispose();
          dustGeometry.dispose();
          glass.dispose();
          edgeMaterial.dispose();
          ringMaterial.dispose();
          haloMaterial.dispose();
          dustMaterial.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        // WebGL unavailable or the chunk failed to load — keep the SVG.
      }
    })();

    return () => {
      disposed = true;
      disposeScene();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[440px]"
      aria-hidden="true"
    >
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <svg
        viewBox="0 0 200 200"
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
          rendered ? "opacity-0" : "opacity-100"
        }`}
      >
        <defs>
          <linearGradient id="hero-star" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4fbf4" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#d1e3e0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a3c6c0" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="rgba(216,240,85,0.18)"
          strokeWidth="0.7"
        />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(163,198,192,0.22)"
          strokeWidth="0.6"
        />
        <polygon
          points={SVG_STAR}
          fill="url(#hero-star)"
          stroke="rgba(216,240,85,0.55)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
