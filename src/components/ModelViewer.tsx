'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import occtimportjs from 'occt-import-js';

interface ModelViewerProps {
  fileData: ArrayBuffer | null;
}

// Interface for model metadata
interface ModelMetadata {
  name: string;
  partCount: number;
  triangleCount: number;
  vertexCount: number;
  fileSize: string;
  boundingBoxSize: string;
}

// Component to display model metadata
function ModelInfo({ metadata }: { metadata: ModelMetadata | null }) {
  if (!metadata) return null;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
      <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-lg">{metadata.name || 'STEP Model'}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Parts</div>
          <div className="text-gray-900 font-medium text-lg">{metadata.partCount}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Triangles</div>
          <div className="text-gray-900 font-medium text-lg">{metadata.triangleCount.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Vertices</div>
          <div className="text-gray-900 font-medium text-lg">{metadata.vertexCount.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">File Size</div>
          <div className="text-gray-900 font-medium text-lg">{metadata.fileSize}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-sm">Dimensions</div>
          <div className="text-gray-900 font-medium text-lg">{metadata.boundingBoxSize}</div>
        </div>
      </div>
    </div>
  );
}

// Camera controller to ensure consistent view
function CameraController({ boundingBox }: { boundingBox: THREE.Box3 | null }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!boundingBox || boundingBox.isEmpty()) return;
    
    // Calculate the size of the bounding box
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Calculate the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Calculate the radius of the bounding sphere
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    
    // Position the camera at a consistent distance based on the model size
    const distance = radius * 2.5;
    camera.position.set(distance, distance, distance);
    camera.lookAt(center);
    
    // Update controls target to the center of the model
    if (controls) {
      (controls as any).target.copy(center);
      (controls as any).update();
    }
    
    console.log('Camera positioned:', { 
      modelSize: size, 
      modelCenter: center, 
      cameraDistance: distance,
      cameraPosition: camera.position.clone()
    });
    
  }, [boundingBox, camera, controls]);
  
  return null;
}

function Model({ data }: { data: any }) {
  const meshRef = useRef<THREE.Group>(null);
  const [boundingBox, setBoundingBox] = useState<THREE.Box3 | null>(null);

  useEffect(() => {
    if (!meshRef.current || !data) return;

    // Clear existing meshes
    while (meshRef.current.children.length > 0) {
      meshRef.current.remove(meshRef.current.children[0]);
    }

    // Create meshes from the parsed data
    data.meshes.forEach((mesh: any) => {
      const geometry = new THREE.BufferGeometry();
      
      // Set vertices
      const vertices = new Float32Array(mesh.attributes.position.array);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      // Set normals if they exist
      if (mesh.attributes.normal) {
        const normals = new Float32Array(mesh.attributes.normal.array);
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      }
      
      // Set indices
      if (mesh.index) {
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.index.array), 1));
      }
      
      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: mesh.color ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2]) : 0xcccccc,
        side: THREE.DoubleSide,
      });

      const meshObject = new THREE.Mesh(geometry, material);
      if (meshRef.current) {
        meshRef.current.add(meshObject);
      }
    });

    // Center the model using its bounding box
    const box = new THREE.Box3().setFromObject(meshRef.current);
    const center = box.getCenter(new THREE.Vector3());
    meshRef.current.position.sub(center);
    
    // Store the bounding box for camera positioning
    setBoundingBox(new THREE.Box3().setFromObject(meshRef.current));

    // Log model information for debugging
    console.log('Model loaded:', {
      meshCount: meshRef.current.children.length,
      boundingBox: box,
      center: center
    });

  }, [data]);

  return (
    <>
      <group ref={meshRef} />
      <CameraController boundingBox={boundingBox} />
    </>
  );
}

export default function ModelViewer({ fileData }: ModelViewerProps) {
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [occt, setOcct] = useState<any>(null);
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);

  // Initialize OCCT
  useEffect(() => {
    const init = async () => {
      try {
        // Use locateFile to point to the correct WASM file location
        const instance = await (occtimportjs as any)({
          locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
              return '/static/wasm/occt-import-js.wasm';
            }
            return file;
          }
        });
        setOcct(instance);
      } catch (err) {
        console.error('Error initializing OCCT:', err);
        setError('Failed to initialize OCCT');
      }
    };
    init();
  }, []);

  // Extract metadata from the parsed data
  useEffect(() => {
    if (!parsedData) return;
    
    // Calculate total triangle and vertex counts
    let triangleCount = 0;
    let vertexCount = 0;
    
    parsedData.meshes.forEach((mesh: any) => {
      // Count triangles
      if (mesh.index && mesh.index.array) {
        triangleCount += mesh.index.array.length / 3;
      }
      
      // Count vertices
      if (mesh.attributes && mesh.attributes.position && mesh.attributes.position.array) {
        vertexCount += mesh.attributes.position.array.length / 3;
      }
    });
    
    // Calculate bounding box
    const tempGroup = new THREE.Group();
    parsedData.meshes.forEach((mesh: any) => {
      const geometry = new THREE.BufferGeometry();
      
      if (mesh.attributes && mesh.attributes.position) {
        const vertices = new Float32Array(mesh.attributes.position.array);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const tempMesh = new THREE.Mesh(geometry);
        tempGroup.add(tempMesh);
      }
    });
    
    const box = new THREE.Box3().setFromObject(tempGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' bytes';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };
    
    // Format dimensions
    const formatDimensions = (size: THREE.Vector3): string => {
      return `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`;
    };
    
    // Create metadata object
    const modelMetadata: ModelMetadata = {
      name: parsedData.root?.name || 'Unknown',
      partCount: parsedData.meshes.length,
      triangleCount,
      vertexCount,
      fileSize: fileData ? formatFileSize(fileData.byteLength) : 'Unknown',
      boundingBoxSize: formatDimensions(size)
    };
    
    setMetadata(modelMetadata);
    console.log('Model metadata:', modelMetadata);
    
  }, [parsedData, fileData]);

  // Handle file data
  useEffect(() => {
    if (!fileData || !occt) return;

    const loadModel = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = occt.ReadStepFile(new Uint8Array(fileData), null);
        
        if (!result || !result.success) {
          throw new Error('Failed to parse STEP file');
        }
        
        console.log('STEP file parsed successfully:', result);
        setParsedData(result);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Error loading model: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [fileData, occt]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span className="text-blue-500 font-medium">Loading model...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-[600px] bg-gray-100 rounded-lg transition-opacity duration-500" style={{ opacity: parsedData ? 1 : 0 }}>
        <Canvas 
          shadows 
          camera={{ 
            position: [10, 10, 10], 
            fov: 45,
            near: 0.1,
            far: 1000
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Stage environment="city" intensity={0.6}>
            {parsedData && <Model data={parsedData} />}
          </Stage>
          <OrbitControls 
            makeDefault 
            enableDamping={false}
            minDistance={0.5}
            maxDistance={100}
          />
          <gridHelper args={[10, 10]} />
        </Canvas>
      </div>
      
      {metadata && <ModelInfo metadata={metadata} />}
    </div>
  );
} 