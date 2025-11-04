import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShield,
  faKey,
  faLock,
  faEye,
  faEyeSlash,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faDownload,
  faToggleOn,
  faToggleOff,
  faCopy,
  faRefresh,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faGlobe,
  faBan,
  faUserShield,
  faHistory,
  faCog
} from '@fortawesome/free-solid-svg-icons';

interface LoginAttempt {
  id: string;
  userId: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  timestamp: string;
  location?: string;
}

interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  preventReuse: number;
}

interface IpRule {
  id: string;
  ipAddress: string;
  type: 'whitelist' | 'blacklist';
  description: string;
  isActive: boolean;
  createdAt: string;
}

const SecurityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login-attempts');
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    preventReuse: 5
  });
  const [ipRules, setIpRules] = useState<IpRule[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showIpRuleModal, setShowIpRuleModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] as string[] });
  const [newIpRule, setNewIpRule] = useState({ ipAddress: '', type: 'whitelist' as 'whitelist' | 'blacklist', description: '' });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    // Mock data - replace with actual API calls
    setLoginAttempts([
      {
        id: '1',
        userId: 'user1',
        username: 'admin@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        timestamp: new Date().toISOString(),
        location: 'Mumbai, India'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'user@example.com',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'failed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Delhi, India'
      }
    ]);

    setAuditLogs([
      {
        id: '1',
        userId: 'user1',
        username: 'admin@example.com',
        action: 'CREATE',
        resource: 'User',
        details: 'Created new user: john@example.com',
        ipAddress: '192.168.1.100',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'user1',
        username: 'admin@example.com',
        action: 'UPDATE',
        resource: 'Company',
        details: 'Updated company profile for ABC Corp',
        ipAddress: '192.168.1.100',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ]);

    setApiKeys([
      {
        id: '1',
        name: 'Mobile App API',
        key: 'sk_live_51H7...',
        permissions: ['read:users', 'write:orders'],
        isActive: true,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString()
      }
    ]);

    setIpRules([
      {
        id: '1',
        ipAddress: '192.168.1.0/24',
        type: 'whitelist',
        description: 'Office Network',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        ipAddress: '10.0.0.100',
        type: 'blacklist',
        description: 'Suspicious Activity',
        isActive: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  };

  const generateApiKey = () => {
    const key = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const apiKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key,
      permissions: newApiKey.permissions,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey({ name: '', permissions: [] });
    setShowApiKeyModal(false);
    toast.success('API Key generated successfully');
  };

  const addIpRule = () => {
    const rule: IpRule = {
      id: Date.now().toString(),
      ipAddress: newIpRule.ipAddress,
      type: newIpRule.type,
      description: newIpRule.description,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setIpRules([...ipRules, rule]);
    setNewIpRule({ ipAddress: '', type: 'whitelist', description: '' });
    setShowIpRuleModal(false);
    toast.success('IP Rule added successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'login-attempts':
        data = loginAttempts;
        filename = 'login_attempts.csv';
        break;
      case 'audit-logs':
        data = auditLogs;
        filename = 'audit_logs.csv';
        break;
    }
    
    if (data.length > 0) {
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
      toast.success('Data exported successfully');
    }
  };

  const renderLoginAttempts = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Login Attempts</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search attempts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => exportData('login-attempts')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loginAttempts.filter(attempt => 
                attempt.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attempt.ipAddress.includes(searchTerm)
              ).map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{attempt.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{attempt.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attempt.status === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      <FontAwesomeIcon 
                        icon={attempt.status === 'success' ? faCheckCircle : faTimesCircle} 
                        className="mr-1" 
                      />
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{attempt.location || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(attempt.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => exportData('audit-logs')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.filter(log => 
                log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.resource.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{log.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{log.resource}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Generate API Key
        </button>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-mono">
                    {apiKey.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission) => (
                    <span key={permission} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                  {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updatedKeys = apiKeys.map(key => 
                      key.id === apiKey.id ? { ...key, isActive: !key.isActive } : key
                    );
                    setApiKeys(updatedKeys);
                  }}
                  className={`p-2 rounded ${apiKey.isActive ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <FontAwesomeIcon icon={apiKey.isActive ? faToggleOn : faToggleOff} size="lg" />
                </button>
                <button
                  onClick={() => {
                    setApiKeys(apiKeys.filter(key => key.id !== apiKey.id));
                    toast.success('API Key deleted');
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPasswordPolicy = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password Policy</h3>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              value={passwordPolicy.minLength}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, minLength: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password Max Age (days)
            </label>
            <input
              type="number"
              value={passwordPolicy.maxAge}
              onChange={(e) => setPasswordPolicy({...passwordPolicy, maxAge: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Requirements
            </label>
            <div className="space-y-3">
              {[
                { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                { key: 'requireNumbers', label: 'Require Numbers' },
                { key: 'requireSpecialChars', label: 'Require Special Characters' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={passwordPolicy[key as keyof PasswordPolicy] as boolean}
                    onChange={(e) => setPasswordPolicy({...passwordPolicy, [key]: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => toast.success('Password policy updated')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );

  const renderTwoFactor = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Global 2FA Setting</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enable or disable two-factor authentication for all users
            </p>
          </div>
          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled);
              toast.success(`2FA ${!twoFactorEnabled ? 'enabled' : 'disabled'} globally`);
            }}
            className={`p-2 rounded ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}
          >
            <FontAwesomeIcon icon={twoFactorEnabled ? faToggleOn : faToggleOff} size="2x" />
          </button>
        </div>
        
        {twoFactorEnabled && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Two-factor authentication is enabled for all users
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderIpRules = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">IP Whitelist / Blacklist</h3>
        <button
          onClick={() => setShowIpRuleModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add IP Rule
        </button>
      </div>

      <div className="grid gap-4">
        {ipRules.map((rule) => (
          <div key={rule.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-mono">
                    {rule.ipAddress}
                  </code>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.type === 'whitelist' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <FontAwesomeIcon 
                      icon={rule.type === 'whitelist' ? faCheckCircle : faBan} 
                      className="mr-1" 
                    />
                    {rule.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Created: {new Date(rule.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updatedRules = ipRules.map(r => 
                      r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                    );
                    setIpRules(updatedRules);
                  }}
                  className={`p-2 rounded ${rule.isActive ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <FontAwesomeIcon icon={rule.isActive ? faToggleOn : faToggleOff} size="lg" />
                </button>
                <button
                  onClick={() => {
                    setIpRules(ipRules.filter(r => r.id !== rule.id));
                    toast.success('IP Rule deleted');
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'login-attempts', label: 'Login Attempts', icon: faHistory },
    { id: 'audit-logs', label: 'Audit Logs', icon: faEye },
    { id: 'api-keys', label: 'API Keys', icon: faKey },
    { id: 'password-policy', label: 'Password Policy', icon: faLock },
    { id: 'two-factor', label: '2FA Settings', icon: faUserShield },
    { id: 'ip-rules', label: 'IP Rules', icon: faGlobe }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <FontAwesomeIcon icon={faShield} className="mr-3 text-blue-600" />
            Security & Access Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor security events, manage access controls, and configure security policies
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
          {activeTab === 'login-attempts' && renderLoginAttempts()}
          {activeTab === 'audit-logs' && renderAuditLogs()}
          {activeTab === 'api-keys' && renderApiKeys()}
          {activeTab === 'password-policy' && renderPasswordPolicy()}
          {activeTab === 'two-factor' && renderTwoFactor()}
          {activeTab === 'ip-rules' && renderIpRules()}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter key name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['read:users', 'write:users', 'read:orders', 'write:orders', 'read:companies', 'write:companies'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newApiKey.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKey({...newApiKey, permissions: [...newApiKey.permissions, permission]});
                          } else {
                            setNewApiKey({...newApiKey, permissions: newApiKey.permissions.filter(p => p !== permission)});
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={generateApiKey}
                disabled={!newApiKey.name || newApiKey.permissions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IP Rule Modal */}
      {showIpRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add IP Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IP Address / CIDR
                </label>
                <input
                  type="text"
                  value={newIpRule.ipAddress}
                  onChange={(e) => setNewIpRule({...newIpRule, ipAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="192.168.1.0/24 or 10.0.0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rule Type
                </label>
                <select
                  value={newIpRule.type}
                  onChange={(e) => setNewIpRule({...newIpRule, type: e.target.value as 'whitelist' | 'blacklist'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="whitelist">Whitelist (Allow)</option>
                  <option value="blacklist">Blacklist (Block)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newIpRule.description}
                  onChange={(e) => setNewIpRule({...newIpRule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowIpRuleModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addIpRule}
                disabled={!newIpRule.ipAddress || !newIpRule.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityManagement;