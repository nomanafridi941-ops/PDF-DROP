
import React, { useState, useRef, useCallback } from 'react';
import { Upload, FilePlus, AlertCircle } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  multiple?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, multiple = true }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Fixed: Explicitly cast Array.from(e.dataTransfer.files) to File[] to satisfy TypeScript
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    validateAndAddFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fixed: Explicitly cast Array.from(e.target.files) to File[] to satisfy TypeScript
      validateAndAddFiles(Array.from(e.target.files) as File[]);
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length > 0) {
      onFilesAdded(pdfFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
        ${isDragging 
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' 
          : 'border-slate-300 dark:border-slate-800 hover:border-primary-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/30'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple={multiple}
        accept=".pdf"
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 group-hover:text-primary-600'}`}>
          {multiple ? <FilePlus size={32} /> : <Upload size={32} />}
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-semibold">
            {isDragging ? 'Drop your PDFs here' : 'Drop your PDFs here'}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            or click to browse from your device
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-4">
          <AlertCircle size={14} />
          <span>Maximum file size: 100MB per file</span>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
