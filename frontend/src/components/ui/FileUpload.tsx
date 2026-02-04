import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, File, FileText, Image, FileSpreadsheet } from 'lucide-react';
import clsx from 'clsx';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

const fileIcons: Record<string, typeof File> = {
  'application/pdf': FileText,
  'image/': Image,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'text/csv': FileSpreadsheet,
};

function getFileIcon(type: string) {
  for (const [key, Icon] of Object.entries(fileIcons)) {
    if (type.startsWith(key)) return Icon;
  }
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onUpload,
  accept = '*',
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = async (newFiles: File[]) => {
    const validFiles: File[] = [];

    for (const file of newFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        alert(`Máximo ${maxFiles} archivos permitidos`);
        break;
      }

      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} excede el tamaño máximo de ${maxSize}MB`);
        continue;
      }

      validFiles.push(file);
    }

    const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);

    try {
      await onUpload(validFiles);
      setFiles((prev) =>
        prev.map((f) =>
          uploadedFiles.some((uf) => uf.id === f.id)
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          uploadedFiles.some((uf) => uf.id === f.id)
            ? { ...f, status: 'error' as const, error: 'Error al subir archivo' }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-gray-300 hover:border-accent hover:bg-gray-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <Upload className={clsx(
          'h-10 w-10 mx-auto mb-3',
          isDragging ? 'text-accent' : 'text-gray-400'
        )} />

        <p className="text-sm font-medium text-gray-700">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Máximo {maxSize}MB por archivo • {maxFiles} archivos máximo
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadedFile) => {
            const FileIcon = getFileIcon(uploadedFile.file.type);

            return (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>

                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}

                  {uploadedFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadedFile.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
