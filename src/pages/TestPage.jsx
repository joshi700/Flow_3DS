import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import axios from 'axios';

const TestPage = () => {
  const navigate = useNavigate();
  const { config, testCard, updateTransaction, addLog, backendUrl } = useConfig();

  const [loading, setLoading] = useState({ step1: false, step2: false, step3: false });
  const [error, setError] = useState(null);
  const [showLogs, setShowLogs] = useState(true);
  const [challengeHtml, setChallengeHtml] = useState(null);
  const [logs, setLogs] = useState([]);

  // Transaction IDs - auto-generated
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('99.00');

  // Step 1 State
  const [step1Method, setStep1Method] = useState('PUT');
  const [step1Url, setStep1Url] = useState('');
  const [step1Body, setStep1Body] = useState('');
  const [step1Response, setStep1Response] = useState(null);
  const [step1BodyError, setStep1BodyError] = useState(null);

  // Step 2 State
  const [step2Method, setStep2Method] = useState('PUT');
  const [step2Url, setStep2Url] = useState('');
  const [step2Body, setStep2Body] = useState('');
  const [step2Response, setStep2Response] = useState(null);
  const [step2BodyError, setStep2BodyError] = useState(null);

  // Step 3 State
  const [step3Method, setStep3Method] = useState('PUT');
  const [step3Url, setStep3Url] = useState('');
  const [step3Body, setStep3Body] = useState('');
  const [step3Response, setStep3Response] = useState(null);
  const [step3BodyError, setStep3BodyError] = useState(null);

  // Generate unique ID
  const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  };

  // Add log helper
  const addActivityLog = (type, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    setLogs(prev => [...prev, logEntry]);
    addLog(type, message, data);
  };

  // Initialize on mount
  useEffect(() => {
    const newOrderId = generateId('ORD');
    const newTransactionId = generateId('TXN');
    setOrderId(newOrderId);
    setTransactionId(newTransactionId);

    updateTransaction({
      orderId: newOrderId,
      transactionId: newTransactionId,
      amount: amount,
      status: 'ready',
      currentStep: 0
    });

    initializeStep1(newOrderId, newTransactionId);
    initializeStep2(newOrderId, newTransactionId);
    initializeStep3(newOrderId, newTransactionId);

    addActivityLog('info', `Initialized transaction: ${newOrderId} / ${newTransactionId}`);
  }, []);

  // Initialize Step 1
  const initializeStep1 = (oid, tid) => {
    const url = `${config.apiBaseUrl}/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${oid}/transaction/${tid}`;
    setStep1Url(url);

    // New simplified default body for Step 1
    const body = {
      apiOperation: "INITIATE_AUTHENTICATION",
      authentication: {
        channel: "PAYER_BROWSER"
      },
      order: {
        currency: config.currency
      },
      sourceOfFunds: {
        provided: {
          card: {
            number: "5123450000000008"
          }
        }
      }
    };
    setStep1Body(JSON.stringify(body, null, 2));
  };

  // Initialize Step 2
  const initializeStep2 = (oid, tid) => {
    const url = `${config.apiBaseUrl}/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${oid}/transaction/${tid}`;
    setStep2Url(url);

    // New default body for Step 2 with placeholders
    const body = {
      sourceOfFunds: {
        provided: {
          card: {
            number: "5123450000000008",
            expiry: {
              month: testCard.expiryMonth,
              year: testCard.expiryYear
            }
          }
        }
      },
      order: {
        amount: "100",
        currency: config.currency
      },
      authentication: {
        redirectResponseUrl: "https://www.mastercard.com"
      },
      device: {
        browser: "MOZILLA",
        browserDetails: {
          "3DSecureChallengeWindowSize": "FULL_SCREEN",
          acceptHeaders: "application/json",
          colorDepth: 24,
          javaEnabled: true,
          language: "en-US",
          screenHeight: 640,
          screenWidth: 480,
          timeZone: 273
        },
        ipAddress: "127.0.0.1"
      },
      apiOperation: "AUTHENTICATE_PAYER"
    };
    setStep2Body(JSON.stringify(body, null, 2));
  };

  // Initialize Step 3
  const initializeStep3 = (oid, tid) => {
    const url = `${config.apiBaseUrl}/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${oid}/transaction/${tid}`;
    setStep3Url(url);

    const body = {
      apiOperation: "PAY",
      authentication: {
        transactionId: tid
      },
      correlationId: generateId('CORR')
    };
    setStep3Body(JSON.stringify(body, null, 2));
  };

  // Regenerate IDs
  const regenerateIds = () => {
    const newOrderId = generateId('ORD');
    const newTransactionId = generateId('TXN');
    setOrderId(newOrderId);
    setTransactionId(newTransactionId);

    updateTransaction({
      orderId: newOrderId,
      transactionId: newTransactionId,
      amount: amount
    });

    initializeStep1(newOrderId, newTransactionId);
    initializeStep2(newOrderId, newTransactionId);
    initializeStep3(newOrderId, newTransactionId);

    // Reset responses
    setStep1Response(null);
    setStep2Response(null);
    setStep3Response(null);

    addActivityLog('info', `Regenerated IDs: ${newOrderId} / ${newTransactionId}`);
  };

  // Validate JSON
  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  // Execute Step 1
  const executeStep1 = async () => {
    const bodyError = validateJSON(step1Body);
    if (bodyError) {
      setStep1BodyError(bodyError);
      return;
    }
    setStep1BodyError(null);

    setLoading(prev => ({ ...prev, step1: true }));
    setError(null);
    addActivityLog('info', 'Starting Step 1: Initiate Authentication');

    try {
      // Send the actual edited values from the UI
      const payload = {
        merchantId: config.merchantId,
        username: config.username,
        password: config.password,
        apiBaseUrl: config.apiBaseUrl,
        apiVersion: config.apiVersion,
        orderId: orderId,
        transactionId: transactionId,
        method: step1Method,              // ← Use edited method
        url: step1Url,                    // ← Use edited URL
        requestBody: step1Body            // ← Use edited request body
      };

      addActivityLog('info', 'Sending request with custom body to backend');

      const response = await axios.post(
        `${backendUrl}/api/initiate-authentication`,
        payload,
        { timeout: 30000 }
      );

      if (response.data.success) {
        setStep1Response(response.data);
        addActivityLog('success', 'Step 1 completed successfully', {
          authenticationStatus: response.data.authenticationStatus,
          gatewayRecommendation: response.data.gatewayRecommendation
        });

        updateTransaction({
          currentStep: 1,
          responses: { step1: response.data.data, step2: null, step3: null }
        });
      } else {
        throw new Error('Step 1 failed');
      }
    } catch (err) {
      console.error('Step 1 error:', err);
      const errorMsg = err.response?.data?.details?.explanation ||
                       err.response?.data?.error ||
                       err.message;
      setError(`Step 1 Error: ${errorMsg}`);
      setStep1Response(err.response?.data || { error: err.message });
      addActivityLog('error', `Step 1 failed: ${errorMsg}`, err.response?.data);
    } finally {
      setLoading(prev => ({ ...prev, step1: false }));
    }
  };

  // Execute Step 2
  const executeStep2 = async () => {
    const bodyError = validateJSON(step2Body);
    if (bodyError) {
      setStep2BodyError(bodyError);
      return;
    }
    setStep2BodyError(null);

    if (!step1Response || !step1Response.success) {
      setError('Please complete Step 1 first');
      return;
    }

    setLoading(prev => ({ ...prev, step2: true }));
    setError(null);
    addActivityLog('info', 'Starting Step 2: Authenticate Payer');

    try {
      // Send the actual edited values from the UI
      const payload = {
        merchantId: config.merchantId,
        username: config.username,
        password: config.password,
        apiBaseUrl: config.apiBaseUrl,
        apiVersion: config.apiVersion,
        orderId: orderId,
        transactionId: transactionId,
        method: step2Method,              // ← Use edited method
        url: step2Url,                    // ← Use edited URL
        requestBody: step2Body            // ← Use edited request body
      };

      addActivityLog('info', 'Sending request with custom body to backend');

      const response = await axios.post(
        `${backendUrl}/api/authenticate-payer`,
        payload,
        { timeout: 30000 }
      );

      if (response.data.success) {
        setStep2Response(response.data);
        addActivityLog('success', 'Step 2 completed successfully', {
          authenticationStatus: response.data.authenticationStatus
        });

        updateTransaction({
          currentStep: 2,
          responses: {
            step1: step1Response.data,
            step2: response.data.data,
            step3: null
          }
        });

        // Check if 3DS challenge is required
        let htmlContent = null;
        
        // Extract HTML from various possible locations in response
        if (response.data.data?.authentication?.redirect?.html) {
          htmlContent = response.data.data.authentication.redirect.html;
        } else if (response.data.data?.authentication?.redirectHtml) {
          htmlContent = response.data.data.authentication.redirectHtml;
        } else if (response.data.redirectHtml) {
          htmlContent = response.data.redirectHtml;
        }
        
        if (htmlContent) {
          addActivityLog('info', '3DS Challenge required - extracting and rendering HTML');
          
          // Remove escaped quotes and backslashes
          // This handles the \" to " conversion
          htmlContent = htmlContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          
          addActivityLog('info', 'HTML cleaned and ready for rendering in iframe');
          console.log('Cleaned HTML for iframe:', htmlContent);
          
          // Set the cleaned HTML directly (no sanitization - iframe sandbox provides security)
          setChallengeHtml(htmlContent);
        } else {
          addActivityLog('info', 'Frictionless authentication - no challenge required');
        }
      } else {
        throw new Error('Step 2 failed');
      }
    } catch (err) {
      console.error('Step 2 error:', err);
      const errorMsg = err.response?.data?.details?.explanation ||
                       err.response?.data?.error ||
                       err.message;
      setError(`Step 2 Error: ${errorMsg}`);
      setStep2Response(err.response?.data || { error: err.message });
      addActivityLog('error', `Step 2 failed: ${errorMsg}`, err.response?.data);
    } finally {
      setLoading(prev => ({ ...prev, step2: false }));
    }
  };

  // Execute Step 3
  const executeStep3 = async () => {
    const bodyError = validateJSON(step3Body);
    if (bodyError) {
      setStep3BodyError(bodyError);
      return;
    }
    setStep3BodyError(null);

    if (!step2Response || !step2Response.success) {
      setError('Please complete Step 2 first');
      return;
    }

    setLoading(prev => ({ ...prev, step3: true }));
    setError(null);
    addActivityLog('info', 'Starting Step 3: Authorize/Pay');

    try {
      // Send the actual edited values from the UI
      const payload = {
        merchantId: config.merchantId,
        username: config.username,
        password: config.password,
        apiBaseUrl: config.apiBaseUrl,
        apiVersion: config.apiVersion,
        orderId: orderId,
        transactionId: transactionId,
        method: step3Method,              // ← Use edited method
        url: step3Url,                    // ← Use edited URL
        requestBody: step3Body            // ← Use edited request body
      };

      addActivityLog('info', 'Sending request with custom body to backend');

      const response = await axios.post(
        `${backendUrl}/api/authorize-pay`,
        payload,
        { timeout: 30000 }
      );

      if (response.data.success) {
        setStep3Response(response.data);
        const result = response.data.result;
        const gatewayCode = response.data.gatewayCode;

        if (result === 'SUCCESS' && gatewayCode === 'APPROVED') {
          addActivityLog('success', '🎉 Payment APPROVED - Step 3 completed successfully', {
            result,
            gatewayCode
          });
        } else {
          addActivityLog('warning', `Payment result: ${result}, Gateway code: ${gatewayCode}`, {
            result,
            gatewayCode
          });
        }

        updateTransaction({
          status: 'completed',
          currentStep: 3,
          responses: {
            step1: step1Response.data,
            step2: step2Response.data,
            step3: response.data.data
          }
        });

        // Navigate to results after delay
        setTimeout(() => navigate('/results'), 2000);
      } else {
        throw new Error('Step 3 failed');
      }
    } catch (err) {
      console.error('Step 3 error:', err);
      const errorMsg = err.response?.data?.details?.explanation ||
                       err.response?.data?.error ||
                       err.message;
      setError(`Step 3 Error: ${errorMsg}`);
      setStep3Response(err.response?.data || { error: err.message });
      addActivityLog('error', `Step 3 failed: ${errorMsg}`, err.response?.data);
    } finally {
      setLoading(prev => ({ ...prev, step3: false }));
    }
  };

  // Reset to defaults
  const resetStep1 = () => {
    initializeStep1(orderId, transactionId);
    setStep1Response(null);
    setStep1BodyError(null);
    addActivityLog('info', 'Step 1 reset to default values');
  };

  const resetStep2 = () => {
    initializeStep2(orderId, transactionId);
    setStep2Response(null);
    setStep2BodyError(null);
    addActivityLog('info', 'Step 2 reset to default values');
  };

  const resetStep3 = () => {
    initializeStep3(orderId, transactionId);
    setStep3Response(null);
    setStep3BodyError(null);
    addActivityLog('info', 'Step 3 reset to default values');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            3DS Authentication Testing
          </h1>
          <p className="text-gray-600">Postman-like interface for 3DS flow testing</p>
        </div>

        {/* Transaction IDs */}
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-purple-50">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Transaction Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({config.currency})</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field font-mono text-sm"
                />
                <button onClick={regenerateIds} className="btn-secondary whitespace-nowrap">
                  🔄 Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* 3DS Challenge Modal */}
        {challengeHtml && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-primary-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">3D Secure Authentication</h2>
                <p className="text-sm text-primary-100">Please complete the authentication challenge</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  srcDoc={challengeHtml}
                  className="w-full h-full border-0"
                  title="3DS Challenge"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
                />
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setChallengeHtml(null);
                    addActivityLog('warning', '3DS challenge cancelled by user');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setChallengeHtml(null);
                    addActivityLog('info', '3DS challenge completed - proceeding to Step 3');
                    setTimeout(() => executeStep3(), 1000);
                  }}
                  className="btn-primary"
                >
                  Challenge Complete →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Initiate Authentication */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`step-indicator ${step1Response?.success ? 'completed' : 'active'}`}>1</div>
            <h2 className="text-xl font-bold text-gray-900">Step 1: Initiate Authentication</h2>
          </div>

          {/* Method & URL */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={step1Method}
              onChange={(e) => setStep1Method(e.target.value.toUpperCase())}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold bg-white w-24 text-center"
              placeholder="PUT"
            />
            <input
              type="text"
              value={step1Url}
              onChange={(e) => setStep1Url(e.target.value)}
              className="input-field flex-1 font-mono text-sm"
              placeholder="API URL"
            />
          </div>

          {/* Request Body */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Request Body</label>
            <textarea
              value={step1Body}
              onChange={(e) => {
                setStep1Body(e.target.value);
                setStep1BodyError(validateJSON(e.target.value));
              }}
              className={`w-full h-64 px-4 py-2 border ${step1BodyError ? 'border-error-500' : 'border-gray-300'} rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
            {step1BodyError && (
              <p className="text-xs text-error-600 mt-1">❌ Invalid JSON: {step1BodyError}</p>
            )}
          </div>

          {/* Response */}
          {step1Response && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Response {step1Response.success ? '✅' : '❌'}
              </label>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto border border-gray-200">
                {JSON.stringify(step1Response, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={resetStep1} className="btn-secondary">
              🔄 Reset to Default
            </button>
            <button
              onClick={executeStep1}
              disabled={loading.step1 || step1BodyError}
              className="btn-primary flex-1"
            >
              {loading.step1 ? '⏳ Executing...' : '🚀 Execute Step 1'}
            </button>
          </div>
        </div>

        {/* Step 2: Authenticate Payer */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`step-indicator ${step2Response?.success ? 'completed' : step1Response?.success ? 'active' : 'pending'}`}>2</div>
            <h2 className="text-xl font-bold text-gray-900">Step 2: Authenticate Payer</h2>
          </div>

          {/* Method & URL */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={step2Method}
              onChange={(e) => setStep2Method(e.target.value.toUpperCase())}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold bg-white w-24 text-center"
              placeholder="PUT"
            />
            <input
              type="text"
              value={step2Url}
              onChange={(e) => setStep2Url(e.target.value)}
              className="input-field flex-1 font-mono text-sm"
              placeholder="API URL"
            />
          </div>

          {/* Request Body */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Request Body</label>
            <textarea
              value={step2Body}
              onChange={(e) => {
                setStep2Body(e.target.value);
                setStep2BodyError(validateJSON(e.target.value));
              }}
              className={`w-full h-64 px-4 py-2 border ${step2BodyError ? 'border-error-500' : 'border-gray-300'} rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
            {step2BodyError && (
              <p className="text-xs text-error-600 mt-1">❌ Invalid JSON: {step2BodyError}</p>
            )}
          </div>

          {/* Response */}
          {step2Response && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Response {step2Response.success ? '✅' : '❌'}
              </label>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto border border-gray-200">
                {JSON.stringify(step2Response, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={resetStep2} className="btn-secondary">
              🔄 Reset to Default
            </button>
            <button
              onClick={executeStep2}
              disabled={loading.step2 || !step1Response?.success || step2BodyError}
              className="btn-primary flex-1"
            >
              {loading.step2 ? '⏳ Executing...' : '🚀 Execute Step 2'}
            </button>
          </div>
        </div>

        {/* Step 3: Authorize/Pay */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`step-indicator ${step3Response?.success ? 'completed' : step2Response?.success ? 'active' : 'pending'}`}>3</div>
            <h2 className="text-xl font-bold text-gray-900">Step 3: Authorize/Pay</h2>
          </div>

          {/* Method & URL */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={step3Method}
              onChange={(e) => setStep3Method(e.target.value.toUpperCase())}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold bg-white w-24 text-center"
              placeholder="PUT"
            />
            <input
              type="text"
              value={step3Url}
              onChange={(e) => setStep3Url(e.target.value)}
              className="input-field flex-1 font-mono text-sm"
              placeholder="API URL"
            />
          </div>

          {/* Request Body */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Request Body</label>
            <textarea
              value={step3Body}
              onChange={(e) => {
                setStep3Body(e.target.value);
                setStep3BodyError(validateJSON(e.target.value));
              }}
              className={`w-full h-64 px-4 py-2 border ${step3BodyError ? 'border-error-500' : 'border-gray-300'} rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
            {step3BodyError && (
              <p className="text-xs text-error-600 mt-1">❌ Invalid JSON: {step3BodyError}</p>
            )}
          </div>

          {/* Response */}
          {step3Response && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Response {step3Response.success ? '✅' : '❌'}
              </label>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto border border-gray-200">
                {JSON.stringify(step3Response, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={resetStep3} className="btn-secondary">
              🔄 Reset to Default
            </button>
            <button
              onClick={executeStep3}
              disabled={loading.step3 || !step2Response?.success || step3BodyError}
              className="btn-primary flex-1"
            >
              {loading.step3 ? '⏳ Executing...' : '🚀 Execute Step 3'}
            </button>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Activity Logs ({logs.length})</h2>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showLogs ? 'Hide' : 'Show'} Logs
            </button>
          </div>

          {showLogs && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No logs yet - start testing!</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      log.type === 'success'
                        ? 'bg-success-50 text-success-800 border border-success-200'
                        : log.type === 'error'
                        ? 'bg-error-50 text-error-800 border border-error-200'
                        : log.type === 'warning'
                        ? 'bg-warning-50 text-warning-800 border border-warning-200'
                        : 'bg-gray-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-xs opacity-70 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate('/settings')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Settings
          </button>
          {step3Response?.success && (
            <button
              onClick={() => navigate('/results')}
              className="btn-primary"
            >
              View Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
