"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CldUploadButton } from "next-cloudinary";

import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL..."
          className="w-full px-3 py-2 border rounded-lg"
          disabled={disabled}
        />
      </div>
      
      {value && (
        <div className="relative h-40 w-40">
          <Image
            fill
            alt="Preview"
            src={value}
            className="rounded-lg object-cover"
          />
        </div>
      )}
      
      {value && (
        <Button
          onClick={() => onChange("")}
          variant="outline"
          type="button"
          disabled={disabled}
        >
          <X className="h-4 w-4 mr-2" />
          Remove Image
        </Button>
      )}
    </div>
  );
};
