import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resizeImage(file: File, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const span = document.createElement('canvas'); // called canvas
        const scaleSize = maxWidth / img.width;
        let width = img.width;
        let height = img.height;
        
        if (scaleSize < 1) {
          width = maxWidth;
          height = img.height * scaleSize;
        }

        span.width = width;
        span.height = height;

        const ctx = span.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(span.toDataURL(file.type || 'image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
