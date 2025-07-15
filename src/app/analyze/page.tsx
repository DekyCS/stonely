"use client";

import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RockModel3D, RockModel3DLoader, RockModel3DError } from "@/components/rock-model-3d";
import { UploadIcon, ImageIcon, ZapIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UploadResponse {
  success: boolean;
  message: string;
  file_id: string;
  filename: string;
  size: number;
  content_type: string;
  upload_time: string;
}

interface Generate3DResponse {
  success: boolean;
  message: string;
  file_id: string;
  model_data: {
    vertices: number[][];
    faces: number[][];
    texture_coords: number[][];
    colors: number[][];
    metadata: {
      vertex_count: number;
      face_count: number;
      original_dimensions: number[];
      scale_factor: number;
    };
  };
  processing_info: {
    depth_estimation: string;
    device_used: string;
    mesh_generation: string;
  };
  generation_time: string;
  summary: {
    vertex_count: number;
    face_count: number;
    has_texture: boolean;
    has_colors: boolean;
    bbox_min: number[];
    bbox_max: number[];
  };
}

function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generate3DResult, setGenerate3DResult] = useState<Generate3DResponse | null>(null);
  const [is3DReady, setIs3DReady] = useState(false);
  const [threeDError, setThreeDError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize 3D viewer when model data is available
  useEffect(() => {
    if (generate3DResult?.model_data) {
      setIs3DReady(false);
      setThreeDError(null);
      
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        try {
          // Validate model data structure
          const modelData = generate3DResult.model_data;
          if (!modelData.vertices || !modelData.faces || modelData.vertices.length === 0) {
            throw new Error('Invalid model data structure');
          }
          setIs3DReady(true);
        } catch (err) {
          setThreeDError(err instanceof Error ? err.message : 'Failed to prepare 3D model');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [generate3DResult]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGenerate3D = async () => {
    if (!uploadResult) return;

    setIsGenerating3D(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/generate-3d/${uploadResult.file_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `3D generation failed: ${response.status}`);
      }

      const result: Generate3DResponse = await response.json();
      setGenerate3DResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '3D generation failed');
    } finally {
      setIsGenerating3D(false);
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setError(null);
    setGenerate3DResult(null);
    setIs3DReady(false);
    setThreeDError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Section id="upload">
      <div className="border-x border-t">
        <div className="max-w-4xl mx-auto p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance mb-6">
              Analyze Your Rock
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Upload a clear photo of your rock or mineral specimen and get instant AI-powered analysis with 3D visualization.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold">Upload Rock Photo</CardTitle>
              <p className="text-muted-foreground">
                Drag and drop your image or click to browse
              </p>
            </CardHeader>
            <CardContent>
              {!uploadResult && !error && !generate3DResult && (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : isUploading
                      ? 'border-muted-foreground/25 bg-muted/50'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {isUploading ? (
                        <LoaderIcon className="h-8 w-8 text-primary animate-spin" />
                      ) : (
                        <UploadIcon className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-2">
                        {isUploading ? 'Uploading...' : 'Drop your rock photo here'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supports JPG, PNG, and HEIC formats up to 10MB
                      </p>
                      {!isUploading && (
                        <Button className="w-full sm:w-auto" disabled={isUploading}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              )}

              {/* Success Result */}
              {uploadResult && !generate3DResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Upload Successful!</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">File:</span> {uploadResult.filename}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {formatFileSize(uploadResult.size)}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {uploadResult.content_type}
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span> {new Date(uploadResult.upload_time).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      File ID: {uploadResult.file_id}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetUpload} variant="outline" className="flex-1">
                      Upload Another
                    </Button>
                    <Button 
                      onClick={handleGenerate3D} 
                      className="flex-1" 
                      disabled={isGenerating3D}
                    >
                      {isGenerating3D ? (
                        <>
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                          Generating 3D Model...
                        </>
                      ) : (
                        <>
                          <ZapIcon className="h-4 w-4 mr-2" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 3D Generation Result */}
              {generate3DResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">3D Model Generated!</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Vertices:</span> {generate3DResult.summary.vertex_count.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Faces:</span> {generate3DResult.summary.face_count.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Device:</span> {generate3DResult.processing_info.device_used.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {generate3DResult.processing_info.depth_estimation}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Generated: {new Date(generate3DResult.generation_time).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-96 relative">
                      {/* Debug info - remove after testing */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded z-50">
                        3D Ready: {is3DReady ? 'YES' : 'NO'} | Error: {threeDError ? 'YES' : 'NO'}
                      </div>
                      
                      {!is3DReady && !threeDError && (
                        <RockModel3DLoader />
                      )}
                      
                      {threeDError && (
                        <RockModel3DError error={threeDError} />
                      )}
                      
                      {is3DReady && generate3DResult && (
                        <RockModel3D 
                          modelData={generate3DResult.model_data}
                          className="w-full h-full"
                        />
                      )}
                      
                      {/* 3D Controls Overlay */}
                      {is3DReady && (
                        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                          <p className="font-medium mb-1">3D Controls</p>
                          <p>• Left click + drag: Rotate</p>
                          <p>• Scroll: Zoom</p>
                          <p>• Right click + drag: Pan</p>
                        </div>
                      )}
                      
                      {/* Model Info Overlay */}
                      {is3DReady && generate3DResult && (
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                          <p>{generate3DResult.summary.vertex_count.toLocaleString()} vertices</p>
                          <p>{generate3DResult.summary.face_count.toLocaleString()} faces</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetUpload} variant="outline" className="flex-1">
                      Analyze Another Rock
                    </Button>
                    <Button 
                      className="flex-1" 
                      disabled={!is3DReady}
                      onClick={() => {
                        // Future: Implement 3D model download
                        alert('3D model download feature coming soon!');
                      }}
                    >
                      {is3DReady ? 'Download 3D Model' : 'Preparing Model...'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600 mb-4">
                    <XCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Upload Failed</span>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>

                  <Button onClick={resetUpload} variant="outline" className="w-full">
                    Try Again
                  </Button>
                </div>
              )}

              {!uploadResult && !error && !generate3DResult && (
                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ZapIcon className="h-5 w-5 text-primary" />
                    What happens next?
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-primary">1.</span>
                      <span>AI analyzes your photo to identify mineral composition</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-primary">2.</span>
                      <span>Depth estimation creates a 3D model from your 2D image</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-primary">3.</span>
                      <span>Get detailed results with interactive 3D visualization</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Your photos are processed securely and are not stored on our servers
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function AnalyzePage() {
  return (
    <main>
      <Header />
      <UploadSection />
      <Footer />
    </main>
  );
} 