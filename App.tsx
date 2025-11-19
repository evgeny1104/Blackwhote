import React, { useState, useRef, useCallback, useEffect } from 'react';
import { readFileAsDataURL, convertToBlackAndWhite } from './utils/imageProcessing';
import { Button } from './components/Button';
import { UploadIcon, DownloadIcon, ResetIcon, ImageIconSmall, CloseIcon } from './components/Icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("image");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (src: string) => {
    setIsProcessing(true);
    setError(null);
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        if (canvasRef.current) {
          const bwDataUrl = convertToBlackAndWhite(img, canvasRef.current);
          setProcessedImage(bwDataUrl);
        }
      } catch (err) {
        console.error(err);
        setError("Ошибка обработки изображения.");
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError("Не удалось загрузить изображение.");
      setIsProcessing(false);
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Пожалуйста, загрузите файл изображения (JPG, PNG).");
      return;
    }

    // Safe file size check (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Файл слишком большой. Максимальный размер 10 МБ.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      setOriginalImage(dataUrl);
      await processImage(dataUrl);
    } catch (err) {
      setError("Ошибка чтения файла.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `${fileName}_bw.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setFileName("image");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-[200px] w-full max-w-2xl mx-auto bg-white text-neutral-900 font-sans">
      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header / Top Bar */}
      <div className="py-3 px-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-neutral-900 rounded-md flex items-center justify-center text-white">
            <span className="text-xs font-bold">bw</span>
          </div>
          <h2 className="text-base font-bold text-neutral-800">ЧБ Фильтр</h2>
        </div>
        {originalImage && (
           <button onClick={handleReset} className="text-gray-400 hover:text-red-500 transition-colors">
             <CloseIcon />
           </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {!originalImage ? (
          /* Upload View */
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-8
              flex flex-col items-center justify-center text-center transition-all duration-200
              ${isDragging ? 'border-neutral-800 bg-neutral-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden" 
            />
            
            <UploadIcon />
            <p className="text-sm font-medium text-neutral-700 mb-1">
              Нажмите или перетащите фото
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG или WebP
            </p>
          </div>
        ) : (
          /* Result View */
          <div className="flex flex-col space-y-4">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
               {!processedImage && isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-900 border-t-transparent"></div>
                 </div>
               )}
               
               {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Black and White" 
                    className="w-full h-full object-contain"
                  />
               ) : (
                 <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain opacity-50"
                  />
               )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <Button onClick={handleDownload} fullWidth disabled={!processedImage}>
                 <DownloadIcon />
                 Скачать результат
               </Button>
               
               <Button variant="outline" onClick={handleReset} fullWidth>
                 <ResetIcon />
                 Загрузить другое
               </Button>
            </div>
            
            <div className="text-center text-xs text-gray-400 pt-2">
              Обработка происходит в вашем браузере. Фото не отправляются на сервер.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;