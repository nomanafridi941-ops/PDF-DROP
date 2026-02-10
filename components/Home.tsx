
import React, { useState } from 'react';
import { 
  Minimize2, 
  Layers, 
  Download, 
  RefreshCcw, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Globe,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Cpu,
  ZapOff,
  Gauge,
  FileStack,
  CheckCircle2
} from 'lucide-react';
import { ToolType, FileWithMeta, ProcessingResult, FileStatus, CompressionLevel } from '../types';
import Dropzone from './Dropzone';
import FileList from './FileList';
import { compressPDF, mergePDFs, formatBytes, generateThumbnail } from '../services/pdfService';

const Home: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('compress');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState(0);

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    setFiles([]);
    setResult(null);
    setError(null);
    setGlobalProgress(0);
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const formatted: FileWithMeta[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'reading',
      progress: 0,
      uploadProgress: 0,
      thumbnailLoading: true
    }));

    setFiles(prev => [...prev, ...formatted]);
    setResult(null);

    formatted.forEach(async (item) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === item.id ? { ...f, status: 'ready' as FileStatus, uploadProgress: 100 } : f
          ));
          
          generateThumbnail(item.file).then(thumb => {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, thumbnailUrl: thumb, thumbnailLoading: false } : f));
          }).catch(() => {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, thumbnailLoading: false } : f));
          });
        }
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, uploadProgress: currentProgress } : f));
      }, 100);
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResult(null);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(startIndex, 1);
    newFiles.splice(endIndex, 0, removed);
    setFiles(newFiles);
  };

  const updateFileResult = (id: string, progress: number, blob?: Blob) => {
    setFiles(prev => prev.map(f => f.id === id ? { 
      ...f, 
      progress, 
      status: progress === 100 ? 'completed' : 'processing',
      resultBlob: blob || f.resultBlob,
      resultSize: blob ? blob.size : f.resultSize
    } : f));
    
    setFiles(currentFiles => {
      const total = currentFiles.length * 100;
      const current = currentFiles.reduce((acc, f) => acc + (f.progress || 0), 0);
      setGlobalProgress(Math.floor((current / total) * 100));
      return currentFiles;
    });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setGlobalProgress(0);
    
    setFiles(prev => prev.map(f => ({ ...f, progress: 0, status: 'processing' as FileStatus })));

    try {
      if (activeTool === 'compress') {
        for (const fileMeta of files) {
          const compressedBlob = await compressPDF(fileMeta.file, (p) => {
            updateFileResult(fileMeta.id, p);
          }, compressionLevel);
          updateFileResult(fileMeta.id, 100, compressedBlob);
        }

        if (files.length === 1) {
          const lastBlob = await compressPDF(files[0].file, undefined, compressionLevel); 
          setResult({
            blob: lastBlob,
            name: `compressed_${files[0].name}`,
            originalSize: files[0].size,
            newSize: lastBlob.size
          });
        } else {
          setResult({
            blob: new Blob(), 
            name: 'Multiple Files',
            originalSize: files.reduce((a, b) => a + b.size, 0),
            newSize: 0 
          });
        }
      } else {
        const mergedBlob = await mergePDFs(
          files.map(f => f.file),
          (index, p) => {
            updateFileResult(files[index].id, p);
          }
        );
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        setResult({
          blob: mergedBlob,
          name: 'merged_documents.pdf',
          originalSize: totalSize,
          newSize: mergedBlob.size
        });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during processing. Please try again with a non-protected file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (blob?: Blob, name?: string) => {
    const targetBlob = blob || result?.blob;
    const targetName = name || result?.name;
    
    if (!targetBlob || !targetName) return;
    
    const url = URL.createObjectURL(targetBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (activeTool === 'merge' && result) {
      handleDownload();
    } else {
      files.forEach(f => {
        if (f.resultBlob) {
          handleDownload(f.resultBlob, `compressed_${f.name}`);
        }
      });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setGlobalProgress(0);
  };

  const allFilesReady = files.length > 0 && files.every(f => f.status !== 'reading');
  const processingCount = files.filter(f => f.status === 'processing').length;
  const completedCount = files.filter(f => f.status === 'completed').length;

  const levels = [
    { 
      id: 'low', 
      label: 'Low', 
      desc: 'High quality, minimal reduction', 
      icon: <ZapOff size={18} />, 
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50',
      darkActiveBg: 'dark:bg-blue-900/20',
      activeRing: 'ring-blue-500/20',
      iconBg: 'bg-blue-500',
      activeText: 'text-blue-600',
      darkActiveText: 'dark:text-blue-400',
      barColor: 'bg-blue-500',
      quality: 95,
      reduction: 20
    },
    { 
      id: 'medium', 
      label: 'Medium', 
      desc: 'Good balance of quality & size', 
      icon: <Cpu size={18} />, 
      activeBorder: 'border-primary-500',
      activeBg: 'bg-primary-50',
      darkActiveBg: 'dark:bg-primary-900/20',
      activeRing: 'ring-primary-500/20',
      iconBg: 'bg-primary-500',
      activeText: 'text-primary-600',
      darkActiveText: 'dark:text-primary-400',
      barColor: 'bg-primary-500',
      quality: 75,
      reduction: 50
    },
    { 
      id: 'high', 
      label: 'High', 
      desc: 'Max reduction, lower quality', 
      icon: <Gauge size={18} />, 
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50',
      darkActiveBg: 'dark:bg-purple-900/20',
      activeRing: 'ring-purple-500/20',
      iconBg: 'bg-purple-500',
      activeText: 'text-purple-600',
      darkActiveText: 'dark:text-purple-400',
      barColor: 'bg-purple-500',
      quality: 50,
      reduction: 80
    }
  ] as const;

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Compress & Merge PDF Files Online
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Professional PDF tools that work 100% in your browser. Fast, secure, and no sign-up required. Reduce file size and combine documents instantly.
          </p>
        </div>

        {/* Tool Selection */}
        <div className="mt-10 max-w-xl mx-auto">
          <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <button
              disabled={isProcessing}
              onClick={() => handleToolChange('compress')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                activeTool === 'compress' 
                  ? 'bg-white dark:bg-slate-800 shadow-xl text-primary-600' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Minimize2 size={20} className="mr-2" />
              Compress PDF
            </button>
            <button
              disabled={isProcessing}
              onClick={() => handleToolChange('merge')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                activeTool === 'merge' 
                  ? 'bg-white dark:bg-slate-800 shadow-xl text-primary-600' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Layers size={20} className="mr-2" />
              Merge PDF
            </button>
          </div>
        </div>
      </section>

      {/* Upload & Processing Area */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {!result ? (
            <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm transition-all relative overflow-hidden">
              
              {/* Global Processing Progress Bar */}
              {isProcessing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${globalProgress}%` }}
                  />
                </div>
              )}

              {activeTool === 'compress' && files.length > 0 && !isProcessing && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Gauge size={14} className="mr-2" />
                    Compression Strategy
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setCompressionLevel(level.id as CompressionLevel)}
                        className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden ${
                          compressionLevel === level.id
                            ? `${level.activeBorder} ${level.activeBg} ${level.darkActiveBg} shadow-lg ring-1 ${level.activeRing}`
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex w-full items-start justify-between mb-3 relative z-10">
                          <div className={`p-2 rounded-lg ${
                            compressionLevel === level.id
                              ? `${level.iconBg} text-white`
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {level.icon}
                          </div>
                          {compressionLevel === level.id && (
                            <div className={`p-1 rounded-full ${level.iconBg} text-white`}>
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>
                        
                        <div className="relative z-10 w-full">
                          <span className={`font-bold block mb-1 text-base ${
                              compressionLevel === level.id ? `${level.activeText} ${level.darkActiveText}` : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {level.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug block mb-3 h-8">
                            {level.desc}
                          </span>

                          {/* Visual Bars */}
                          <div className="w-full space-y-2.5 bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <div>
                              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                                <span>Quality</span>
                                <span>{level.quality}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${level.barColor} opacity-80`} 
                                  style={{ width: `${level.quality}%` }} 
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                                <span>Compression</span>
                                <span>{level.reduction > 20 ? '+' : ''}{level.reduction}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${level.barColor}`} 
                                  style={{ width: `${level.reduction}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isProcessing && (
                <Dropzone 
                  onFilesAdded={handleFilesAdded} 
                  multiple={true} 
                />
              )}
              
              {files.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <FileList 
                    files={files} 
                    onRemove={handleRemoveFile} 
                    onMove={handleMoveFile}
                    onReorder={handleReorder}
                    showControls={true}
                    isProcessing={isProcessing}
                    onDownload={handleDownload}
                  />

                  <div className="mt-10 flex flex-col space-y-4">
                    {/* Queue Status Summary */}
                    <div className="flex flex-wrap items-center gap-4 px-2 text-sm font-bold tracking-tight">
                      <div className="flex items-center text-slate-400">
                        <FileStack size={14} className="mr-1.5" />
                        {files.length} {files.length === 1 ? 'FILE' : 'FILES'} QUEUED
                      </div>
                      {processingCount > 0 && (
                        <div className="flex items-center text-primary-500 animate-pulse">
                          <Loader2 size={14} className="mr-1.5 animate-spin" />
                          PROCESSING {processingCount}
                        </div>
                      )}
                      {completedCount > 0 && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle2 size={14} className="mr-1.5" />
                          {completedCount} COMPLETED
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleProcess}
                        disabled={isProcessing || !allFilesReady || (activeTool === 'merge' && files.length < 2)}
                        className="group relative overflow-hidden flex-1 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={24} className="mr-2 animate-spin" />
                            {globalProgress < 100 ? 'Processing...' : 'Finalizing...'}
                          </>
                        ) : !allFilesReady ? (
                          <>
                            <Loader2 size={24} className="mr-2 animate-spin" />
                            Preparing Files...
                          </>
                        ) : (
                          <>
                            {activeTool === 'compress' ? `Optimize ${files.length} PDF${files.length > 1 ? 's' : ''}` : 'Merge Documents'}
                            <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      {!isProcessing && (
                        <button
                          onClick={handleReset}
                          className="py-4 px-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all border border-slate-200 dark:border-slate-700"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  {activeTool === 'merge' && files.length < 2 && allFilesReady && !isProcessing && (
                    <p className="mt-4 text-xs font-medium text-amber-600 dark:text-amber-500 text-center flex items-center justify-center bg-amber-50 dark:bg-amber-900/10 py-2 rounded-lg">
                      <HelpCircle size={14} className="mr-1.5" />
                      Please select at least two documents to merge.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40 rotate-3 transition-transform hover:rotate-0">
                <FileCheck size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Success!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto">
                {activeTool === 'compress' && files.length > 1 
                  ? `Processed ${files.length} files successfully.`
                  : 'Your PDF has been processed locally in your browser.'}
              </p>

              {activeTool === 'compress' && files.length === 1 && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-1">Before</span>
                    <span className="text-xl font-bold">{formatBytes(result.originalSize)}</span>
                  </div>
                  <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                    <span className="block text-[10px] uppercase text-primary-400 font-bold tracking-widest mb-1">After</span>
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatBytes(result.newSize)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadAll}
                  className="flex-1 sm:flex-initial px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/40 transition-all flex items-center justify-center transform hover:scale-105 active:scale-95"
                >
                  <Download size={24} className="mr-2" />
                  {activeTool === 'compress' && files.length > 1 ? 'Download All' : 'Download PDF'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial px-10 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCcw size={20} className="mr-2" />
                  Do Another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features / Why PDFDrop */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">The most private way to handle PDFs.</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">We process everything locally. Your private documents never touch our servers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 mx-auto rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-100 dark:border-blue-900/30">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-xl font-bold">100% Privacy</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Files stay on your machine. We use WebAssembly to process data directly in your browser tab.</p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 text-purple-600 mx-auto rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/10 border border-purple-100 dark:border-purple-900/30">
                <Zap size={40} />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">No registration and no waiting lines. It's just you and your files, powered by your browser's speed.</p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 mx-auto rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/10 border border-green-100 dark:border-green-900/30">
                <Globe size={40} />
              </div>
              <h3 className="text-xl font-bold">Truly Universal</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Works offline and on any device. Optimized for modern browsers with high-performance JS libraries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content: How To Guides */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Compress Guide */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">How to Compress PDF Files</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Reducing the file size of your PDF documents has never been easier. Follow these simple steps to compress your PDF online without compromising quality.
              </p>
              <ol className="list-decimal list-inside space-y-4 text-slate-600 dark:text-slate-400 marker:font-bold marker:text-primary-600">
                <li className="pl-2">Select the <strong>Compress PDF</strong> tool from the menu above.</li>
                <li className="pl-2">Drag and drop your file into the blue box or click to upload.</li>
                <li className="pl-2">Choose your desired compression level: <strong>Low</strong>, <strong>Medium</strong>, or <strong>High</strong>.</li>
                <li className="pl-2">Click <strong>Optimize</strong> and wait a moment for the process to finish.</li>
                <li className="pl-2">Download your smaller, optimized PDF file instantly.</li>
              </ol>
            </div>
            
            {/* Merge Guide */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">How to Merge Multiple PDFs</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Combine multiple PDF documents into a single file in seconds. Our local browser-based merger ensures your data remains private.
              </p>
              <ol className="list-decimal list-inside space-y-4 text-slate-600 dark:text-slate-400 marker:font-bold marker:text-primary-600">
                <li className="pl-2">Switch to the <strong>Merge PDF</strong> tool.</li>
                <li className="pl-2">Upload all the PDF files you want to combine.</li>
                <li className="pl-2">Drag and drop the files in the list to reorder them as needed.</li>
                <li className="pl-2">Click <strong>Merge Documents</strong> to join them together.</li>
                <li className="pl-2">Save your newly created single PDF document.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed SEO Description */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 space-y-12 text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Use PDFDrop for Your Documents?</h2>
            <p>
              PDFDrop offers a unique approach to online PDF management. Unlike other services that require you to upload your sensitive documents to a remote server, 
              PDFDrop processes your files <strong>entirely within your web browser</strong>. This means your data never leaves your device, ensuring bank-level security and total privacy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Fast & Efficient Compression</h4>
              <p>
                Our advanced compression algorithms analyze your PDF structure to identify redundant data. By optimizing images and fonts, 
                we can significantly reduce file size while maintaining the visual quality you need for printing or sharing online.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Seamless PDF Merging</h4>
              <p>
                Need to submit a single report made of several files? Our merge tool lets you combine receipts, chapters, or invoices into one organized document. 
                The intuitive drag-and-drop interface makes reordering pages effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-16 tracking-tight">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Are my files secure?",
                a: "Yes. PDFDrop never uploads your PDFs to any server. All processing is done locally in your browser's memory using secure client-side technologies."
              },
              {
                q: "Is there a file size limit?",
                a: "The limit is based on your device's memory. We suggest files up to 100MB for optimal performance on most computers and mobile devices."
              },
              {
                q: "How does compression work?",
                a: "We optimize the PDF structure, removes redundant data, and optimizes internal object streams to reduce file size while maintaining readability."
              },
              {
                q: "Can I use PDFDrop on mobile?",
                a: "Absolutely. Our tools are fully responsive and work on iPhone, Android, and tablets directly in your mobile browser without installing any app."
              },
              {
                q: "Is it free to use?",
                a: "Yes, PDFDrop is completely free to use for compressing and merging your PDF files. There are no hidden fees or watermarks added to your documents."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-3">{item.q}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
