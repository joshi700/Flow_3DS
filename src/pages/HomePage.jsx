import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { config, resetTransaction, updateTransaction } = useConfig();
  const [amount, setAmount] = useState('99.00');
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  };

  const handleGenerateOrderId = () => {
    setOrderId(generateId('ORD'));
  };

  const handleGenerateTransactionId = () => {
    setTransactionId(generateId('TXN'));
  };

  const handleStartTest = () => {
    if (!orderId || !transactionId || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Reset and initialize transaction
    resetTransaction();
    updateTransaction({
      orderId,
      transactionId,
      amount,
      status: 'ready',
      currentStep: 0
    });

    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            3DS Payment Testing
          </h1>
          <p className="text-gray-600">
            Start a new 3D Secure authentication flow test
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/settings')}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            ← Back to Settings
          </button>
        </div>

        {/* Configuration Summary */}
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Current Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Merchant ID:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">
                {config.merchantId || 'Not configured'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Currency:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">
                {config.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Gateway:</span>
              <span className="ml-2 font-mono text-xs text-gray-900">
                {config.apiBaseUrl}
              </span>
            </div>
            <div>
              <span className="text-gray-600">API Version:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">
                {config.apiVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Setup */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Transaction Setup
          </h2>

          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                  {config.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-field pl-20 font-mono text-lg"
                  placeholder="99.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1 font-mono"
                  placeholder="ORD_123456789"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  maxLength={50}
                />
                <button
                  onClick={handleGenerateOrderId}
                  className="btn-secondary whitespace-nowrap"
                >
                  🎲 Generate
                </button>
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1 font-mono"
                  placeholder="TXN_987654321"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  maxLength={50}
                />
                <button
                  onClick={handleGenerateTransactionId}
                  className="btn-secondary whitespace-nowrap"
                >
                  🎲 Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3DS Flow Steps Preview */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            3DS Authentication Flow
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="step-indicator pending">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Initiate Authentication</h3>
                <p className="text-sm text-gray-600">
                  Check if 3DS is available for the card and get authentication method
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="step-indicator pending">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Authenticate Payer</h3>
                <p className="text-sm text-gray-600">
                  Perform 3DS challenge (iframe) or frictionless authentication
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="step-indicator pending">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Authorize/Pay</h3>
                <p className="text-sm text-gray-600">
                  Complete payment with 3DS authentication result
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Test Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartTest}
            disabled={!orderId || !transactionId || !amount}
            className="btn-primary min-w-[300px] text-lg py-3"
          >
            🚀 Start 3DS Test Flow
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">💡 Testing Tips</h3>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Use unique Order ID and Transaction ID for each test</li>
            <li>Card 5123450000000008 triggers 3DS challenge flow (with iframe)</li>
            <li>Card 4000000000001091 triggers frictionless flow (no challenge)</li>
            <li>All steps will be executed sequentially - watch the logs for details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
