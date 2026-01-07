import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToImgBB } from '@/lib/imgbb';
import { Camera, X, Loader2, Upload, Pencil, Check, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface LabeledImage {
  url: string;
  label: string;
}

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
        <ImageOff size={20} />
        <span className="mt-1 text-[10px]">Gagal memuat</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        crossOrigin="anonymous"
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}

interface LabeledImageUploaderProps {
  images: LabeledImage[];
  onChange: (images: LabeledImage[]) => void;
  maxImages: number;
  title?: string;
  defaultLabels?: string[];
}

export function LabeledImageUploader({ 
  images, 
  onChange, 
  maxImages, 
  title,
  defaultLabels = [
    'Tampak Depan',
    'Tampak Belakang',
    'Tampak Samping Kiri',
    'Tampak Samping Kanan',
    'Speedometer',
    'Nomor Rangka',
    'Nomor Mesin',
  ]
}: LabeledImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: 'Batas tercapai',
        description: `Maksimal ${maxImages} foto`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const newImages: LabeledImage[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const currentIndex = images.length + i;
      setUploadingIndex(currentIndex);
      
      try {
        if (file.size > 32 * 1024 * 1024) {
          toast({
            title: 'File terlalu besar',
            description: `${file.name} melebihi 32MB`,
            variant: 'destructive',
          });
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Format tidak valid',
            description: `${file.name} bukan file gambar`,
            variant: 'destructive',
          });
          continue;
        }

        const url = await uploadToImgBB(file);
        // Use default label if available, otherwise use "Foto X"
        const defaultLabel = defaultLabels[currentIndex] || `Foto ${currentIndex + 1}`;
        newImages.push({ url, label: defaultLabel });
      } catch (error) {
        toast({
          title: 'Upload gagal',
          description: `Gagal mengupload ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      toast({
        title: 'Upload berhasil',
        description: `${newImages.length} foto berhasil diupload`,
      });
    }

    setUploading(false);
    setUploadingIndex(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditLabel(images[index].label);
  };

  const handleSaveLabel = (index: number) => {
    if (editLabel.trim()) {
      const updated = [...images];
      updated[index] = { ...updated[index], label: editLabel.trim() };
      onChange(updated);
    }
    setEditingIndex(null);
    setEditLabel('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleSaveLabel(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditLabel('');
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <Label className="text-base font-semibold flex items-center gap-2">
          <Camera size={18} className="text-primary" />
          {title} ({images.length}/{maxImages})
        </Label>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
              <ImageWithFallback
                src={image.url}
                alt={image.label}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Editable Label */}
            <div className="flex items-center gap-1">
              {editingIndex === index ? (
                <>
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleSaveLabel(index)}
                  >
                    <Check size={14} className="text-success" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium truncate flex-1 text-center">
                    {image.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100"
                    onClick={() => handleStartEdit(index)}
                  >
                    <Pencil size={12} />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Upload slots */}
        {Array.from({ length: Math.min(maxImages - images.length, 4) }).map((_, index) => (
          <div key={`empty-${index}`} className="space-y-2">
            <div
              className={cn(
                "relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors",
                uploading && uploadingIndex === images.length + index && "border-primary"
              )}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading && uploadingIndex === images.length + index ? (
                <Loader2 className="animate-spin text-primary" size={24} />
              ) : (
                <>
                  <Upload className="text-muted-foreground/50 mb-1" size={20} />
                  <span className="text-xs text-muted-foreground/50">Upload</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center truncate">
              {defaultLabels[images.length + index] || `Foto ${images.length + index + 1}`}
            </p>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Mengupload...
              </>
            ) : (
              <>
                <Camera className="mr-2" size={16} />
                Pilih Foto
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Format: JPG, PNG, GIF. Maksimal 32MB per file. Klik ikon pensil untuk edit label.
      </p>
    </div>
  );
}
