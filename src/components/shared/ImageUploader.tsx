import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadToImgBB } from '@/lib/imgbb';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages: number;
  label?: string;
}

export function ImageUploader({ images, onChange, maxImages, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
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
    const newImages: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadingIndex(images.length + i);
      
      try {
        // Validate file size (max 32MB for imgBB)
        if (file.size > 32 * 1024 * 1024) {
          toast({
            title: 'File terlalu besar',
            description: `${file.name} melebihi 32MB`,
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

        const url = await uploadToImgBB(file);
        newImages.push(url);
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
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-base font-semibold flex items-center gap-2">
          <Camera size={18} className="text-primary" />
          {label} ({images.length}/{maxImages})
        </Label>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
            <img
              src={url}
              alt={`Dokumentasi ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 text-center">
              Foto {index + 1}
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
        Format: JPG, PNG, GIF. Maksimal 32MB per file. Upload ke imgBB.
      </p>
    </div>
  );
}
