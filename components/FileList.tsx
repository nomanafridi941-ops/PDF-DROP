
import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Loader2, 
  ArrowUpCircle, 
  AlertCircle, 
  PlusCircle, 
  Download, 
  RefreshCcw, 
  Clock,
  GripVertical
} from 'lucide-react';
import { FileWithMeta } from '../types';
import { formatBytes } from '../services/pdfService';

interface FileListProps {
  files: FileWithMeta[];
  onRemove: (id: string) => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  showControls?: boolean;
  isProcessing?: boolean;
  onDownload?: (blob: Blob, name: string) => void;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  onRemove, 
  onMove, 
  onReorder,
  showControls = false,
  isProcessing = false,
  onDownload
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isProcessing) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index && onReorder) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4 mt-8 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Queue ({files.length} {files.length === 1 ? 'file' : 'files'})
        </h3>
        {isProcessing && (
          <div className="flex items-center text-xs font-medium text-primary-600 animate-pulse">
            <Loader2 size={12} className="mr-1 animate-spin" />
            Working...
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {files.map((file, index) => {
          const isReading = file.status === 'reading';
          const isProcessingFile = file.status === 'processing';
          const isCompleted = file.status === 'completed';
          const isError = file.status === 'error';
          const isReady = file.status === 'ready';
          
          return (
            <div 
              key={file.id} 
              draggable={!isProcessing && !isReading && showControls}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 ${
                draggedIndex === index ? 'opacity-40 scale-95 border-primary-500' : ''
              } ${
                isError 
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10'
                  : (isReading || isProcessingFile)
                  ? 'border-primary-200 dark:border-primary-900/50 shadow-lg shadow-primary-500/5'
                  : isCompleted
                  ? 'border-green-100 dark:border-green-900/30'
                  : isReady
                  ? 'border-indigo-100 dark:border-indigo-900/30 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="p-4 sm:p-5 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4 overflow-hidden flex-1">
                  {/* Reorder Grip Handle */}
                  {showControls && !isProcessing && !isReading && !isCompleted && (
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-500 transition-colors">
                      <GripVertical size={20} />
                    </div>
                  )}

                  {/* Thumbnail / Icon Container */}
                  <div className={`flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-500 border relative ${
                    isError
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800'
                      : isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200 dark:border-green-800' 
                      : (isReading || isProcessingFile)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 border-primary-100 dark:border-primary-800'
                      : isReady
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border-indigo-100 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {isError ? (
                      <AlertCircle size={28} className="animate-in fade-in zoom-in duration-300" />
                    ) : isCompleted ? (
                      <CheckCircle2 size={28} className="animate-in zoom-in duration-300" />
                    ) : (isReading || isProcessingFile) ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : isReady ? (
                      <Clock size={24} className="animate-in fade-in zoom-in duration-300" />
                    ) : file.thumbnailLoading ? (
                      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                         <Loader2 size={16} className="text-slate-400 animate-spin" />
                      </div>
                    ) : file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt="PDF Preview" 
                        className="w-full h-full object-cover animate-in fade-in duration-700" 
                      />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold truncate pr-4 ${isError ? 'text-red-600 dark:text-red-400' : isReady ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                        {file.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                        {isCompleted && file.resultSize 
                          ? `${formatBytes(file.size)} → ${formatBytes(file.resultSize)}`
                          : formatBytes(file.size)}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                          isError ? 'bg-red-500' : isReading ? 'bg-primary-400' : isCompleted ? 'bg-green-500' : isReady ? 'bg-indigo-400' : 'bg-primary-500'
                        }`}
                        style={{ width: `${isError ? 100 : isReading ? file.uploadProgress : file.progress || (isCompleted ? 100 : (isReady ? 100 : 0))}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold flex items-center">
                        {isError ? (
                          <span className="text-red-500 flex items-center">
                            <AlertCircle size={10} className="mr-1" />
                            Error Processing
                          </span>
                        ) : isReading ? (
                          <span className="text-primary-500 flex items-center">
                            <ArrowUpCircle size={10} className="mr-1" />
                            Reading File...
                          </span>
                        ) : isProcessingFile ? (
                          <span className="text-primary-500 flex items-center">
                            <Loader2 size={10} className="mr-1 animate-spin" />
                            Processing...
                          </span>
                        ) : isCompleted ? (
                          <span className="text-green-500 flex items-center">
                            <CheckCircle2 size={10} className="mr-1" />
                            Completed
                          </span>
                        ) : isReady ? (
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center animate-pulse">
                            <Clock size={10} className="mr-1" />
                            Ready to Process
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center">
                            <PlusCircle size={10} className="mr-1" />
                            Queued
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] font-bold ${isError ? 'text-red-600' : isCompleted ? 'text-green-600' : isReady ? 'text-indigo-600' : 'text-primary-600'}`}>
                        {isError ? '!' : `${Math.floor(isReading ? file.uploadProgress : (isReady ? 100 : (isCompleted ? 100 : file.progress)))}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center ml-4 space-x-2">
                  {isCompleted && file.resultBlob && onDownload && (
                    <button
                      onClick={() => onDownload(file.resultBlob!, `compressed_${file.name}`)}
                      className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-105 active:scale-95"
                      title="Download Compressed PDF"
                    >
                      <Download size={18} />
                    </button>
                  )}
                  
                  {showControls && onMove && !isProcessing && !isReading && !isCompleted && (
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-0.5">
                      <button
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:text-primary-600 disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                      <button
                        onClick={() => onMove(index, 'down')}
                        disabled={index === files.length - 1}
                        className="p-1 hover:text-primary-600 disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  )}
                  
                  {!isProcessing && !isReading && !isCompleted && (
                    <button
                      onClick={() => onRemove(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Remove File"
                    >
                      <X size={20} />
                    </button>
                  )}
                  
                  {isCompleted && (
                    <button
                      onClick={() => onRemove(file.id)}
                      className="p-2 text-slate-300 hover:text-slate-500 transition-all"
                      title="Clear Result"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
