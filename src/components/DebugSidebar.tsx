import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import userPermissionService from '../service/userPermissionService';

const DebugSidebar = () => {
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state: Record<string, unknown>) => state.user.user);
  const { sidebarMenu } = useSelector((state: Record<string, unknown>) => state.userPermission);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userPermissionService.getUserSidebarMenu();
      console.log('Direct API call result:', result);
      setApiResult(result);
    } catch (err) {
      console.error('Direct API call error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role?.name !== 'SUPER_ADMIN') {
      testAPI();
    }
  }, [currentUser]);

  if (currentUser?.role?.name === 'SUPER_ADMIN') {
    return (
      <div className="p-4 bg-green-100">Super Admin - No debug needed</div>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-80 h-screen bg-white border-l p-4 overflow-y-auto z-50">
      <h3 className="font-bold mb-4">Debug Sidebar Menu</h3>

      <div className="mb-4">
        <h4 className="font-semibold">Current User:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Redux Sidebar Menu:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(sidebarMenu, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <button
          onClick={testAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test API Direct'}
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <h4 className="font-semibold text-red-600">API Error:</h4>
          <pre className="text-xs bg-red-100 p-2 rounded">{error}</pre>
        </div>
      )}

      {apiResult && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-600">Direct API Result:</h4>
          <pre className="text-xs bg-green-100 p-2 rounded">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugSidebar;
