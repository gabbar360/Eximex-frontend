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
    <div className="space-y-6">
      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Company Name
          </p>
          <p className="text-slate-800 font-medium">
            {companyData?.name || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
          <p className="text-slate-800 font-medium">
            {companyData?.email || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Phone</p>
          <p className="text-slate-800 font-medium">
            {companyData?.phoneNo || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">GST Number</p>
          <p className="text-slate-800 font-medium">
            {companyData?.gstNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">IEC Number</p>
          <p className="text-slate-800 font-medium">
            {companyData?.iecNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Bank Name</p>
          <p className="text-slate-800 font-medium">
            {companyData?.bankName || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Account Number
          </p>
          <p className="text-slate-800 font-medium">
            {companyData?.accountNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">IFSC Code</p>
          <p className="text-slate-800 font-medium">
            {companyData?.ifscCode || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">SWIFT Code</p>
          <p className="text-slate-800 font-medium">
            {companyData?.swiftCode || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Bank Address
          </p>
          <p className="text-slate-800 font-medium">
            {companyData?.bankAddress || 'N/A'}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500 mb-1">
            Company Address
          </p>
          <p className="text-slate-800 font-medium">
            {companyData?.address || 'N/A'}
          </p>
        </div>
      </div>

      {/* Company Signature */}
      {companyData?.signature && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
            Company Signature
          </h4>
          <Image
            src={
              companyData.signature.startsWith('http')
                ? companyData.signature
                : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${companyData.signature}`
            }
            alt="Company Signature"
            className="max-w-xs h-auto border border-gray-200 rounded-lg"
            preview={{
              mask: (
                <EyeOutlined style={{ fontSize: '16px', color: 'white' }} />
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}
