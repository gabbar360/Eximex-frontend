import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { uploadSignature } from '../service/company';

interface SignatureUploadProps {
  companyId: number;
  currentSignature?: string;
  onUploadSuccess?: (signatureUrl: string) => void;
}

export default function SignatureUpload({
  companyId,
  currentSignature,
  onUploadSuccess,
}: SignatureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentSignature || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload signature
    setIsUploading(true);
    try {
      const result = await uploadSignature(companyId, file);
      toast.success(result.message || 'Signature uploaded successfully');
      onUploadSuccess?.(result.data.signature);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload signature');
      setPreview(currentSignature || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={
                preview.startsWith('http') || preview.startsWith('data:')
                  ? preview
                  : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${preview}`
              }
              alt="Signature"
              className="w-32 h-16 rounded-lg object-contain border border-gray-200 bg-white"
            />
          ) : (
            <div className="w-32 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : preview ? 'Change Signature' : 'Upload Signature'}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Upload signature image (max 2MB)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}