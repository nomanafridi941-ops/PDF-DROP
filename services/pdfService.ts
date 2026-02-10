import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { CompressionLevel } from '../types';

// Use the legacy worker build which avoids top-level await
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.js';

/**
 * Generates a thumbnail image (base64) for the first page of a PDF file.
 */
export async function generateThumbnail(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  // Get the first page
  const page = await pdf.getPage(1);
  const scale = 0.4;
  const viewport = page.getViewport({ scale });

  // Prepare canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page into canvas context
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  await page.render(renderContext).promise;

  return canvas.toDataURL();
}

/**
 * Merges multiple PDF files into one.
 * Reports progress per file processed with internal steps for better visual feedback.
 */
export async function mergePDFs(
  files: File[], 
  onFileProgress?: (index: number, progress: number) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    if (onFileProgress) onFileProgress(i, 10); // Starting
    
    const file = files[i];
    const fileArrayBuffer = await file.arrayBuffer();
    if (onFileProgress) onFileProgress(i, 40); // Loaded buffer
    
    const pdf = await PDFDocument.load(fileArrayBuffer);
    if (onFileProgress) onFileProgress(i, 70); // Loaded PDF
    
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    
    if (onFileProgress) {
      onFileProgress(i, 100); // Finished this file
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Optimizes a PDF file to reduce size.
 * Uses multiple steps to provide a smooth progress experience.
 */
export async function compressPDF(
  file: File,
  onProgress?: (progress: number) => void,
  level: CompressionLevel = 'medium'
): Promise<Blob> {
  if (onProgress) onProgress(5); 
  
  const fileArrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(25); 
  
  const pdfDoc = await PDFDocument.load(fileArrayBuffer);
  if (onProgress) onProgress(50); 
  
  // Apply compression logic based on level
  if (level === 'high') {
    // For high compression, we strip metadata to save extra bytes
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
  }

  // Define optimization settings based on level
  // Note: pdf-lib's compression primarily relies on object streams and stripping unused resources.
  // We use object streams for all levels to ensure some compression, but low level avoids metadata updates.
  const saveConfig = {
    useObjectStreams: true, 
    addDefaultPage: false,
    updateMetadata: level !== 'high', 
  };

  const pdfBytes = await pdfDoc.save(saveConfig);

  if (onProgress) onProgress(100); 
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Helper to format bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
