import torch
import cv2
import numpy as np
from PIL import Image
from transformers import pipeline
import json
from typing import Dict, List, Tuple, Any

class MiDaS3DGenerator:
    def __init__(self):
        """Initialize MiDaS model for depth estimation"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Initialize depth estimation pipeline
        try:
            self.depth_estimator = pipeline(
                "depth-estimation",
                model="Intel/dpt-large",
                device=0 if self.device == "cuda" else -1
            )
            print("MiDaS model loaded successfully")
        except Exception as e:
            print(f"Error loading MiDaS model: {e}")
            self.depth_estimator = None
    
    def estimate_depth(self, image_path: str) -> np.ndarray:
        """
        Estimate depth from image using MiDaS
        
        Args:
            image_path: Path to the input image
            
        Returns:
            Depth map as numpy array
        """
        if self.depth_estimator is None:
            raise Exception("MiDaS model not loaded")
        
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")
        
        # Get depth estimation
        result = self.depth_estimator(image)
        depth_map = np.array(result["depth"])
        
        # Normalize depth values
        depth_map = (depth_map - depth_map.min()) / (depth_map.max() - depth_map.min())
        
        return depth_map
    
    def create_3d_mesh(self, image_path: str, depth_map: np.ndarray, 
                      scale_factor: float = 0.1) -> Dict[str, Any]:
        """
        Convert depth map and image to 3D mesh data
        
        Args:
            image_path: Path to original image
            depth_map: Depth map from MiDaS
            scale_factor: Scale factor for 3D coordinates
            
        Returns:
            Dictionary containing vertices, faces, and texture coordinates
        """
        # Load original image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        # Resize depth map to match image dimensions
        depth_resized = cv2.resize(depth_map, (width, height))
        
        # Generate vertices
        vertices = []
        texture_coords = []
        colors = []
        
        # Create grid of vertices
        for y in range(0, height, 4):  # Skip pixels for performance
            for x in range(0, width, 4):
                # Normalize coordinates to [-1, 1]
                x_norm = (x / width) * 2 - 1
                y_norm = (y / height) * 2 - 1
                z_norm = depth_resized[y, x] * scale_factor
                
                vertices.append([x_norm, -y_norm, z_norm])  # Flip Y for correct orientation
                
                # Texture coordinates (0 to 1)
                texture_coords.append([x / width, 1 - (y / height)])
                
                # Color from original image
                color = image[y, x] / 255.0  # Normalize to 0-1
                colors.append(color.tolist())
        
        # Generate faces (triangles)
        faces = []
        cols = width // 4
        rows = height // 4
        
        for row in range(rows - 1):
            for col in range(cols - 1):
                # Current vertex indices
                v0 = row * cols + col
                v1 = row * cols + (col + 1)
                v2 = (row + 1) * cols + col
                v3 = (row + 1) * cols + (col + 1)
                
                # Create two triangles per quad
                faces.append([v0, v1, v2])
                faces.append([v1, v3, v2])
        
        return {
            "vertices": vertices,
            "faces": faces,
            "texture_coords": texture_coords,
            "colors": colors,
            "metadata": {
                "vertex_count": len(vertices),
                "face_count": len(faces),
                "original_dimensions": [width, height],
                "scale_factor": scale_factor
            }
        }
    
    def generate_3d_model(self, image_path: str) -> Dict[str, Any]:
        """
        Complete pipeline: estimate depth and create 3D model
        
        Args:
            image_path: Path to input image
            
        Returns:
            Complete 3D model data ready for Three.js
        """
        try:
            print(f"Generating 3D model for: {image_path}")
            
            # Step 1: Estimate depth
            print("Estimating depth...")
            depth_map = self.estimate_depth(image_path)
            
            # Step 2: Create 3D mesh
            print("Creating 3D mesh...")
            mesh_data = self.create_3d_mesh(image_path, depth_map)
            
            print(f"3D model generated successfully: {mesh_data['metadata']['vertex_count']} vertices")
            
            return {
                "success": True,
                "model_data": mesh_data,
                "processing_info": {
                    "depth_estimation": "Intel/dpt-large",
                    "device_used": self.device,
                    "mesh_generation": "grid-based"
                }
            }
            
        except Exception as e:
            print(f"Error generating 3D model: {e}")
            return {
                "success": False,
                "error": str(e),
                "model_data": None
            }

# Global instance
midas_generator = None

def get_midas_generator():
    """Get or create MiDaS generator instance"""
    global midas_generator
    if midas_generator is None:
        midas_generator = MiDaS3DGenerator()
    return midas_generator 