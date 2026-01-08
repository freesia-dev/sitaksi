import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { uploadDokumentasi } from '@/lib/storage';
import { Camera, X, Loader2, Upload, ImageOff, Check, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface LabeledImage {
  url: string;
  label: string;
}

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted text-muted-foreground", className)}>
        <ImageOff size={24} />
        <span className="text-xs mt-1">Gagal dimuat</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
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

interface CloudImageUploaderProps {
  images: LabeledImage[];
  onChange: (images: LabeledImage[]) => void;
  maxImages: number;
  title?: string;
  defaultLabels?: string[];
  taksasiId?: string;
}

export function CloudImageUploader({ 
  images, 
  onChange, 
  maxImages, 
  title = "Dokumentasi Foto",
  defaultLabels = [],
  taksasiId 
}: CloudImageUploaderProps) {
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
      setUploadingIndex(images.length + i);
      
      try {
        // Validate file size (max 10MB for cloud storage)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'File terlalu besar',
            description: `${file.name} melebihi 10MB`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Format tidak valid',
            description: `${file.name} bukan file gambar`,
            variant: 'destructive',
          });
          continue;
        }

        const result = await uploadDokumentasi(file, taksasiId);
        const defaultLabel = defaultLabels[images.length + newImages.length] || `Foto ${images.length + newImages.length + 1}`;
        newImages.push({ url: result.url, label: defaultLabel });
      } catch (error: any) {
        toast({
          title: 'Upload gagal',
          description: error.message || `Gagal mengupload ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      toast({
        title: 'Upload berhasil',
        description: `${newImages.length} foto berhasil diupload ke Cloud Storage`,
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

  const handleSaveLabel = () => {
    if (editingIndex !== null) {
      const updated = [...images];
      updated[editingIndex] = { ...updated[editingIndex], label: editLabel };
      onChange(updated);
      setEditingIndex(null);
      setEditLabel('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveLabel();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditLabel('');
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center gap-2">
        <Camera size={18} className="text-primary" />
        {title} ({images.length}/{maxImages})
      </Label>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden border bg-muted group">
            <div className="aspect-square relative">
              <ImageWithFallback
                src={img.url}
                alt={img.label}
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
            <div className="p-2 bg-background border-t">
              {editingIndex === index ? (
                <div className="flex gap-1">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleSaveLabel}
                  >
                    <Check size={12} />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex items-center justify-between gap-1 cursor-pointer hover:bg-muted/50 rounded px-1"
                  onClick={() => handleStartEdit(index)}
                >
                  <span className="text-xs truncate flex-1">{img.label}</span>
                  <Pencil size={10} className="text-muted-foreground shrink-0" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upload slots */}
        {Array.from({ length: Math.min(maxImages - images.length, 4) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className={cn(
              "relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors",
              uploading && uploadingIndex === images.length + index && "border-primary"
            )}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading && uploadingIndex === images.length + index ? (
              <Loader2 className="animate-spin text-primary" size={24} />
            ) : (
              <Upload className="text-muted-foreground/50" size={24} />
            )}
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
                Mengupload ke Cloud...
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
        Format: JPG, PNG, WEBP. Maksimal 10MB per file. Disimpan di Cloud Storage dengan sistem circular buffer.
      </p>
    </div>
  );
}
