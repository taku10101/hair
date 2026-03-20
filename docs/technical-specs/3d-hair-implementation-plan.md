# 3D・AI Hair Modeling Application 詳細実装計画
## Issue #4「3D・AI技術実装」対応

---

## 📋 プロジェクト概要

**プロジェクト**: 3Dヘアモデリング・ARプレビューアプリケーション
**期間**: 6-8週間
**チーム構成**: 
- 3Dエンジニア: 2名
- AIエンジニア: 2名

**技術目標**:
- 顔認識成功率: 95%以上
- 3D描画性能: 60FPS維持
- リアルタイムAR処理
- クロスプラットフォーム対応

---

## 🏗️ アーキテクチャ概要

### システム構成図
```
┌─────────────────────────────────────────────────────────────┐
│                    Front-end Layer                          │
├─────────────────────────────────────────────────────────────┤
│  React App + UI Components                                  │
│  ├── Camera Feed (WebRTC)                                  │
│  ├── 3D Viewport (Three.js + R3F)                         │
│  └── Control Panel                                         │
├─────────────────────────────────────────────────────────────┤
│                    Processing Layer                         │
├─────────────────────────────────────────────────────────────┤
│  WebWorker Pool                                             │
│  ├── AI Worker (Face Detection + MediaPipe)               │
│  ├── 3D Worker (Hair Simulation + Physics)                │
│  └── Image Processing Worker                              │
├─────────────────────────────────────────────────────────────┤
│                    Core Engine Layer                       │
├─────────────────────────────────────────────────────────────┤
│  WASM Modules                                               │
│  ├── Hair Physics Engine                                   │
│  ├── Face Mesh Processor                                   │
│  └── GPU Compute Kernels                                   │
├─────────────────────────────────────────────────────────────┤
│                    External APIs                           │
├─────────────────────────────────────────────────────────────┤
│  ├── Stable Diffusion API                                  │
│  ├── TensorFlow.js Models                                  │
│  └── MediaPipe Solutions                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 技術スタック詳細

### 1. 基盤技術
```javascript
{
  "frontend": {
    "framework": "React 18 + TypeScript",
    "3d_engine": "Three.js r160+ + React Three Fiber v8",
    "build_tool": "Vite 5 + SWC",
    "state_management": "Zustand + Immer"
  },
  "ai_ml": {
    "face_detection": "MediaPipe Face Mesh 0.4",
    "ml_runtime": "TensorFlow.js 4.0 + WebGL backend",
    "image_generation": "Stable Diffusion API v2",
    "model_optimization": "TensorFlow Lite + Quantization"
  },
  "performance": {
    "compute": "WebAssembly (Rust/C++)",
    "parallel": "Web Workers + SharedArrayBuffer",
    "gpu": "WebGPU fallback to WebGL2",
    "memory": "OffscreenCanvas + Memory pooling"
  }
}
```

---

## 🔧 詳細実装計画

### Phase 1: 基盤セットアップ (Week 1-2)

#### 1.1 プロジェクト初期化
```bash
# プロジェクト構造
hair-modeling-app/
├── src/
│   ├── components/          # React コンポーネント
│   ├── hooks/              # カスタムフック
│   ├── workers/            # Web Workers
│   ├── wasm/               # WebAssembly modules
│   ├── shaders/            # GLSL シェーダー
│   ├── types/              # TypeScript 型定義
│   └── utils/              # ユーティリティ
├── public/
│   ├── models/             # 3Dモデルアセット
│   ├── textures/           # テクスチャ
│   └── wasm/               # WASMバイナリ
└── tests/                  # テストファイル
```

#### 1.2 Three.js + React Three Fiber セットアップ
```typescript
// src/components/Scene3D.tsx
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'

export const Scene3D = () => {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      camera={{ fov: 45, position: [0, 0, 5] }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Environment preset="studio" />
        <PerspectiveCamera makeDefault />
        <OrbitControls enablePan={false} />
        
        {/* 3D Hair Model Container */}
        <HairModelContainer />
        
        {/* Face Mesh Overlay */}
        <FaceMeshOverlay />
      </Suspense>
    </Canvas>
  )
}
```

### Phase 2: AI・コンピュータビジョン実装 (Week 2-4)

#### 2.1 MediaPipe Face Mesh 統合
```typescript
// src/workers/faceDetectionWorker.ts
import '@mediapipe/face_mesh'
import { FaceMesh } from '@mediapipe/face_mesh'

class FaceDetectionWorker {
  private faceMesh: FaceMesh
  private isInitialized = false

  constructor() {
    this.initializeFaceMesh()
  }

  private async initializeFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    })
    
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8
    })

    this.faceMesh.onResults(this.onResults.bind(this))
    this.isInitialized = true
  }

  private onResults(results: any) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
      const landmarks = results.multiFaceLandmarks[0]
      
      // 顔の主要ポイント抽出
      const faceKeypoints = this.extractFaceKeypoints(landmarks)
      
      // 髪の配置エリア計算
      const hairRegion = this.calculateHairRegion(faceKeypoints)
      
      // メインスレッドに結果送信
      postMessage({
        type: 'FACE_DETECTED',
        data: {
          landmarks,
          faceKeypoints,
          hairRegion,
          confidence: this.calculateConfidence(landmarks)
        }
      })
    }
  }

  private extractFaceKeypoints(landmarks: any) {
    return {
      forehead: landmarks[10],      // 額の中心
      temples: [landmarks[54], landmarks[284]], // こめかみ
      ears: [landmarks[234], landmarks[454]],   // 耳の位置
      nape: landmarks[151],         // 首筋
      crown: landmarks[10],         // 頭頂部（推定）
    }
  }

  private calculateHairRegion(keypoints: any) {
    // 顔の輪郭から髪の配置可能領域を計算
    const headWidth = Math.abs(keypoints.temples[1].x - keypoints.temples[0].x)
    const headHeight = Math.abs(keypoints.forehead.y - keypoints.nape.y)
    
    return {
      bounds: {
        minX: keypoints.temples[0].x - headWidth * 0.2,
        maxX: keypoints.temples[1].x + headWidth * 0.2,
        minY: keypoints.forehead.y - headHeight * 0.3,
        maxY: keypoints.nape.y + headHeight * 0.1
      },
      hairlinePoints: this.generateHairlinePoints(keypoints)
    }
  }

  async processFrame(imageData: ImageData) {
    if (!this.isInitialized) {
      await this.initializeFaceMesh()
    }
    
    await this.faceMesh.send({ image: imageData })
  }
}

// Worker initialization
const worker = new FaceDetectionWorker()

onmessage = async (event) => {
  const { type, data } = event.data
  
  if (type === 'PROCESS_FRAME') {
    await worker.processFrame(data)
  }
}
```

#### 2.2 TensorFlow.js 顔特徴抽出
```typescript
// src/utils/faceAnalysis.ts
import * as tf from '@tensorflow/tfjs'

export class FaceAnalysisEngine {
  private blazeFaceModel: tf.GraphModel | null = null
  private faceLandmarkModel: tf.GraphModel | null = null

  async initialize() {
    // BlazeFace モデルロード
    this.blazeFaceModel = await tf.loadGraphModel('/models/blazeface/model.json')
    
    // 顔特徴点検出モデル
    this.faceLandmarkModel = await tf.loadGraphModel('/models/facemesh/model.json')
    
    // GPU最適化
    await tf.ready()
    console.log('TensorFlow.js backend:', tf.getBackend())
  }

  async analyzeFaceShape(imageData: ImageData) {
    const tensor = tf.browser.fromPixels(imageData)
    const resized = tf.image.resizeBilinear(tensor, [256, 256])
    const normalized = resized.div(255.0)
    
    // 顔の形状分類
    const faceShapePrediction = await this.predictFaceShape(normalized)
    
    // 髪質適性分析
    const hairCompatibility = this.analyzeHairCompatibility(faceShapePrediction)
    
    // メモリ清理
    tensor.dispose()
    resized.dispose()
    normalized.dispose()
    
    return {
      faceShape: faceShapePrediction,
      recommendedHairStyles: hairCompatibility
    }
  }

  private async predictFaceShape(tensor: tf.Tensor) {
    // カスタム分類モデル（顔の形状: oval, round, square, heart, long）
    const prediction = await this.faceLandmarkModel!.predict(tensor) as tf.Tensor
    const result = await prediction.data()
    
    const shapes = ['oval', 'round', 'square', 'heart', 'long']
    const maxIndex = result.indexOf(Math.max(...Array.from(result)))
    
    prediction.dispose()
    
    return {
      shape: shapes[maxIndex],
      confidence: result[maxIndex],
      probabilities: shapes.map((shape, i) => ({
        shape,
        probability: result[i]
      }))
    }
  }
}
```

### Phase 3: 3D Hair Modeling Engine (Week 3-5)

#### 3.1 髪の物理シミュレーション (WASM)
```rust
// src/wasm/hair_physics/src/lib.rs
use wasm_bindgen::prelude::*;
use nalgebra::{Vector3, Point3};

#[wasm_bindgen]
pub struct HairStrand {
    points: Vec<Point3<f32>>,
    velocities: Vec<Vector3<f32>>,
    constraints: Vec<DistanceConstraint>,
    mass: f32,
    stiffness: f32,
}

#[wasm_bindgen]
pub struct HairSystem {
    strands: Vec<HairStrand>,
    gravity: Vector3<f32>,
    wind: Vector3<f32>,
    damping: f32,
}

#[wasm_bindgen]
impl HairSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(strand_count: usize) -> HairSystem {
        HairSystem {
            strands: Vec::with_capacity(strand_count),
            gravity: Vector3::new(0.0, -9.8, 0.0),
            wind: Vector3::new(0.0, 0.0, 0.0),
            damping: 0.98,
        }
    }

    #[wasm_bindgen]
    pub fn add_strand(&mut self, root_position: &[f32], length: f32, segments: usize) {
        let strand = self.create_strand(root_position, length, segments);
        self.strands.push(strand);
    }

    #[wasm_bindgen]
    pub fn simulate_step(&mut self, delta_time: f32) {
        for strand in &mut self.strands {
            self.verlet_integration(strand, delta_time);
            self.apply_constraints(strand);
            self.apply_damping(strand);
        }
    }

    #[wasm_bindgen]
    pub fn get_strand_positions(&self, strand_index: usize) -> Vec<f32> {
        if strand_index >= self.strands.len() {
            return Vec::new();
        }

        let strand = &self.strands[strand_index];
        let mut positions = Vec::with_capacity(strand.points.len() * 3);
        
        for point in &strand.points {
            positions.push(point.x);
            positions.push(point.y);
            positions.push(point.z);
        }
        
        positions
    }

    fn verlet_integration(&self, strand: &mut HairStrand, dt: f32) {
        for i in 1..strand.points.len() { // Skip root (fixed)
            let acceleration = self.gravity + self.wind;
            let new_position = strand.points[i] 
                + strand.velocities[i] * dt 
                + acceleration * dt * dt;
            
            strand.velocities[i] = (new_position - strand.points[i]) / dt;
            strand.points[i] = new_position;
        }
    }

    fn apply_constraints(&self, strand: &mut HairStrand) {
        // Distance constraints (keep segments at fixed length)
        for constraint in &strand.constraints {
            let delta = strand.points[constraint.b] - strand.points[constraint.a];
            let distance = delta.norm();
            let difference = constraint.rest_length - distance;
            let correction = delta.normalize() * difference * 0.5;

            if constraint.a > 0 { // Don't move root
                strand.points[constraint.a] -= correction;
            }
            strand.points[constraint.b] += correction;
        }
    }
}

struct DistanceConstraint {
    a: usize,
    b: usize,
    rest_length: f32,
}
```

#### 3.2 Three.js Hair Renderer
```typescript
// src/components/HairRenderer.tsx
import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

interface HairRendererProps {
  faceData: FaceDetectionData
  hairStyle: HairStyleConfig
  physics: boolean
}

export const HairRenderer = ({ faceData, hairStyle, physics }: HairRendererProps) => {
  const hairSystemRef = useRef<any>()
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  
  // WASM Hair Physics System
  const hairSystem = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).HairSystem) {
      return new (window as any).HairSystem(hairStyle.strandCount)
    }
    return null
  }, [hairStyle.strandCount])

  // 髪の毛ジオメトリ生成
  const { geometry, material } = useMemo(() => {
    // Individual hair strand geometry
    const strandGeometry = new THREE.CylinderGeometry(
      hairStyle.thickness * 0.5,
      hairStyle.thickness,
      hairStyle.length,
      8,
      hairStyle.segments
    )

    // Hair material with subsurface scattering approximation
    const hairMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hairStyle.color),
      roughness: 0.8,
      metalness: 0.1,
      transmission: 0.1,
      thickness: 0.5,
      // カスタムシェーダーでSubsurface Scatteringを実装
      onBeforeCompile: (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <lights_fragment_begin>',
          `
          #include <lights_fragment_begin>
          
          // Simple subsurface scattering
          vec3 subsurfaceColor = diffuseColor.rgb;
          float subsurfaceStrength = 0.3;
          vec3 lightDir = normalize(directLight.direction);
          vec3 viewDir = normalize(vViewPosition);
          vec3 halfVector = normalize(lightDir + viewDir);
          
          float subsurfaceScatter = pow(saturate(dot(viewDir, -lightDir)), 2.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, subsurfaceColor, subsurfaceScatter * subsurfaceStrength);
          `
        )
      }
    })

    return { geometry: strandGeometry, material: hairMaterial }
  }, [hairStyle])

  // 髪の初期配置
  useEffect(() => {
    if (!hairSystem || !faceData.hairRegion || !instancedMeshRef.current) return

    const { bounds, hairlinePoints } = faceData.hairRegion
    const dummy = new THREE.Object3D()

    // 髪の毛を頭皮に配置
    for (let i = 0; i < hairStyle.strandCount; i++) {
      const position = generateHairRootPosition(bounds, hairlinePoints, i, hairStyle.strandCount)
      
      dummy.position.set(position.x, position.y, position.z)
      dummy.rotation.set(
        Math.random() * 0.2 - 0.1,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2 - 0.1
      )
      dummy.scale.set(
        1 + Math.random() * 0.3,
        1 + Math.random() * 0.2,
        1 + Math.random() * 0.3
      )
      dummy.updateMatrix()
      
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
      
      // WASM physics system に髪を追加
      hairSystem.add_strand([position.x, position.y, position.z], hairStyle.length, hairStyle.segments)
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [faceData, hairStyle, hairSystem])

  // 物理シミュレーション更新
  useFrame((state, delta) => {
    if (!physics || !hairSystem || !instancedMeshRef.current) return

    // WASM で物理シミュレーション実行
    hairSystem.simulate_step(delta)

    // 結果をThree.jsに反映
    const dummy = new THREE.Object3D()
    for (let i = 0; i < hairStyle.strandCount; i++) {
      const positions = hairSystem.get_strand_positions(i)
      if (positions.length >= 3) {
        dummy.position.set(positions[0], positions[1], positions[2])
        
        // 髪の毛の向きを計算（2番目のセグメント方向）
        if (positions.length >= 6) {
          const direction = new THREE.Vector3(
            positions[3] - positions[0],
            positions[4] - positions[1],
            positions[5] - positions[2]
          ).normalize()
          
          dummy.lookAt(dummy.position.clone().add(direction))
        }
        
        dummy.updateMatrix()
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
      }
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, hairStyle.strandCount]}
      castShadow
      receiveShadow
    />
  )
}

function generateHairRootPosition(
  bounds: any,
  hairlinePoints: THREE.Vector3[],
  index: number,
  total: number
): THREE.Vector3 {
  // 髪の生え際に沿って均等分布
  const t = index / total
  const pointIndex = Math.floor(t * (hairlinePoints.length - 1))
  const localT = (t * (hairlinePoints.length - 1)) - pointIndex
  
  const currentPoint = hairlinePoints[pointIndex]
  const nextPoint = hairlinePoints[Math.min(pointIndex + 1, hairlinePoints.length - 1)]
  
  // 線形補間 + ランダムオフセット
  const position = currentPoint.clone().lerp(nextPoint, localT)
  position.add(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  ))
  
  return position
}
```

### Phase 4: AI画像生成・スタイル適用 (Week 4-6)

#### 4.1 Stable Diffusion API 統合
```typescript
// src/services/stableDiffusionService.ts
import { HairStyleConfig, FaceAnalysisData } from '../types'

export class StableDiffusionService {
  private apiKey: string
  private baseUrl: string = 'https://api.stability.ai/v1/generation'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateHairStyle(
    faceImage: File,
    faceAnalysis: FaceAnalysisData,
    stylePrompt: string,
    options: HairGenerationOptions = {}
  ): Promise<HairGenerationResult> {
    
    // 顔の形状に基づいたプロンプト強化
    const enhancedPrompt = this.enhancePromptWithFaceShape(stylePrompt, faceAnalysis)
    
    const formData = new FormData()
    formData.append('init_image', faceImage)
    formData.append('init_image_mode', 'IMAGE_STRENGTH')
    formData.append('image_strength', '0.4') // 顔の特徴を保持
    formData.append('cfg_scale', '15')
    formData.append('sampler', 'K_DPMPP_2M')
    formData.append('steps', '50')
    formData.append('width', '512')
    formData.append('height', '512')
    
    // マスク生成（髪の領域のみ変更）
    const hairMask = await this.generateHairMask(faceImage, faceAnalysis.hairRegion)
    formData.append('mask_image', hairMask)
    
    // プロンプト設定
    formData.append('text_prompts[0][text]', enhancedPrompt)
    formData.append('text_prompts[0][weight]', '1')
    formData.append('text_prompts[1][text]', 'blurry, distorted face, unnatural proportions')
    formData.append('text_prompts[1][weight]', '-1')

    try {
      const response = await fetch(`${this.baseUrl}/stable-diffusion-xl-1024-v1-0/image-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      
      // 生成された画像から3D髪型パラメータを抽出
      const hairConfig = await this.extractHairParameters(result.artifacts[0].base64)
      
      return {
        generatedImage: result.artifacts[0].base64,
        hairConfig,
        seed: result.artifacts[0].seed,
        prompt: enhancedPrompt
      }
    } catch (error) {
      console.error('Hair generation failed:', error)
      throw error
    }
  }

  private enhancePromptWithFaceShape(prompt: string, faceAnalysis: FaceAnalysisData): string {
    const { faceShape } = faceAnalysis.faceShape
    
    // 顔の形状に適した髪型の提案を追加
    const shapeEnhancements = {
      'oval': 'versatile hairstyle, balanced proportions',
      'round': 'height-adding style, angular layers, side-swept bangs',
      'square': 'soft waves, layered cut, face-framing highlights',
      'heart': 'chin-length bob, side part, volume at jaw level',
      'long': 'width-adding waves, blunt cut, face-framing layers'
    }

    const enhancement = shapeEnhancements[faceShape as keyof typeof shapeEnhancements] || ''
    
    return `${prompt}, ${enhancement}, professional hair styling, realistic lighting, 8k quality, detailed hair texture`
  }

  private async generateHairMask(faceImage: File, hairRegion: any): Promise<Blob> {
    // Canvas で髪の領域マスクを生成
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 512
    canvas.height = 512

    // 髪の領域を白、その他を黒で塗る
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 512, 512)
    
    ctx.fillStyle = 'white'
    ctx.beginPath()
    
    // hairRegion.bounds に基づいてマスク形状を描画
    const { bounds } = hairRegion
    ctx.ellipse(
      256, 150, // 中心
      (bounds.maxX - bounds.minX) * 256, // 幅
      (bounds.maxY - bounds.minY) * 256, // 高さ
      0, 0, Math.PI * 2
    )
    ctx.fill()

    return new Promise((resolve) => {
      canvas.toBlob(resolve!, 'image/png')
    })
  }

  private async extractHairParameters(generatedImageBase64: string): Promise<HairStyleConfig> {
    // 生成された画像から髪の特徴を分析してThree.js用パラメータに変換
    // このダミー実装を実際のAI分析に置き換える
    
    return {
      strandCount: Math.floor(5000 + Math.random() * 15000),
      length: 0.1 + Math.random() * 0.3,
      thickness: 0.001 + Math.random() * 0.002,
      segments: 8 + Math.floor(Math.random() * 8),
      color: this.extractDominantHairColor(generatedImageBase64),
      curliness: Math.random(),
      volume: 0.5 + Math.random() * 0.5,
      texture: this.detectHairTexture(generatedImageBase64)
    }
  }

  private extractDominantHairColor(imageBase64: string): string {
    // 実装: 画像から髪の主要色を抽出
    // Color ThiefライブラリまたはCanvas分析を使用
    return '#4a3728' // ダミーの茶色
  }

  private detectHairTexture(imageBase64: string): 'straight' | 'wavy' | 'curly' | 'coily' {
    // 実装: 髪のテクスチャを分析
    return 'wavy'
  }
}

interface HairGenerationOptions {
  style?: 'modern' | 'classic' | 'trendy' | 'natural'
  color?: string
  length?: 'short' | 'medium' | 'long'
}

interface HairGenerationResult {
  generatedImage: string
  hairConfig: HairStyleConfig
  seed: number
  prompt: string
}
```

### Phase 5: WebRTC・ARプレビュー機能 (Week 5-7)

#### 5.1 カメラアクセス・ストリーミング
```typescript
// src/hooks/useCamera.ts
import { useEffect, useRef, useState, useCallback } from 'react'

interface CameraConfig {
  width: number
  height: number
  facingMode: 'user' | 'environment'
  frameRate: number
}

export const useCamera = (config: CameraConfig) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const startCamera = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: config.width },
          height: { ideal: config.height },
          facingMode: config.facingMode,
          frameRate: { ideal: config.frameRate }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      streamRef.current = stream
      setIsActive(true)
      setError(null)
    } catch (err) {
      setError(`Camera access failed: ${err}`)
      console.error('Camera error:', err)
    }
  }, [config])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
  }, [])

  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || !isActive) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = config.width
    canvas.height = config.height
    
    ctx.drawImage(videoRef.current, 0, 0, config.width, config.height)
    
    return ctx.getImageData(0, 0, config.width, config.height)
  }, [config, isActive])

  const switchCamera = useCallback(async () => {
    stopCamera()
    
    // フロント⇔リアカメラ切り替え
    const newFacingMode = config.facingMode === 'user' ? 'environment' : 'user'
    config.facingMode = newFacingMode
    
    await startCamera()
  }, [config, startCamera, stopCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera
  }
}
```

#### 5.2 リアルタイムAR合成
```typescript
// src/components/ARPreview.tsx
import { useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ARPreviewProps {
  videoStream: MediaStream
  faceData: FaceDetectionData
  hairConfig: HairStyleConfig
}

export const ARPreview = ({ videoStream, faceData, hairConfig }: ARPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream
      videoRef.current.play()
    }
  }, [videoStream])

  return (
    <div className="ar-preview-container">
      <video 
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      
      <canvas
        ref={canvasRef}
        className="ar-canvas"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      
      {/* Three.js AR Overlay */}
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, premultipliedAlpha: false }}
      >
        <ARScene 
          videoRef={videoRef}
          faceData={faceData}
          hairConfig={hairConfig}
        />
      </Canvas>
    </div>
  )
}

const ARScene = ({ videoRef, faceData, hairConfig }: any) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const videoTexture = useRef<THREE.VideoTexture | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoTexture.current = new THREE.VideoTexture(videoRef.current)
      videoTexture.current.minFilter = THREE.LinearFilter
      videoTexture.current.magFilter = THREE.LinearFilter
    }
  }, [])

  useFrame((state) => {
    if (!faceData.landmarks || !meshRef.current) return

    // 顔の位置・回転に基づいて3D髪を配置
    const facePosition = calculateFacePosition(faceData.landmarks)
    const faceRotation = calculateFaceRotation(faceData.landmarks)

    meshRef.current.position.copy(facePosition)
    meshRef.current.rotation.copy(faceRotation)

    // カメラの動きに追従
    const cameraDistance = 5
    state.camera.position.z = cameraDistance
    state.camera.lookAt(facePosition)
  })

  return (
    <>
      {/* ビデオ背景 */}
      <mesh>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial 
          map={videoTexture.current} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Hair Overlay */}
      <group ref={meshRef}>
        <HairRenderer 
          faceData={faceData}
          hairStyle={hairConfig}
          physics={true}
        />
      </group>
    </>
  )
}

function calculateFacePosition(landmarks: any[]): THREE.Vector3 {
  // 顔の中心座標を計算
  const center = landmarks.reduce((acc, point) => {
    acc.x += point.x
    acc.y += point.y
    acc.z += point.z || 0
    return acc
  }, { x: 0, y: 0, z: 0 })

  return new THREE.Vector3(
    (center.x / landmarks.length - 0.5) * 10,
    (0.5 - center.y / landmarks.length) * 10,
    (center.z / landmarks.length) * 5
  )
}

function calculateFaceRotation(landmarks: any[]): THREE.Euler {
  // 顔の傾き・回転を計算
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const nose = landmarks[1]

  // 顔の傾き (Roll)
  const eyeVector = new THREE.Vector2(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
  const roll = Math.atan2(eyeVector.y, eyeVector.x)

  // 顔の上下 (Pitch) - 簡易計算
  const pitch = (nose.y - (leftEye.y + rightEye.y) / 2) * Math.PI

  // 顔の左右 (Yaw) - 簡易計算
  const yaw = ((leftEye.x + rightEye.x) / 2 - 0.5) * Math.PI * 0.5

  return new THREE.Euler(pitch, yaw, roll)
}
```

### Phase 6: パフォーマンス最適化 (Week 6-8)

#### 6.1 Web Worker 並列処理
```typescript
// src/workers/optimizedProcessingPipeline.ts

interface ProcessingTask {
  type: 'FACE_DETECTION' | 'HAIR_SIMULATION' | 'IMAGE_GENERATION'
  data: any
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: number
}

class OptimizedProcessingPipeline {
  private workers: Map<string, Worker> = new Map()
  private taskQueue: ProcessingTask[] = []
  private isProcessing = false
  private performanceMetrics = {
    frameRate: 60,
    processingLatency: 0,
    memoryUsage: 0
  }

  constructor() {
    this.initializeWorkers()
    this.startPerformanceMonitoring()
  }

  private initializeWorkers() {
    // Face Detection Worker
    const faceWorker = new Worker('/workers/faceDetection.js')
    this.workers.set('face', faceWorker)

    // Hair Physics Worker (WASM)
    const hairWorker = new Worker('/workers/hairPhysics.js')
    this.workers.set('hair', hairWorker)

    // Image Processing Worker
    const imageWorker = new Worker('/workers/imageProcessing.js')
    this.workers.set('image', imageWorker)

    // GPU Compute Worker (WebGPU/WebGL2)
    if (this.supportsWebGPU()) {
      const gpuWorker = new Worker('/workers/gpuCompute.js')
      this.workers.set('gpu', gpuWorker)
    }
  }

  async processFrame(frameData: ImageData): Promise<ProcessingResult> {
    const startTime = performance.now()

    // タスクを並列処理のために分割
    const tasks: ProcessingTask[] = [
      {
        type: 'FACE_DETECTION',
        data: frameData,
        priority: 'HIGH',
        timestamp: startTime
      }
    ]

    // 高優先度タスクをキューに追加
    this.taskQueue.push(...tasks)
    
    // 並列処理実行
    const results = await this.executeParallelProcessing()

    // パフォーマンス測定
    const endTime = performance.now()
    this.updatePerformanceMetrics(endTime - startTime)

    return results
  }

  private async executeParallelProcessing(): Promise<ProcessingResult> {
    if (this.isProcessing) {
      return Promise.reject('Processing already in progress')
    }

    this.isProcessing = true

    try {
      // タスクを優先度順にソート
      this.taskQueue.sort((a, b) => {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })

      // 並列実行（最大3つのWorker同時実行）
      const activePromises = []
      const maxConcurrent = Math.min(3, this.taskQueue.length)

      for (let i = 0; i < maxConcurrent; i++) {
        const task = this.taskQueue.shift()
        if (task) {
          activePromises.push(this.executeTask(task))
        }
      }

      const results = await Promise.all(activePromises)
      return this.mergeResults(results)
    } finally {
      this.isProcessing = false
    }
  }

  private executeTask(task: ProcessingTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const workerMap = {
        'FACE_DETECTION': 'face',
        'HAIR_SIMULATION': 'hair',
        'IMAGE_GENERATION': 'image'
      }

      const workerKey = workerMap[task.type]
      const worker = this.workers.get(workerKey)

      if (!worker) {
        reject(`Worker not available for task: ${task.type}`)
        return
      }

      const timeout = setTimeout(() => {
        reject(`Task timeout: ${task.type}`)
      }, 5000) // 5秒タイムアウト

      worker.onmessage = (event) => {
        clearTimeout(timeout)
        resolve(event.data)
      }

      worker.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }

      worker.postMessage({
        type: task.type,
        data: task.data,
        timestamp: task.timestamp
      })
    })
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      // FPSモニタリング
      this.measureFrameRate()
      
      // メモリ使用量チェック
      if ('memory' in performance) {
        this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024
      }

      // パフォーマンスが基準以下の場合は品質を下げる
      this.adaptiveQualityControl()
    }, 1000)
  }

  private adaptiveQualityControl() {
    const { frameRate, processingLatency, memoryUsage } = this.performanceMetrics

    if (frameRate < 30 || processingLatency > 100 || memoryUsage > 500) {
      // 品質を下げる
      this.reduceQuality()
    } else if (frameRate > 55 && processingLatency < 50 && memoryUsage < 200) {
      // 品質を上げる
      this.increaseQuality()
    }
  }

  private reduceQuality() {
    console.log('Performance degraded - reducing quality')
    // 髪の毛のストランド数を減らす
    // シミュレーションの精度を下げる
    // テクスチャ解像度を下げる
  }

  private increaseQuality() {
    console.log('Performance stable - increasing quality')
    // 品質設定を元に戻す
  }
}
```

#### 6.2 GPU 最適化 (WebGPU)
```typescript
// src/utils/gpuOptimization.ts
export class GPUOptimizedHairRenderer {
  private device: GPUDevice | null = null
  private context: GPUCanvasContext | null = null
  private pipeline: GPURenderPipeline | null = null
  private uniformBuffer: GPUBuffer | null = null

  async initialize(canvas: HTMLCanvasElement) {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported')
    }

    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      throw new Error('No appropriate GPUAdapter found')
    }

    this.device = await adapter.requestDevice()
    this.context = canvas.getContext('webgpu')!
    
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
    this.context.configure({
      device: this.device,
      format: presentationFormat,
    })

    await this.setupRenderPipeline()
  }

  private async setupRenderPipeline() {
    if (!this.device) return

    // Hair strand vertex shader
    const vertexShader = `
    struct Uniforms {
      modelViewProjectionMatrix: mat4x4<f32>,
      time: f32,
      windForce: vec3<f32>,
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) strandId: f32,
      @location(2) segmentIndex: f32,
    };

    struct VertexOutput {
      @builtin(position) clipPosition: vec4<f32>,
      @location(0) worldPosition: vec3<f32>,
      @location(1) strandId: f32,
    };

    @vertex
    fn vs_main(input: VertexInput) -> VertexOutput {
      var output: VertexOutput;
      
      // 風の影響を計算
      let windOffset = uniforms.windForce * sin(uniforms.time + input.strandId) * input.segmentIndex * 0.1;
      
      // 重力シミュレーション
      let gravityOffset = vec3<f32>(0.0, -input.segmentIndex * 0.05, 0.0);
      
      let worldPos = input.position + windOffset + gravityOffset;
      
      output.clipPosition = uniforms.modelViewProjectionMatrix * vec4<f32>(worldPos, 1.0);
      output.worldPosition = worldPos;
      output.strandId = input.strandId;
      
      return output;
    }
    `

    // Hair fragment shader with subsurface scattering
    const fragmentShader = `
    struct FragmentInput {
      @location(0) worldPosition: vec3<f32>,
      @location(1) strandId: f32,
    };

    @fragment
    fn fs_main(input: FragmentInput) -> @location(0) vec4<f32> {
      // Hair color variation
      let baseColor = vec3<f32>(0.4, 0.2, 0.1); // Brown hair
      let colorVariation = sin(input.strandId * 0.1) * 0.1;
      let hairColor = baseColor + vec3<f32>(colorVariation);
      
      // Simple subsurface scattering approximation
      let lightDir = normalize(vec3<f32>(1.0, 1.0, 1.0));
      let normal = normalize(input.worldPosition);
      let subsurface = pow(max(dot(normal, lightDir), 0.0), 2.0) * 0.3;
      
      let finalColor = hairColor + vec3<f32>(subsurface);
      return vec4<f32>(finalColor, 0.8);
    }
    `

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({ code: vertexShader }),
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 20, // 3 floats (position) + 1 float (strandId) + 1 float (segmentIndex)
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32' },
            { shaderLocation: 2, offset: 16, format: 'float32' },
          ]
        }]
      },
      fragment: {
        module: this.device.createShaderModule({ code: fragmentShader }),
        entryPoint: 'fs_main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
      },
      primitive: {
        topology: 'triangle-strip',
      }
    })

    // Uniform buffer for matrices and time
    this.uniformBuffer = this.device.createBuffer({
      size: 80, // 4x4 matrix (64 bytes) + time (4 bytes) + wind (12 bytes)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  renderHairStrands(hairData: HairStrandData[], viewMatrix: Float32Array) {
    if (!this.device || !this.context || !this.pipeline) return

    const encoder = this.device.createCommandEncoder()
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: 'clear',
        storeOp: 'store',
      }]
    })

    // Update uniforms
    const uniformData = new Float32Array(20)
    uniformData.set(viewMatrix, 0) // 4x4 matrix
    uniformData[16] = performance.now() / 1000 // time
    uniformData[17] = Math.sin(Date.now() / 1000) * 0.5 // wind X
    uniformData[18] = 0 // wind Y
    uniformData[19] = Math.cos(Date.now() / 1000) * 0.3 // wind Z

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    // Prepare hair vertex data
    const vertexData = this.prepareHairVertices(hairData)
    const vertexBuffer = this.device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    })
    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData)
    vertexBuffer.unmap()

    // Bind pipeline and resources
    renderPass.setPipeline(this.pipeline)
    renderPass.setVertexBuffer(0, vertexBuffer)
    
    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
    })
    renderPass.setBindGroup(0, bindGroup)

    // Draw hair strands
    const vertexCount = vertexData.length / 5 // 5 floats per vertex
    renderPass.draw(vertexCount)

    renderPass.end()
    this.device.queue.submit([encoder.finish()])
  }

  private prepareHairVertices(hairData: HairStrandData[]): Float32Array {
    const vertices: number[] = []
    
    hairData.forEach((strand, strandIndex) => {
      strand.segments.forEach((segment, segmentIndex) => {
        // Each segment becomes a quad (2 triangles)
        vertices.push(
          segment.position.x, segment.position.y, segment.position.z,
          strandIndex, segmentIndex
        )
      })
    })
    
    return new Float32Array(vertices)
  }
}

interface HairStrandData {
  segments: Array<{ position: { x: number, y: number, z: number } }>
}
```

---

## 📊 実装スケジュール詳細

### Week 1: プロジェクト基盤
- [ ] リポジトリセットアップ・環境構築
- [ ] Three.js + React Three Fiber 基本シーン作成
- [ ] TypeScript 型定義・プロジェクト構造設計
- [ ] CI/CDパイプライン構築

### Week 2: AI基盤・顔認識
- [ ] MediaPipe Face Mesh 統合
- [ ] TensorFlow.js セットアップ・最適化
- [ ] 顔特徴点検出・分析アルゴリズム実装
- [ ] 髪配置領域計算ロジック

### Week 3: 3D Hair Engine基礎
- [ ] WASM髪物理エンジン開発 (Rust)
- [ ] Three.js髪レンダラー基本実装
- [ ] Instance Mesh最適化・LODシステム
- [ ] 髪の毛ジオメトリ生成アルゴリズム

### Week 4: 髪物理・AI画像生成
- [ ] 髪物理シミュレーション詳細実装
- [ ] Stable Diffusion API統合
- [ ] 髪型画像生成・パラメータ変換
- [ ] 3D髪型リアルタイム適用

### Week 5: WebRTC・カメラ統合
- [ ] WebRTC カメラアクセス実装
- [ ] リアルタイム映像処理パイプライン
- [ ] AR合成・オーバーレイ描画
- [ ] デバイス互換性テスト

### Week 6: パフォーマンス最適化
- [ ] Web Worker並列処理システム
- [ ] GPU最適化 (WebGPU/WebGL2)
- [ ] メモリ管理・ガベージコレクション対策
- [ ] アダプティブ品質制御

### Week 7: 統合テスト・デバッグ
- [ ] 全機能統合テスト
- [ ] モバイルデバイス最適化
- [ ] エラーハンドリング・フォールバック
- [ ] ユーザビリティテスト

### Week 8: 仕上げ・デプロイ準備
- [ ] パフォーマンス最終調整
- [ ] ドキュメント整備
- [ ] セキュリティ監査
- [ ] 本番環境デプロイ

---

## 🎯 技術リスク対策

### 1. 髪の物理シミュレーション
**リスク**: 複雑な髪の動き、絡まり、衝突検出
**対策**:
- 簡化されたチェーン物理から開始
- GPU並列処理によるスケーラビリティ
- LOD（Level of Detail）システムでパフォーマンス調整

### 2. モバイル性能制限
**リスク**: CPU/GPU性能不足、メモリ制限
**対策**:
- アダプティブ品質制御（動的ストランド数調整）
- WebAssembly + SIMD最適化
- Progressive Web App + Service Worker キャッシュ

### 3. AI精度・レスポンス
**リスク**: 顔認識失敗、ネットワーク遅延
**対策**:
- 複数AI モデルによる冗長化
- クライアントサイド推論 + クラウド補完
- 段階的品質向上（低解像度→高解像度）

---

## 📈 成功指標・検証方法

### パフォーマンス指標
```javascript
const performanceTargets = {
  faceDetection: {
    accuracy: 0.95,        // 95%以上の顔認識成功率
    latency: 50,           // 50ms以下の検出遅延
    falsePositiveRate: 0.02 // 2%以下の誤検出率
  },
  rendering: {
    frameRate: 60,         // 60FPS維持（デスクトップ）
    mobileFrameRate: 30,   // 30FPS以上（モバイル）
    memoryUsage: 512,      // 512MB以下のメモリ使用量
    loadTime: 3000         // 3秒以内の初期ロード
  },
  userExperience: {
    timeToFirstFrame: 2000,    // 2秒以内の初回描画
    interactionLatency: 100,   // 100ms以下の操作応答
    crashRate: 0.01           // 1%以下のクラッシュ率
  }
}
```

### テスト戦略
1. **Unit Test**: 各モジュールの個別機能テスト
2. **Integration Test**: AI ↔ 3D ↔ AR 連携テスト
3. **Performance Test**: 負荷テスト・メモリリークチェック
4. **Device Test**: iOS/Android/Desktop クロスプラットフォーム
5. **User Test**: 実ユーザーによるUXテスト

---

## 🛠️ 開発ツール・環境

### 開発環境
```yaml
development:
  - Node.js 18+
  - TypeScript 5.0+
  - Vite 5.0 (Build Tool)
  - ESLint + Prettier (Code Quality)
  
testing:
  - Jest (Unit Test)
  - Playwright (E2E Test)
  - WebPageTest (Performance)
  
deployment:
  - Docker + Kubernetes
  - GitHub Actions (CI/CD)
  - Vercel/Netlify (Frontend)
  - AWS S3 + CloudFront (Assets)
```

### 監視・分析
```yaml
monitoring:
  - Sentry (Error Tracking)
  - Google Analytics (Usage)
  - Web Vitals (Performance)
  - Custom Telemetry (AI Accuracy)
```

---

## 📋 まとめ

この実装計画により、3D・AIヘアモデリング・ARプレビューアプリケーションの技術的実現性を確保し、6-8週間での開発完了を目指します。

**重要な技術的成果物**:
1. 高性能な3D髪物理シミュレーションエンジン
2. 95%以上の精度を持つAI顔認識システム
3. リアルタイムAR髪型プレビュー機能
4. クロスプラットフォーム最適化

**チーム分担推奨**:
- **3Dエンジニア**: Three.js実装、WASM物理エンジン、GPU最適化
- **AIエンジニア**: MediaPipe統合、TensorFlow.js、Stable Diffusion API

この計画に基づき、技術的リスクを最小化しながら、高品質な3D・AIヘアモデリングアプリケーションを構築できます。