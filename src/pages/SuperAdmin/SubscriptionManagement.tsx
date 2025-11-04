import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faPlus,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faCrown,
  faCalendarAlt,
  faDollarSign,
  faUsers,
  faFileAlt,
  faHdd,
  faGift,
  faPercent,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'FREE' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
  billing: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  price: number;
  currency: string;
  limits: {
    users: number;
    documents: number;
    storage: number; // in GB
  };
  features: string[];
  isActive: boolean;
  createdAt: string;
}

interface Subscription {
  id: number;
  companyId: number;
  companyName: string;
  planId: number;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentGateway: 'STRIPE' | 'RAZORPAY' | 'PAYU';
  nextBillingDate?: string;
}

interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

const SubscriptionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setPlans([
      {
        id: 1,
        name: 'Free Plan',
        type: 'FREE',
        billing: 'MONTHLY',
        price: 0,
        currency: 'USD',
        limits: { users: 2, documents: 50, storage: 1 },
        features: ['Basic Features', 'Email Support'],
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        name: 'Pro Plan',
        type: 'PRO',
        billing: 'MONTHLY',
        price: 29,
        currency: 'USD',
        limits: { users: 10, documents: 500, storage: 10 },
        features: ['All Features', 'Priority Support', 'Advanced Analytics'],
        isActive: true,
        createdAt: '2024-01-01'
      }
    ]);

    setSubscriptions([
      {
        id: 1,
        companyId: 1,
        companyName: 'Acme Corp',
        planId: 2,
        planName: 'Pro Plan',
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        amount: 29,
        currency: 'USD',
        paymentGateway: 'STRIPE',
        nextBillingDate: '2024-02-01'
      }
    ]);

    setCoupons([
      {
        id: 1,
        code: 'WELCOME20',
        type: 'PERCENTAGE',
        value: 20,
        maxUses: 100,
        usedCount: 25,
        expiryDate: '2024-12-31',
        isActive: true
      }
    ]);

    setLoading(false);
  }, []);

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.name}
            </h3>
            {plan.type === 'PRO' && (
              <FontAwesomeIcon icon={faCrown} className="ml-2 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${plan.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              /{plan.billing.toLowerCase()}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            plan.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Users:
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center">
            <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
            Documents:
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            {plan.limits.documents === -1 ? 'Unlimited' : plan.limits.documents}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center">
            <FontAwesomeIcon icon={faHdd} className="mr-2" />
            Storage:
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage} GB`}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View
        </button>
        <button className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {subscription.companyName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subscription.planName}
          </p>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
            subscription.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : subscription.status === 'TRIAL'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {subscription.status}
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${subscription.amount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {subscription.paymentGateway}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
          <span className="text-gray-900 dark:text-white">
            {new Date(subscription.startDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">End Date:</span>
          <span className="text-gray-900 dark:text-white">
            {new Date(subscription.endDate).toLocaleDateString()}
          </span>
        </div>
        {subscription.nextBillingDate && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Next Billing:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View Details
        </button>
        <button className="flex items-center justify-center px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
          <FontAwesomeIcon icon={faEdit} />
        </button>
      </div>
    </div>
  );

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {coupon.code}
          </h3>
          <div className="flex items-center mb-2">
            <FontAwesomeIcon 
              icon={coupon.type === 'PERCENTAGE' ? faPercent : faDollarSign} 
              className="mr-1 text-green-500" 
            />
            <span className="text-lg font-bold text-green-600">
              {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {coupon.type === 'PERCENTAGE' ? 'off' : 'discount'}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            coupon.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {coupon.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Usage:</span>
          <span className="text-gray-900 dark:text-white">
            {coupon.usedCount} / {coupon.maxUses}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Expires:</span>
          <span className="text-gray-900 dark:text-white">
            {new Date(coupon.expiryDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          View
        </button>
        <button className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                Subscription & Billing Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage subscription plans, billing, coupons and payment integrations
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                <span className="whitespace-nowrap">
                  Add {activeTab === 'plans' ? 'Plan' : activeTab === 'subscriptions' ? 'Subscription' : 'Coupon'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 border-b border-gray-200 dark:border-gray-700 min-w-max">
              {[
                { id: 'plans', label: 'Subscription Plans', icon: faCreditCard },
                { id: 'subscriptions', label: 'Active Subscriptions', icon: faCheckCircle },
                { id: 'billing', label: 'Billing History', icon: faFileAlt },
                { id: 'coupons', label: 'Coupons & Offers', icon: faGift }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Billing History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Billing history functionality coming soon...
            </p>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;