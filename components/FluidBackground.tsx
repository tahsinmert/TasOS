'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface FluidBackgroundProps {
  enabled: boolean;
  onMouseMove?: (x: number, y: number) => void;
  onWindowDrag?: (x: number, y: number) => void;
  onClick?: (x: number, y: number) => void;
  onFPSChange?: (fps: number) => void;
}

export default function FluidBackground({
  enabled,
  onMouseMove,
  onWindowDrag,
  onClick,
  onFPSChange,
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60);

  // WebGL program references
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture[]>([]);
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null);
  const mouseLocationRef = useRef<WebGLUniformLocation | null>(null);
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const prevMousePosRef = useRef({ x: 0.5, y: 0.5 });
  const isDraggingRef = useRef(false);

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', { 
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return false;

    glRef.current = gl;

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader source - Fluid simulation
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      // Hash function for noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Fractional Brownian Motion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }
      
      // Smooth step function
      float smoothstep2(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;
        
        // Mouse influence
        vec2 mouse = u_mouse;
        vec2 mouseDiff = mouse - uv;
        float mouseDist = length(mouseDiff);
        float mouseInfluence = smoothstep2(0.3, 0.0, mouseDist);
        
        // Create fluid motion with time
        vec2 flow = vec2(
          fbm(p * 2.0 + u_time * 0.3),
          fbm(p * 2.0 + u_time * 0.3 + 100.0)
        );
        flow = (flow - 0.5) * 2.0;
        
        // Add mouse influence to flow
        flow += mouseDiff * mouseInfluence * 2.0;
        
        // Sample color with flow distortion
        vec2 samplePos = uv + flow * 0.1;
        float r = fbm(samplePos * 3.0 + u_time * 0.2);
        float g = fbm(samplePos * 3.0 + u_time * 0.25 + 100.0);
        float b = fbm(samplePos * 3.0 + u_time * 0.3 + 200.0);
        
        // Create colorful fluid effect with vibrant colors
        vec3 color1 = vec3(0.1, 0.3, 0.9);  // Deep Blue
        vec3 color2 = vec3(0.9, 0.1, 0.5);  // Bright Pink
        vec3 color3 = vec3(0.1, 0.9, 0.3);  // Bright Green
        vec3 color4 = vec3(0.9, 0.5, 0.1);  // Orange
        
        vec3 color = mix(
          mix(color1, color2, r * 0.8 + 0.2),
          mix(color3, color4, g * 0.8 + 0.2),
          b * 0.6 + 0.4
        );
        
        // Add brightness variation
        float brightness = fbm(samplePos * 2.0 + u_time * 0.1);
        color *= 0.6 + brightness * 0.4;
        
        // Add mouse splash effect with stronger color
        float splashRadius = 0.2;
        float splashDist = distance(uv, mouse);
        float splash = smoothstep2(splashRadius, 0.0, splashDist);
        color += vec3(1.0, 0.95, 0.8) * splash * 0.4;
        
        // Vignette
        float vignette = 1.0 - smoothstep2(0.3, 1.2, length(p));
        color *= 0.7 + vignette * 0.3;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;
    gl.useProgram(program);

    // Create full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    resolutionLocationRef.current = gl.getUniformLocation(program, 'u_resolution');
    mouseLocationRef.current = gl.getUniformLocation(program, 'u_mouse');
    timeLocationRef.current = gl.getUniformLocation(program, 'u_time');

    return true;
  }, []);

  // Helper functions for WebGL
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  // Animation loop
  const animate = useCallback(
    (currentTime: number) => {
      if (!enabled || !glRef.current || !programRef.current) {
        return;
      }

      const gl = glRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // FPS calculation
      frameCountRef.current++;
      const deltaTime = currentTime - lastTimeRef.current;
      if (deltaTime >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / deltaTime);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
        onFPSChange?.(fpsRef.current);
      }

      // Set resolution
      gl.uniform2f(
        resolutionLocationRef.current!,
        canvas.width,
        canvas.height
      );

      // Set mouse position
      gl.uniform2f(
        mouseLocationRef.current!,
        mousePosRef.current.x,
        1.0 - mousePosRef.current.y // Flip Y coordinate
      );

      // Set time
      gl.uniform1f(timeLocationRef.current!, currentTime * 0.001);

      // Draw
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [enabled, onFPSChange]
  );

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const gl = glRef.current;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Initialize WebGL when enabled
  useEffect(() => {
    if (enabled) {
      if (initWebGL()) {
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, initWebGL, animate]);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !enabled) return;

      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };

      if (isDraggingRef.current) {
        onWindowDrag?.(mousePosRef.current.x, mousePosRef.current.y);
      } else {
        onMouseMove?.(mousePosRef.current.x, mousePosRef.current.y);
      }
    },
    [enabled, onMouseMove, onWindowDrag]
  );

  // Handle mouse click
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !enabled) return;

      // Only create splash if clicking on desktop (not on windows, dock, menubar)
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-window]') ||
        target.closest('[data-dock]') ||
        target.closest('[data-menubar]')
      ) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Create splash effect by updating mouse position
      mousePosRef.current = { x, y };
      onClick?.(x, y);
    },
    [enabled, onClick]
  );

  // Track window dragging
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-window]')) {
        isDraggingRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseMove, handleClick]);

  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  );
}

