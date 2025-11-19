import React from 'react';
import { Upload, Download, RefreshCcw, Image as ImageIcon, X } from 'lucide-react';

export const UploadIcon = () => <Upload className="w-8 h-8 text-gray-400 mb-2" />;
export const DownloadIcon = () => <Download className="w-4 h-4 mr-2" />;
export const ResetIcon = () => <RefreshCcw className="w-4 h-4 mr-2" />;
export const ImageIconSmall = () => <ImageIcon className="w-4 h-4 mr-2" />;
export const CloseIcon = () => <X className="w-5 h-5" />;