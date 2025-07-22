import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Upload, FileText, CheckCircle, AlertCircle, File, Image, FileCode, FileAudio, FileVideo, Download } from 'lucide-react';

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, data: string, type: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...fileArray]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    // Process files and convert to base64 for storage
    const processFiles = async () => {
      const newUploadedFiles = await Promise.all(
        files.map(async (file) => {
          return new Promise<{name: string, data: string, type: string}>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                data: e.target?.result as string,
                type: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      setFiles([]);
      setUploading(false);
    };
    
    // Simulate upload delay
    setTimeout(() => {
      processFiles();
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-purple-600 mr-2" />;
      case 'audio':
        return <FileAudio className="h-5 w-5 text-purple-600 mr-2" />;
      case 'video':
        return <FileVideo className="h-5 w-5 text-purple-600 mr-2" />;
      case 'text':
        if (file.name.endsWith('.pgn')) {
          return <FileText className="h-5 w-5 text-purple-600 mr-2" />;
        }
        return <FileCode className="h-5 w-5 text-purple-600 mr-2" />;
      default:
        if (file.name.endsWith('.pgn')) {
          return <FileText className="h-5 w-5 text-purple-600 mr-2" />;
        }
        return <File className="h-5 w-5 text-purple-600 mr-2" />;
    }
  };

  const downloadFile = (file: {name: string, data: string, type: string}) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
            <p className="text-gray-600">Upload your chess game files in PGN format or any other files for storage and analysis.</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-purple-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">All file types supported</p>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  multiple
                />
              </label>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}
            </div>
            
            {files.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Selected Files</h2>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-md">
                      <div className="flex items-center">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4">
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                </div>
              </div>
            )}
            
            {uploadedFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Uploaded Files</h2>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                      <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-sm font-medium">{file.name}</p>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;