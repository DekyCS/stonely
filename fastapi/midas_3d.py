import torch
import cv2
import numpy as np
from PIL import Image
from transformers import pipeline
import json
from typing import Dict, List, Tuple, Any
from scipy import ndimage
from skimage import measure, filters
import warnings
warnings.filterwarnings('ignore')

class AdvancedMiDaS3DGenerator:
    def __init__(self):
        """Initialize advanced MiDaS model for geological sample analysis"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Initialize depth estimation pipeline with better model
        try:
            # Try state-of-the-art model first
            model_options = [
                "depth-anything/Depth-Anything-V2-Large",
                "Intel/dpt-beit-large-512", 
                "Intel/dpt-swinv2-large-384",
                "Intel/dpt-large"  # Fallback
            ]
            
            self.depth_estimator = None
            self.model_name = None
            
            for model in model_options:
                try:
                    print(f"Trying to load {model}...")
                    self.depth_estimator = pipeline(
                        "depth-estimation",
                        model=model,
                        device=0 if self.device == "cuda" else -1
                    )
                    self.model_name = model
                    print(f"Successfully loaded: {model}")
                    break
                except Exception as e:
                    print(f"Failed to load {model}: {e}")
                    continue
            
            if self.depth_estimator is None:
                raise Exception("No depth estimation model could be loaded")
                
        except Exception as e:
            print(f"Error loading depth model: {e}")
            self.depth_estimator = None
    
    def preprocess_rock_image(self, image_path: str) -> np.ndarray:
        """
        Enhanced preprocessing specifically for geological samples
        
        Args:
            image_path: Path to the input rock image
            
        Returns:
            Preprocessed image as numpy array
        """
        print("Preprocessing rock image...")
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Convert to RGB for consistent processing
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Step 1: Enhance contrast for mineral details using CLAHE
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        # Step 2: Sharpen for mineral boundaries and crystal faces
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # Step 3: Enhance edges while preserving texture
        edges = cv2.Canny(cv2.cvtColor(sharpened, cv2.COLOR_RGB2GRAY), 50, 150)
        edges_dilated = cv2.dilate(edges, np.ones((3,3), np.uint8), iterations=1)
        
        # Blend enhanced edges back
        result = sharpened.copy()
        result[edges_dilated > 0] = np.minimum(result[edges_dilated > 0] * 1.2, 255)
        
        # Step 4: Slight denoising while preserving geological details
        denoised = cv2.bilateralFilter(result, 9, 75, 75)
        
        return denoised.astype(np.uint8)
    
    def multi_scale_depth_estimation(self, image: np.ndarray) -> np.ndarray:
        """
        Multi-scale depth estimation for better rock detail capture
        
        Args:
            image: Preprocessed rock image
            
        Returns:
            Combined depth map from multiple scales
        """
        print("Performing multi-scale depth estimation...")
        
        scales = [1.0, 0.75, 0.5]  # Different scales for detail capture
        depth_maps = []
        weights = [0.5, 0.3, 0.2]  # Weights for combining scales
        
        original_size = image.shape[:2]
        
        for i, scale in enumerate(scales):
            # Resize image
            if scale != 1.0:
                new_size = (int(original_size[1] * scale), int(original_size[0] * scale))
                scaled_image = cv2.resize(image, new_size)
            else:
                scaled_image = image
            
            # Convert to PIL for depth estimation
            pil_image = Image.fromarray(scaled_image)
            
            # Get depth estimation
            result = self.depth_estimator(pil_image)
            depth_map = np.array(result["depth"])
            
            # Resize back to original size
            if scale != 1.0:
                depth_map = cv2.resize(depth_map, (original_size[1], original_size[0]))
            
            # Normalize depth values
            depth_map = (depth_map - depth_map.min()) / (depth_map.max() - depth_map.min())
            depth_maps.append(depth_map)
        
        # Combine depth maps with weighted average
        combined_depth = np.zeros_like(depth_maps[0])
        for depth_map, weight in zip(depth_maps, weights):
            combined_depth += depth_map * weight
        
        return combined_depth
    
    def enhance_geological_features(self, depth_map: np.ndarray, original_image: np.ndarray) -> np.ndarray:
        """
        Enhance geological features in the depth map
        
        Args:
            depth_map: Raw depth map
            original_image: Original rock image
            
        Returns:
            Enhanced depth map with geological features emphasized
        """
        print("Enhancing geological features...")
        
        # Convert to grayscale for edge detection
        gray = cv2.cvtColor(original_image, cv2.COLOR_RGB2GRAY)
        
        # Detect mineral boundaries using multiple edge detection methods
        edges_canny = cv2.Canny(gray, 50, 150)
        edges_sobel = cv2.Sobel(gray, cv2.CV_64F, 1, 1, ksize=3)
        edges_sobel = np.uint8(np.absolute(edges_sobel))
        
        # Combine edge detections
        combined_edges = cv2.bitwise_or(edges_canny, edges_sobel)
        
        # Dilate edges slightly to create influence zones
        kernel = np.ones((3,3), np.uint8)
        edges_dilated = cv2.dilate(combined_edges, kernel, iterations=1)
        
        # Enhance depth at mineral boundaries
        enhanced_depth = depth_map.copy()
        edge_mask = edges_dilated > 0
        enhanced_depth[edge_mask] *= 1.3  # Amplify depth at edges
        
        # Detect potential crystal faces (flat regions with defined boundaries)
        # Use morphological operations to find flat regions
        kernel = np.ones((5,5), np.uint8)
        opened = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        crystal_faces = cv2.subtract(gray, opened)
        
        # Enhance crystal face regions
        face_mask = crystal_faces > 10
        enhanced_depth[face_mask] *= 1.1
        
        # Smooth non-edge areas to reduce noise while preserving geological structure
        smoothed = cv2.GaussianBlur(enhanced_depth, (5, 5), 0)
        mask = edges_dilated == 0
        enhanced_depth[mask] = smoothed[mask]
        
        return enhanced_depth
    
    def post_process_rock_depth(self, depth_map: np.ndarray) -> np.ndarray:
        """
        Post-process depth map for geological accuracy and realism
        
        Args:
            depth_map: Raw depth map
            
        Returns:
            Post-processed depth map with geological constraints
        """
        print("Post-processing for geological accuracy...")
        
        # Remove impossible depth transitions (rocks don't have sharp vertical drops)
        # Use bilateral filter to smooth while preserving edges
        smoothed = cv2.bilateralFilter(depth_map.astype(np.float32), 9, 75, 75)
        
        # Calculate gradients to identify unrealistic transitions
        grad_x = cv2.Sobel(smoothed, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(smoothed, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Reduce extreme gradients (geological constraint)
        extreme_gradient_mask = gradient_magnitude > 0.3
        smoothed[extreme_gradient_mask] = cv2.GaussianBlur(smoothed, (7, 7), 0)[extreme_gradient_mask]
        
        # Enhance realistic geological features
        # Detect and enhance natural rock textures
        enhanced = smoothed + 0.05 * np.abs(grad_x + grad_y)
        
        # Apply geological plausibility constraints
        enhanced = np.clip(enhanced, 0, 1)
        
        # Final smoothing for natural appearance
        final = cv2.GaussianBlur(enhanced, (3, 3), 0)
        
        return final
    
    def calculate_adaptive_step(self, depth_map: np.ndarray, image: np.ndarray) -> int:
        """
        Calculate adaptive step size based on surface detail complexity
        
        Args:
            depth_map: Depth map
            image: Original image
            
        Returns:
            Optimal step size for mesh generation
        """
        # Calculate local variance to determine detail level
        variance = cv2.Laplacian(depth_map, cv2.CV_64F).var()
        
        # Calculate edge density
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Determine step size based on complexity
        if variance > 0.1 and edge_density > 0.05:  # High detail areas
            return 2
        elif variance > 0.05 or edge_density > 0.03:  # Medium detail
            return 3
        else:  # Low detail areas
            return 4
    
    def create_adaptive_3d_mesh(self, image_path: str, depth_map: np.ndarray, 
                               scale_factor: float = 0.15) -> Dict[str, Any]:
        """
        Create adaptive 3D mesh with variable resolution based on surface detail
        
        Args:
            image_path: Path to original image
            depth_map: Enhanced depth map
            scale_factor: Scale factor for 3D coordinates
            
        Returns:
            Dictionary containing vertices, faces, and texture coordinates
        """
        print("Creating adaptive 3D mesh...")
        
        # Load original image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        # Resize depth map to match image dimensions
        depth_resized = cv2.resize(depth_map, (width, height))
        
        # Calculate adaptive step size
        step = self.calculate_adaptive_step(depth_resized, image)
        
        # Generate vertices with adaptive resolution
        vertices = []
        texture_coords = []
        colors = []
        
        # Create grid of vertices
        for y in range(0, height, step):
            for x in range(0, width, step):
                # Normalize coordinates to [-1, 1]
                x_norm = (x / width) * 2 - 1
                y_norm = (y / height) * 2 - 1
                
                # Apply enhanced depth scaling
                z_norm = depth_resized[y, x] * scale_factor
                
                vertices.append([x_norm, -y_norm, z_norm])  # Flip Y for correct orientation
                
                # Texture coordinates (0 to 1)
                texture_coords.append([x / width, 1 - (y / height)])
                
                # Color from original image
                color = image[y, x] / 255.0  # Normalize to 0-1
                colors.append(color.tolist())
        
        # Generate faces (triangles) with adaptive topology
        faces = []
        cols = width // step
        rows = height // step
        
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
                "scale_factor": scale_factor,
                "adaptive_step": step,
                "mesh_quality": "adaptive_high_detail"
            }
        }
    
    def assess_rock_quality(self, depth_map: np.ndarray, image: np.ndarray) -> Dict[str, float]:
        """
        Assess quality of depth estimation specifically for rocks
        
        Args:
            depth_map: Generated depth map
            image: Original rock image
            
        Returns:
            Quality metrics dictionary
        """
        print("Assessing rock analysis quality...")
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Edge consistency: how well depth edges align with image edges
        image_edges = cv2.Canny(gray, 50, 150)
        depth_edges = cv2.Canny((depth_map * 255).astype(np.uint8), 50, 150)
        
        # Calculate edge alignment
        edge_intersection = cv2.bitwise_and(image_edges, depth_edges)
        edge_union = cv2.bitwise_or(image_edges, depth_edges)
        edge_consistency = np.sum(edge_intersection) / max(np.sum(edge_union), 1)
        
        # Surface smoothness: geological surfaces should be reasonably smooth
        grad_x = cv2.Sobel(depth_map, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(depth_map, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        surface_smoothness = 1.0 - np.mean(gradient_magnitude)
        
        # Mineral definition: how well defined are different mineral regions
        # Use variance in local regions to assess detail preservation
        kernel = np.ones((5,5), np.float32) / 25
        local_mean = cv2.filter2D(depth_map, -1, kernel)
        local_variance = cv2.filter2D(depth_map**2, -1, kernel) - local_mean**2
        mineral_definition = np.mean(local_variance)
        
        # Depth range utilization: good depth maps should use full range
        depth_range = depth_map.max() - depth_map.min()
        range_utilization = min(depth_range / 1.0, 1.0)  # Normalize to 0-1
        
        # Overall quality score
        overall_score = (
            edge_consistency * 0.3 +
            surface_smoothness * 0.25 +
            mineral_definition * 0.25 +
            range_utilization * 0.2
        )
        
        return {
            "edge_consistency": float(edge_consistency),
            "surface_smoothness": float(surface_smoothness),
            "mineral_definition": float(mineral_definition),
            "range_utilization": float(range_utilization),
            "overall_score": float(overall_score)
        }
    
    def generate_3d_model(self, image_path: str) -> Dict[str, Any]:
        """
        Complete enhanced pipeline for rock 3D model generation
        
        Args:
            image_path: Path to input rock image
            
        Returns:
            Complete 3D model data with quality metrics
        """
        try:
            print(f"Generating enhanced 3D model for: {image_path}")
            
            if self.depth_estimator is None:
                raise Exception("Depth estimation model not loaded")
            
            # Step 1: Preprocess rock image
            print("Step 1: Rock-specific preprocessing...")
            preprocessed_image = self.preprocess_rock_image(image_path)
            
            # Step 2: Multi-scale depth estimation
            print("Step 2: Multi-scale depth estimation...")
            raw_depth_map = self.multi_scale_depth_estimation(preprocessed_image)
            
            # Step 3: Enhance geological features
            print("Step 3: Geological feature enhancement...")
            enhanced_depth_map = self.enhance_geological_features(raw_depth_map, preprocessed_image)
            
            # Step 4: Post-process for geological accuracy
            print("Step 4: Geological post-processing...")
            final_depth_map = self.post_process_rock_depth(enhanced_depth_map)
            
            # Step 5: Create adaptive 3D mesh
            print("Step 5: Adaptive mesh generation...")
            mesh_data = self.create_adaptive_3d_mesh(image_path, final_depth_map)
            
            # Step 6: Assess quality
            print("Step 6: Quality assessment...")
            quality_metrics = self.assess_rock_quality(final_depth_map, preprocessed_image)
            
            print(f"Enhanced 3D model generated successfully!")
            print(f"Quality Score: {quality_metrics['overall_score']:.3f}")
            print(f"Vertices: {mesh_data['metadata']['vertex_count']}")
            print(f"Faces: {mesh_data['metadata']['face_count']}")
            
            return {
                "success": True,
                "model_data": mesh_data,
                "processing_info": {
                    "depth_estimation": self.model_name,
                    "device_used": self.device,
                    "mesh_generation": "adaptive_geological",
                    "preprocessing": "rock_enhanced",
                    "quality_score": quality_metrics['overall_score']
                },
                "quality_metrics": quality_metrics
            }
            
        except Exception as e:
            print(f"Error generating enhanced 3D model: {e}")
            return {
                "success": False,
                "error": str(e),
                "model_data": None,
                "quality_metrics": None
            }

# Global instance
midas_generator = None

def get_midas_generator():
    """Get or create enhanced MiDaS generator instance"""
    global midas_generator
    if midas_generator is None:
        midas_generator = AdvancedMiDaS3DGenerator()
    return midas_generator 