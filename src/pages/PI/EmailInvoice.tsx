import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getPiInvoiceById } from '../../features/piSlice';

const EmailInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [piData, setPiData] = useState<any>(null);

  useEffect(() => {
    const fetchPIDetails = async () => {
      try {
        const response = await dispatch(getPiInvoiceById(id)).unwrap();
        const data = response.data || response;
        setPiData(data);
        setEmail(data?.email || data?.party?.email || '');
      } catch (error) {
        console.error('Error fetching PI details:', error);
        toast.error('Failed to load invoice details');
      }
    };

    if (id) fetchPIDetails();
  }, [id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      // Add your email sending logic here
      // await dispatch(emailInvoice(id, email)).unwrap();
      toast.success('Invoice sent successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Email Invoice
                </h1>
                <p className="text-sm text-gray-500">
                  Send {piData?.piNumber || 'invoice'} via email
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Invoice Info */}
          {piData && (
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {piData.piNumber || piData.invoiceNumber}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {piData.party?.companyName || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: piData.currency || 'USD',
                    }).format(piData.totalAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(piData.invoiceDate || piData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter recipient email address"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  The invoice PDF will be sent to this email address
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailInvoice;