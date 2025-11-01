import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PageBreadCrumb from '../components/common/PageBreadCrumb';

interface Payment {
  id: number;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: string;
  piInvoice?: {
    piNumber: string;
    totalAmount: number;
    advanceAmount: number;
  };
  party?: { companyName: string };
}

const PaymentTracking: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [duePayments, setDuePayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayments();
    loadDuePayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
// TODO: Convert to Redux action - getPayments();
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Payment error:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDuePayments = async () => {
    try {
// TODO: Convert to Redux action - getDuePayments();
      setDuePayments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load due payments');
      setDuePayments([]);
    }
  };

  const updatePaymentStatus = async (id: number, status: string) => {
    try {
// TODO: Convert to Redux action - updatePaymentStatus(id, status);
      toast.success('Payment status updated');
      loadPayments();
      loadDuePayments();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageBreadCrumb pageName="Payment Tracking" />

      {duePayments.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Overdue Payments ({duePayments.length})
          </h3>
          <div className="space-y-2">
            {duePayments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="text-sm text-red-700">
                {payment.piInvoice?.piNumber} - {payment.party?.companyName} - ₹
                {payment.dueAmount}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">All Payments</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  PI Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Advance Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm font-medium">
                      {payment.piInvoice?.piNumber}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payment.party?.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ₹{payment.piInvoice?.advanceAmount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      ₹
                      {payment.amount - (payment.piInvoice?.advanceAmount || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(payment.status === 'pending' ||
                        payment.status === 'PENDING') && (
                        <button
                          onClick={() =>
                            updatePaymentStatus(payment.id, 'paid')
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No payments found. Create a PI Invoice to generate payment
                    records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
