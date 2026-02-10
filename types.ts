
export type ToolType = 'compress' | 'merge';
export type FileStatus = 'reading' | 'ready' | 'processing' | 'completed' | 'error';
export type CompressionLevel = 'low' | 'medium' | 'high';

export interface FileWithMeta {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number; // For processing/overall
  uploadProgress: number; // For initial local "upload" reading
  thumbnailUrl?: string;
  thumbnailLoading?: boolean;
  resultBlob?: Blob;
  resultSize?: number;
}

export interface ProcessingResult {
  blob: Blob;
  name: string;
  originalSize: number;
  newSize: number;
}
