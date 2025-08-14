'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  RotateCw,
  Crop,
  Filter,
  Sun,
  Moon,
  Zap,
  Sparkles,
  Image as ImageIcon,
  ChefHat,
  Coffee,
  Utensils
} from 'lucide-react';

interface FoodPhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  initialPhotos?: string[];
  showTips?: boolean;
  className?: string;
}

interface PhotoPreview {
  file: File;
  url: string;
  id: string;
}

export const FoodPhotoUpload: React.FC<FoodPhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10,
  initialPhotos = [],
  showTips = true,
  className = '',
}) => {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Please upload images in ${acceptedFormats.map(f => f.split('/')[1]).join(', ')} format`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size should be less than ${maxFileSize}MB`;
    }
    return null;
  }, [acceptedFormats, maxFileSize]);

  const processFiles = useCallback(async (files: FileList) => {
    if (photos.length + files.length > maxPhotos) {
      setError(`You can upload maximum ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    setError(null);

    const newPhotos: PhotoPreview[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      const url = URL.createObjectURL(file);
      newPhotos.push({
        file,
        url,
        id: Math.random().toString(36).substr(2, 9),
      });
    }

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos.map(p => p.file));
    }

    setIsUploading(false);
  }, [photos, maxPhotos, validateFile, onPhotosChange]);

  const removePhoto = useCallback((id: string) => {
    const updatedPhotos = photos.filter(photo => {
      if (photo.id === id) {
        URL.revokeObjectURL(photo.url);
        return false;
      }
      return true;
    });
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map(p => p.file));
  }, [photos, onPhotosChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const foodPhotoTips = [
    {
      icon: <Sun className="w-5 h-5" />,
      title: "Natural Lighting",
      description: "Use natural light from a window for the best colors"
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "45° Angle",
      description: "Shoot at a 45-degree angle to show texture and depth"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Clean Background",
      description: "Use a simple, clean background to make food pop"
    },
    {
      icon: <ChefHat className="w-5 h-5" />,
      title: "Show Context",
      description: "Include utensils or table setting for scale and story"
    },
  ];

  return (
    <div className={`food-photo-upload-container ${className}`}>
      {/* Upload Area */}
      <div
        className={`food-photo-upload ${isDragOver ? 'drag-over' : ''} ${photos.length > 0 ? 'has-photos' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={photos.length === 0 ? openFileSelector : undefined}
        role="button"
        tabIndex={0}
        aria-label="Upload food photos"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileSelector();
          }
        }}
      >
        {photos.length === 0 ? (
          <div className="food-photo-upload-content">
            <div className="food-photo-upload-icon">
              <motion.div
                animate={{ rotate: isDragOver ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Camera className="w-12 h-12 text-gray-400" />
              </motion.div>
            </div>
            <h3 className="text-heading-3 text-gray-700 mb-2">
              Add Food Photos
            </h3>
            <p className="text-body-small text-gray-500 mb-4 text-center max-w-xs">
              Drag & drop your delicious food photos here, or click to browse
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                className="btn btn-primary flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileSelector();
                }}
                type="button"
              >
                <Upload className="w-4 h-4" />
                Choose Photos
              </button>
              <button
                className="btn btn-outline flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  openCamera();
                }}
                type="button"
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <span>Up to {maxPhotos} photos</span>
              <span>•</span>
              <span>Max {maxFileSize}MB each</span>
            </div>
          </div>
        ) : (
          <div className="food-photo-grid">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="food-photo-preview"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={`Food photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle photo editing
                          }}
                          aria-label="Edit photo"
                        >
                          <Filter className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle photo rotation
                          }}
                          aria-label="Rotate photo"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                        Main
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {photos.length < maxPhotos && (
              <motion.button
                className="food-photo-add-more aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                onClick={openFileSelector}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                aria-label="Add more photos"
              >
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add More</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Upload Overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="food-photo-upload-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-orange-500 mb-2" />
                <span className="text-lg font-medium text-orange-600">
                  Drop your food photos here
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Controls */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-small"
              onClick={openFileSelector}
              type="button"
            >
              <ImageIcon className="w-4 h-4" />
              Add More
            </button>
            <button
              className="btn btn-ghost btn-small"
              onClick={openCamera}
              type="button"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
          </div>
          {showTips && (
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setShowTipsModal(true)}
              type="button"
            >
              <Sparkles className="w-4 h-4" />
              Photo Tips
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isUploading && (
        <motion.div
          className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner" />
          <span>Processing photos...</span>
        </motion.div>
      )}

      {/* Photo Tips Modal */}
      <AnimatePresence>
        {showTipsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTipsModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-heading-2 text-gray-800">Food Photography Tips</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowTipsModal(false)}
                  aria-label="Close tips"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {foodPhotoTips.map((tip, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Great food photos make your reviews more engaging and helpful to others!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

// CSS-in-JS styles for the component
const styles = `
.food-photo-upload-container {
  width: 100%;
}

.food-photo-upload {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--food-neutral-300);
  border-radius: var(--radius-2xl);
  background: var(--food-neutral-50);
  transition: all var(--duration-normal) var(--ease-food);
  cursor: pointer;
}

.food-photo-upload:hover {
  border-color: var(--food-primary);
  background: var(--food-primary-pale);
}

.food-photo-upload.drag-over {
  border-color: var(--food-primary);
  background: var(--food-primary-pale);
  transform: scale(1.02);
}

.food-photo-upload.has-photos {
  border-style: solid;
  border-color: var(--food-neutral-200);
  cursor: default;
  padding: var(--space-4);
}

.food-photo-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-8);
}

.food-photo-upload-icon {
  margin-bottom: var(--space-4);
}

.food-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-3);
  width: 100%;
}

.food-photo-preview {
  position: relative;
}

.food-photo-add-more {
  min-height: 120px;
}

.food-photo-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 107, 53, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-2xl);
}

@media (max-width: 640px) {
  .food-photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-2);
  }
  
  .food-photo-upload-content {
    padding: var(--space-6);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}