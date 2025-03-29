'use client';
import { useEffect, useRef } from 'react';
import Delaunay from 'delaunay-fast';
import styles from './StarryBackground.module.css';

const StarryBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const flares = useRef([]);
  const shootingStars = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const nPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  // Settings
  const settings = {
    particleCount: 200, // Increased number of stars
    flareCount: 20, // Increased number of flares
    motion: 0.05,
    tilt: 0.05,
    colors: ['#FFEED4', '#A8D8FF', '#FFD1DC', '#C8A2C8'], // Added color variations
    particleSizeBase: 1,
    particleSizeMultiplier: 0.5,
    flareSizeBase: 100,
    flareSizeMultiplier: 100,
    lineWidth: 1,
    linkChance: 75,
    linkLengthMin: 5,
    linkLengthMax: 7,
    linkOpacity: 0.25,
    linkFade: 90,
    linkSpeed: 1,
    glareAngle: -60,
    glareOpacityMultiplier: 0.05,
    renderParticles: true,
    renderParticleGlare: true,
    renderFlares: true,
    renderLinks: true,
    renderMesh: false,
    flicker: true,
    flickerSmoothing: 15,
    blurSize: 0,
    orbitTilt: true,
    randomMotion: true,
    noiseLength: 1000,
    noiseStrength: 1,
    shootingStarChance: 0, // Chance of a shooting star appearing
    shootingStarSpeed: 5, // Speed of shooting stars
  };

  class Particle {
    constructor() {
      this.x = this.random(-0.1, 1.1, true);
      this.y = this.random(-0.1, 1.1, true);
      this.z = this.random(0, 4);
      this.color = settings.colors[Math.floor(Math.random() * settings.colors.length)]; // Random color
      this.opacity = this.random(0.1, 1, true);
      this.flicker = 0;
      this.neighbors = [];
      this.twinkle = Math.random() * 0.5 + 0.5; // Twinkle effect
    }

    random(min, max, float) {
      return float
        ? Math.random() * (max - min) + min
        : Math.floor(Math.random() * (max - min + 1)) + min;
    }

    render(context, canvas, mouse, nPos) {
      const pos = this.position(canvas, mouse, nPos);
      const r =
        (this.z * settings.particleSizeMultiplier + settings.particleSizeBase) *
        (Math.max(canvas.width, canvas.height) / 1000);
      let o = this.opacity;

      // Twinkle effect
      if (settings.flicker) {
        const newVal = this.random(-0.5, 0.5, true);
        this.flicker += (newVal - this.flicker) / settings.flickerSmoothing;
        o = Math.min(Math.max(o + this.flicker * this.twinkle, 0), 1);
      }

      context.fillStyle = this.color;
      context.globalAlpha = o;
      context.beginPath();
      context.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      context.fill();

      // Glow effect
      if (settings.renderParticleGlare) {
        context.globalAlpha = o * settings.glareOpacityMultiplier;
        context.beginPath();
        context.ellipse(
          pos.x,
          pos.y,
          r * 100,
          r,
          (settings.glareAngle -
            ((nPos.x - 0.5) * settings.noiseStrength * settings.motion)) *
            (Math.PI / 180),
          0,
          Math.PI * 2
        );
        context.fill();
        context.globalAlpha = 1;
      }
    }

    position(canvas, mouse, nPos) {
      return {
        x:
          this.x * canvas.width +
          (canvas.width / 2 - mouse.x + (nPos.x - 0.5) * settings.noiseStrength) *
            this.z *
            settings.motion,
        y:
          this.y * canvas.height +
          (canvas.height / 2 - mouse.y + (nPos.y - 0.5) * settings.noiseStrength) *
            this.z *
            settings.motion,
      };
    }
  }

  class ShootingStar {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.speed = settings.shootingStarSpeed;
      this.length = Math.random() * 50 + 50; // Length of the shooting star
      this.opacity = 1;
      this.angle = Math.random() * Math.PI * 2; // Random direction
    }

    render(context) {
      context.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(
        this.x + Math.cos(this.angle) * this.length,
        this.y + Math.sin(this.angle) * this.length
      );
      context.stroke();

      // Update position and opacity
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= 0.01;

      // Reset if out of bounds
      if (
        this.x < 0 ||
        this.x > window.innerWidth ||
        this.y < 0 ||
        this.y > window.innerHeight
      ) {
        this.opacity = 0;
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);
    };

    const init = () => {
      resize();
      mouse.current.x = canvas.width / 2;
      mouse.current.y = canvas.height / 2;

      // Initialize particles
      particles.current = [];
      const points = [];
      for (let i = 0; i < settings.particleCount; i++) {
        const p = new Particle();
        particles.current.push(p);
        points.push([p.x * 1000, p.y * 1000]);
      }

      // Delaunay triangulation
      const vertices = Delaunay.triangulate(points);
      const triangles = [];
      let tri = [];
      for (let i = 0; i < vertices.length; i++) {
        if (tri.length === 3) {
          triangles.push(tri);
          tri = [];
        }
        tri.push(vertices[i]);
      }

      // Set neighbors
      particles.current.forEach((particle, index) => {
        triangles.forEach((triangle) => {
          if (triangle.includes(index)) {
            triangle.forEach((value) => {
              if (value !== index && !particle.neighbors.includes(value)) {
                particle.neighbors.push(value);
              }
            });
          }
        });
      });

      // Initialize flares
      flares.current = [];
      for (let i = 0; i < settings.flareCount; i++) {
        flares.current.push(new Particle()); // Use Particle class for flares
      }

      // Initialize shooting stars
      shootingStars.current = [];
    };

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render particles
      if (settings.renderParticles) {
        particles.current.forEach((particle) => {
          particle.render(context, canvas, mouse.current, nPos.current);
        });
      }

      // Render flares
      if (settings.renderFlares) {
        flares.current.forEach((flare) => {
          flare.render(context, canvas, mouse.current, nPos.current);
        });
      }

      // Render shooting stars
      if (Math.random() < settings.shootingStarChance) {
        shootingStars.current.push(new ShootingStar());
      }
      shootingStars.current.forEach((star, index) => {
        star.render(context);
        if (star.opacity <= 0) {
          shootingStars.current.splice(index, 1);
        }
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    init();
    render();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.stars} />;
};

export default StarryBackground;