import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faChartBar,
  faUsers,
  faBuilding,
  faDownload,
  faSearch,
  faFilter,
  faCalendarAlt,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faDollarSign,
  faFileInvoice,
  faBox,
  faShoppingCart,
  faHistory,
  faFilePdf,
  faFileCsv
} from '@fortawesome/free-solid-svg-icons';

interface ActivityReport {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  documentType: string;
  documentId: string;
  documentName: string;
  timestamp: string;
  ipAddress: string;
}

interface CompanyUsage {
  companyId: string;
  companyName: string;
  month: string;
  piInvoices: number;
  orders: number;
  products: number;
  parties: number;
  totalDocuments: number;
  planType: string;
}

interface RevenueReport {
  companyId: string;
  companyName: string;
  planType: string;
  monthlyRevenue: number;
  yearlyRevenue: number;
  subscriptionStatus: string;
  lastPayment: string;
}

interface UserActivity {
  userId: string;
  userName: string;
  email: string;
  companyName: string;
  loginCount: number;
  documentsCreated: number;
  documentsEdited: number;
  documentsDeleted: number;
  lastActivity: string;
}

const AuditReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activity-reports');
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [companyUsage, setCompanyUsage] = useState<CompanyUsage[]>([]);
  const [revenueReports, setRevenueReports] = useState<RevenueReport[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    // Mock data - replace with actual API calls
    setActivityReports([
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        companyName: 'ABC Corp',
        action: 'CREATE',
        documentType: 'PI Invoice',
        documentId: 'PI001',
        documentName: 'Proforma Invoice #PI001',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        companyName: 'XYZ Ltd',
        action: 'UPDATE',
        documentType: 'Order',
        documentId: 'ORD001',
        documentName: 'Export Order #ORD001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: '10.0.0.50'
      }
    ]);

    setCompanyUsage([
      {
        companyId: 'comp1',
        companyName: 'ABC Corp',
        month: '2024-01',
        piInvoices: 25,
        orders: 18,
        products: 45,
        parties: 12,
        totalDocuments: 100,
        planType: 'Premium'
      },
      {
        companyId: 'comp2',
        companyName: 'XYZ Ltd',
        month: '2024-01',
        piInvoices: 15,
        orders: 10,
        products: 30,
        parties: 8,
        totalDocuments: 63,
        planType: 'Standard'
      }
    ]);

    setRevenueReports([
      {
        companyId: 'comp1',
        companyName: 'ABC Corp',
        planType: 'Premium',
        monthlyRevenue: 99,
        yearlyRevenue: 1188,
        subscriptionStatus: 'Active',
        lastPayment: new Date().toISOString()
      },
      {
        companyId: 'comp2',
        companyName: 'XYZ Ltd',
        planType: 'Standard',
        monthlyRevenue: 49,
        yearlyRevenue: 588,
        subscriptionStatus: 'Active',
        lastPayment: new Date(Date.now() - 86400000).toISOString()
      }
    ]);

    setUserActivity([
      {
        userId: 'user1',
        userName: 'John Doe',
        email: 'john@abccorp.com',
        companyName: 'ABC Corp',
        loginCount: 45,
        documentsCreated: 25,
        documentsEdited: 18,
        documentsDeleted: 2,
        lastActivity: new Date().toISOString()
      },
      {
        userId: 'user2',
        userName: 'Jane Smith',
        email: 'jane@xyzltd.com',
        companyName: 'XYZ Ltd',
        loginCount: 32,
        documentsCreated: 15,
        documentsEdited: 12,
        documentsDeleted: 1,
        lastActivity: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  };

  const exportReport = (type: string, format: 'csv' | 'pdf') => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'activity-reports':
        data = activityReports;
        filename = `activity_report.${format}`;
        break;
      case 'company-usage':
        data = companyUsage;
        filename = `company_usage_report.${format}`;
        break;
      case 'revenue-reports':
        data = revenueReports;
        filename = `revenue_report.${format}`;
        break;
      case 'user-activity':
        data = userActivity;
        filename = `user_activity_report.${format}`;
        break;
    }
    
    if (format === 'csv' && data.length > 0) {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    toast.success(`${format.toUpperCase()} report exported successfully`);
  };

  const renderActivityReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Reports</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
            />
          </div>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Documents</option>
            <option value="PI Invoice">PI Invoice</option>
            <option value="Order">Order</option>
            <option value="Product">Product</option>
            <option value="Party">Party</option>
          </select>
          <button
            onClick={() => exportReport('activity-reports', 'csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
            CSV
          </button>
          <button
            onClick={() => exportReport('activity-reports', 'pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {activityReports.filter(report => 
                report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.companyName.toLowerCase().includes(searchTerm.toLowerCase())
              ).filter(report => 
                !selectedDocumentType || report.documentType === selectedDocumentType
              ).map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{report.userName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{report.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.action === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      report.action === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      <FontAwesomeIcon 
                        icon={report.action === 'CREATE' ? faPlus : report.action === 'UPDATE' ? faEdit : faTrash} 
                        className="mr-1" 
                      />
                      {report.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{report.documentName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{report.documentType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{report.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCompanyUsage = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Usage Reports</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="month"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => exportReport('company-usage', 'csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
            CSV
          </button>
          <button
            onClick={() => exportReport('company-usage', 'pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyUsage.map((usage) => (
          <div key={usage.companyId} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{usage.companyName}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                usage.planType === 'Premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                usage.planType === 'Standard' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {usage.planType}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">PI Invoices</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{usage.piInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{usage.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Products</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{usage.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Parties</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{usage.parties}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Total Documents</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{usage.totalDocuments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRevenueReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Reports</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportReport('revenue-reports', 'csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
            CSV
          </button>
          <button
            onClick={() => exportReport('revenue-reports', 'pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Yearly Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {revenueReports.map((report) => (
                <tr key={report.companyId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{report.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.planType === 'Premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {report.planType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ${report.monthlyRevenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ${report.yearlyRevenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.subscriptionStatus === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {report.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(report.lastPayment).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserActivity = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Activity Summary</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => exportReport('user-activity', 'csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
            CSV
          </button>
          <button
            onClick={() => exportReport('user-activity', 'pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Edited</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deleted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userActivity.filter(user => 
                user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.userName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.loginCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{user.documentsCreated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">{user.documentsEdited}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">{user.documentsDeleted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(user.lastActivity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'activity-reports', label: 'Activity Reports', icon: faHistory },
    { id: 'company-usage', label: 'Company Usage', icon: faBuilding },
    { id: 'revenue-reports', label: 'Revenue Reports', icon: faDollarSign },
    { id: 'user-activity', label: 'User Activity', icon: faUsers }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <FontAwesomeIcon icon={faFileAlt} className="mr-3 text-blue-600" />
            Audit & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive reporting and analytics for system activities and business metrics
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === 'activity-reports' && renderActivityReports()}
          {activeTab === 'company-usage' && renderCompanyUsage()}
          {activeTab === 'revenue-reports' && renderRevenueReports()}
          {activeTab === 'user-activity' && renderUserActivity()}
        </div>
      </div>
    </div>
  );
};

export default AuditReports;