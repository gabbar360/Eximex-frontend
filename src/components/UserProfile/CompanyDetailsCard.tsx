import { Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface CompanyData {
  id: number;
  name: string;
  logo?: string;
  signature?: string;
  address?: string;
  phoneNo?: string;
  email?: string;
  gstNumber?: string;
  iecNumber?: string;
  currencies?: string[];
  defaultCurrency?: string;
  allowedUnits?: string[];
  bankName?: string;
  bankAddress?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
  isActive?: boolean;
  planId?: string;
}

interface CompanyDetailsCardProps {
  companyData: CompanyData | null;
}

export default function CompanyDetailsCard({
  companyData,
}: CompanyDetailsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company Name
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.name || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Email Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.email || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Phone Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.phoneNo || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          GST Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.gstNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          IEC Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.iecNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Bank Name
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.bankName || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Account Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.accountNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          IFSC Code
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.ifscCode || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          SWIFT Code
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.swiftCode || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Bank Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.bankAddress || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.address || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company Signature
        </p>
        {companyData?.signature ? (
          <div className="mt-2">
            <Image
              src={companyData.signature.startsWith('http') ? companyData.signature : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${companyData.signature}`}
              alt="Company Signature"
              className="max-w-xs h-auto border border-gray-200 rounded-lg"
              preview={{
                mask: (
                  <EyeOutlined
                    style={{ fontSize: '20px', color: 'white' }}
                  />
                ),
              }}
            />
          </div>
        ) : (
          <p className="text-lg font-bold text-slate-800">Not Available</p>
        )}
      </div>
    </div>
  );
}