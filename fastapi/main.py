from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import uuid
from datetime import datetime
from PIL import Image
import aiofiles
from midas_3d import get_midas_generator

# Create FastAPI instance
app = FastAPI(
    title="Rockly API",
    description="Advanced AI-powered rock and mineral analysis API with enhanced depth estimation, geological feature recognition, and adaptive 3D mesh generation",
    version="2.0.0"
)

# Configure CORS to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Response Models
class FileUploadResponse(BaseModel):
    success: bool
    message: str
    file_id: str
    filename: str
    size: int
    content_type: str
    upload_time: str

class ProcessingInfo(BaseModel):
    depth_estimation: str
    device_used: str
    mesh_generation: str
    preprocessing: str
    quality_score: float

class QualityMetrics(BaseModel):
    edge_consistency: float
    surface_smoothness: float
    mineral_definition: float
    range_utilization: float
    overall_score: float

class ModelDataSummary(BaseModel):
    vertex_count: int
    face_count: int
    has_texture: bool
    has_colors: bool
    bbox_min: List[float]
    bbox_max: List[float]
    adaptive_step: int
    mesh_quality: str
    
    class Config:
        # This prevents the full vertex/face data from being included in examples
        json_schema_extra = {
            "example": {
                "vertex_count": 1500,
                "face_count": 2800,
                "has_texture": True,
                "has_colors": True,
                "bbox_min": [-1.0, -1.0, -1.0],
                "bbox_max": [1.0, 1.0, 1.0],
                "adaptive_step": 3,
                "mesh_quality": "adaptive_high_detail"
            }
        }

class Generate3DResponse(BaseModel):
    success: bool
    message: str
    file_id: str
    model_data: Dict[str, Any]  # Full data, but won't show in docs due to schema
    processing_info: ProcessingInfo
    generation_time: str
    summary: ModelDataSummary
    quality_metrics: QualityMetrics
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "3D model generated successfully", 
                "file_id": "abc123",
                "model_data": {"note": "Full 3D data with vertices, faces, textures - truncated for docs"},
                "processing_info": {
                    "depth_estimation": "depth-anything/Depth-Anything-V2-Large",
                    "device_used": "cpu",
                    "mesh_generation": "adaptive_geological",
                    "preprocessing": "rock_enhanced",
                    "quality_score": 0.847
                },
                "generation_time": "2024-01-01T12:00:00",
                "summary": {
                    "vertex_count": 1500,
                    "face_count": 2800,
                    "has_texture": True,
                    "has_colors": True,
                    "bbox_min": [-1.0, -1.0, -1.0],
                    "bbox_max": [1.0, 1.0, 1.0],
                    "adaptive_step": 3,
                    "mesh_quality": "adaptive_high_detail"
                },
                "quality_metrics": {
                    "edge_consistency": 0.852,
                    "surface_smoothness": 0.794,
                    "mineral_definition": 0.867,
                    "range_utilization": 0.913,
                    "overall_score": 0.847
                }
            }
        }

class FileInfoResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    created: str
    exists: bool

def validate_image_file(file: UploadFile) -> dict:
    """Validate uploaded image file"""
    
    # Check file extension
    file_extension = os.path.splitext(file.filename.lower())[1] if file.filename else ""
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not supported. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    return {
        "extension": file_extension,
        "content_type": file.content_type,
        "filename": file.filename
    }

def find_uploaded_file(file_id: str) -> str:
    """Find uploaded file by ID and return full path"""
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(file_id):
            return os.path.join(UPLOAD_DIR, filename)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/")
async def root():
    """Root endpoint to test API is working"""
    return {
        "message": "Welcome to Enhanced Rockly API", 
        "status": "active",
        "version": "2.0.0",
        "features": [
            "Rock-specific preprocessing",
            "Multi-scale depth estimation", 
            "Geological feature enhancement",
            "Adaptive mesh generation",
            "Quality assessment metrics"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/upload-image", response_model=FileUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload rock image for analysis
    
    - **file**: Image file (JPG, PNG, HEIC, WebP, max 10MB)
    
    Returns file information and upload confirmation
    """
    
    # Validate file
    file_info = validate_image_file(file)
    
    # Read file content
    file_content = await file.read()
    
    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}{file_info['extension']}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Try to validate it's a real image using PIL
        try:
            with Image.open(file_path) as img:
                image_info = {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format,
                    "mode": img.mode
                }
        except Exception as e:
            # Clean up invalid file
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail="Invalid image file"
            )
        
        # Return success response matching FileUploadResponse model
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "file_id": file_id,
            "filename": file_info["filename"],
            "size": len(file_content),
            "content_type": file_info["content_type"],
            "upload_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        # Clean up file if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

@app.post("/generate-3d/{file_id}", response_model=Generate3DResponse)
async def generate_3d_model(file_id: str):
    """
    Generate enhanced 3D model from uploaded rock image using advanced depth estimation
    
    - **file_id**: ID of previously uploaded rock image
    
    Features:
    - Rock-specific preprocessing with mineral enhancement
    - Multi-scale depth estimation for better detail capture
    - Geological feature enhancement (crystal faces, mineral boundaries)
    - Adaptive mesh generation based on surface complexity
    - Quality metrics for assessment
    
    Returns enhanced 3D model data (vertices, faces, textures) ready for Three.js
    Note: Full model data is included but truncated in API docs to prevent display issues
    """
    
    # Find the uploaded file
    file_path = find_uploaded_file(file_id)
    
    try:
        # Get MiDaS generator instance
        midas = get_midas_generator()
        
        # Generate 3D model
        result = midas.generate_3d_model(file_path)
        
        if result["success"]:
            model_data = result["model_data"]
            processing_info = result["processing_info"]
            
            # Calculate bounding box from vertices
            vertices = model_data["vertices"]
            import numpy as np
            vertices_array = np.array(vertices)
            bbox_min = vertices_array.min(axis=0).tolist()
            bbox_max = vertices_array.max(axis=0).tolist()
            
            # Create summary for safe API docs display
            summary = ModelDataSummary(
                vertex_count=len(vertices),
                face_count=len(model_data["faces"]),
                has_texture=bool(model_data.get("texture_coords")),
                has_colors=bool(model_data.get("colors")),
                bbox_min=bbox_min,
                bbox_max=bbox_max,
                adaptive_step=model_data["metadata"].get("adaptive_step", 4),
                mesh_quality=model_data["metadata"].get("mesh_quality", "adaptive_high_detail")
            )
            
            return Generate3DResponse(
                success=True,
                message="Enhanced 3D model generated successfully",
                file_id=file_id,
                model_data=model_data,  # Full data for actual use
                processing_info=ProcessingInfo(**processing_info),
                generation_time=datetime.now().isoformat(),
                summary=summary,
                quality_metrics=QualityMetrics(**result["quality_metrics"])
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"3D generation failed: {result['error']}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating 3D model: {str(e)}"
        )

@app.get("/uploads/{file_id}", response_model=FileInfoResponse)
async def get_uploaded_file_info(file_id: str):
    """Get information about an uploaded file"""
    
    # Find file with this ID
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(file_id):
            file_path = os.path.join(UPLOAD_DIR, filename)
            file_stats = os.stat(file_path)
            
            return {
                "file_id": file_id,
                "filename": filename,
                "size": file_stats.st_size,
                "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                "exists": True
            }
    
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 