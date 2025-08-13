'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = '',
  size = 'md'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // In a real app, you would upload to your storage service
      // For now, we'll simulate an upload with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful upload - in production, replace with actual upload logic
      const mockUploadedUrl = `https://images.unsplash.com/photo-${Date.now()}?w=300&h=300&fit=crop&crop=face`;
      
      onImageChange(mockUploadedUrl);
      setPreviewUrl(mockUploadedUrl);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100`}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Camera className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={openFileDialog}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Remove button */}
        {previewUrl && !isUploading && (
          <button
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area (alternative to button) */}
      <div className="mt-3 text-center">
        <button
          onClick={openFileDialog}
          disabled={isUploading}
          className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
        </button>
      </div>

      {/* Upload tips */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>JPG, PNG up to 5MB</p>
        <p>Square images work best</p>
      </div>
    </div>
  );
};

export default ImageUpload;