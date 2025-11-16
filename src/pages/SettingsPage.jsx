import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import axios from 'axios';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { config, updateConfig, testCard, updateTestCard, backendUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleConfigChange = (field, value) => {
    updateConfig({ [field]: value });
  };

  const handleTestCardChange = (field, value) => {
    updateTestCard({ [field]: value });
  };

  const validateConfig = () => {
    if (!config.merchantId) return 'Merchant ID is required';
    if (!config.username) return 'API Username is required';
    if (!config.password) return 'API Password is required';
    if (config.password.length < 8) return 'API Password must be at least 8 characters';
    if (!config.apiBaseUrl) return 'Gateway URL is required';
    if (!config.apiBaseUrl.startsWith('https://')) return 'Gateway URL must start with https://';
    if (!config.currency || config.currency.length !== 3) return 'Currency must be 3-letter ISO code';
    return null;
  };

  const validateTestCard = () => {
    if (!testCard.cardNumber) return 'Card number is required';
    if (testCard.cardNumber.length < 13 || testCard.cardNumber.length > 19) {
      return 'Card number must be 13-19 digits';
    }
    if (!testCard.expiryMonth || !testCard.expiryYear) return 'Expiry date is required';
    if (parseInt(testCard.expiryMonth) < 1 || parseInt(testCard.expiryMonth) > 12) {
      return 'Invalid expiry month';
    }
    return null;
  };

  const handleTestConfiguration = async () => {
    const configError = validateConfig();
    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${backendUrl}/api/test-config`, {
        merchantId: config.merchantId,
        username: config.username,
        password: config.password,
        apiBaseUrl: config.apiBaseUrl,
        apiVersion: config.apiVersion
      }, {
        timeout: 10000
      });

      if (response.data.success) {
        setSuccess('Configuration validated successfully! You can now proceed to testing.');
      }
    } catch (err) {
      console.error('Configuration test error:', err);
      if (err.response) {
        setError(`Validation failed: ${err.response.data.details || err.response.data.error}`);
      } else if (err.request) {
        setError('Cannot connect to backend server. Please check if the backend is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToTesting = () => {
    const configError = validateConfig();
    const cardError = validateTestCard();

    if (configError) {
      setError(configError);
      return;
    }

    if (cardError) {
      setError(cardError);
      return;
    }

    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            3DS Payment Testing Tool
          </h1>
          <p className="text-gray-600">
            Configure your MPGS credentials and test 3D Secure authentication flow
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
            <p className="font-medium">✅ {success}</p>
          </div>
        )}

        {/* Merchant Configuration Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
              1
            </span>
            Merchant Configuration
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant ID *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., TESTGJMIDTESTING"
                  value={config.merchantId}
                  onChange={(e) => handleConfigChange('merchantId', e.target.value)}
                  maxLength={40}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Username *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="merchant.{merchantId}"
                  value={config.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Enter API password (min 8 characters)"
                  value={config.password}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Stored in session only - cleared when tab is closed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway URL *
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://mtf.gateway.mastercard.com"
                  value={config.apiBaseUrl}
                  onChange={(e) => handleConfigChange('apiBaseUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Version
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="73"
                  value={config.apiVersion}
                  onChange={(e) => handleConfigChange('apiVersion', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Default: 100</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="USD"
                  value={config.currency}
                  onChange={(e) => handleConfigChange('currency', e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant Category Code (MCC)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="1242"
                  value={config.mcc}
                  onChange={(e) => handleConfigChange('mcc', e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test Card Configuration Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
              2
            </span>
            Test Card Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Card Number *
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="5123450000000008"
                value={testCard.cardNumber}
                onChange={(e) => handleTestCardChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                maxLength={19}
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 5123450000000008 (3DS Challenge), 4000000000001091 (Frictionless)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Month *
                </label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="12"
                  value={testCard.expiryMonth}
                  onChange={(e) => handleTestCardChange('expiryMonth', e.target.value)}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Year *
                </label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="39"
                  value={testCard.expiryYear}
                  onChange={(e) => handleTestCardChange('expiryYear', e.target.value)}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="100"
                  value={testCard.cvv}
                  onChange={(e) => handleTestCardChange('cvv', e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleTestConfiguration}
            disabled={loading}
            className="btn-secondary min-w-[200px]"
          >
            {loading ? '⏳ Testing...' : '🧪 Test Configuration'}
          </button>

          <button
            onClick={handleProceedToTesting}
            className="btn-primary min-w-[200px]"
          >
            Continue to Testing →
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Important Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>All credentials are stored in sessionStorage and cleared when you close the tab</li>
            <li>Use MTF environment URL for testing: https://mtf.gateway.mastercard.com</li>
            <li>Test cards will trigger different 3DS flows (frictionless or challenge)</li>
            <li>Make sure your backend server is running before testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
