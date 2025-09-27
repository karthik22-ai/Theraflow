'use client';

import { useState } from 'react';
import { theraFlowAPI } from '@/lib/api';
import Link from 'next/link';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connection test
      addResult('Connection Test', 'Starting...');
      const connectionResult = await theraFlowAPI.testConnection();
      addResult('Connection Test', connectionResult);
      
      // Test 2: Health check
      addResult('Health Check', 'Testing...');
      const healthResult = await theraFlowAPI.checkHealth();
      addResult('Health Check', { success: healthResult, message: healthResult ? 'Backend is healthy' : 'Backend is not responding' });
      
      // Test 3: Manual fetch test
      addResult('Manual Fetch Test', 'Testing direct fetch...');
      try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        addResult('Manual Fetch Test', { success: true, status: response.status, data });
      } catch (error) {
        addResult('Manual Fetch Test', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      
      // Test 4: Chat endpoint test
      addResult('Chat Endpoint Test', 'Testing chat endpoint...');
      try {
        const chatResponse = await theraFlowAPI.sendMessage('Test message from debug page');
        addResult('Chat Endpoint Test', { success: true, response: chatResponse });
      } catch (error) {
        addResult('Chat Endpoint Test', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      
    } catch (error) {
      addResult('General Error', { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">TheraFlow Backend Debug</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={runConnectionTest}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
            </button>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              {testResults.length === 0 ? (
                <p className="text-gray-500">Click "Run Connection Tests" to start debugging</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium text-sm text-gray-600">{result.test}</div>
                      <pre className="text-xs text-gray-800 mt-1 overflow-x-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                      <div className="text-xs text-gray-400 mt-1">{result.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Make sure your Flask backend is running on port 5000</li>
                <li>• Check that you added the /health and /chat endpoints</li>
                <li>• Verify CORS is enabled in your Flask app</li>
                <li>• Check the browser console for detailed error messages</li>
                <li>• Test the backend directly with: curl http://localhost:5000/health</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
