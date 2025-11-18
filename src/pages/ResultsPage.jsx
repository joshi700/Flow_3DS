import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { transaction, resetTransaction } = useConfig();
  const [expandedStep, setExpandedStep] = useState(null);
  const [showRequestData, setShowRequestData] = useState({});

  const handleNewTest = () => {
    resetTransaction();
    navigate('/home');
  };

  const getResultIcon = (result) => {
    if (result === 'SUCCESS') return '✅';
    if (result === 'FAILURE') return '❌';
    return '⚠️';
  };

  const getGatewayCodeColor = (code) => {
    if (code === 'APPROVED') return 'text-success-700';
    if (code === 'DECLINED') return 'text-error-700';
    return 'text-warning-700';
  };

  const formatJson = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const toggleRequestResponse = (step) => {
    setShowRequestData(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test Results
          </h1>
          <p className="text-gray-600">
            3DS Authentication Flow - Transaction {transaction.orderId}
          </p>
        </div>

        {/* Overall Status */}
        <div className={`card mb-6 ${
          transaction.responses.step4?.result === 'SUCCESS'
            ? 'bg-gradient-to-r from-success-50 to-green-50 border-success-200'
            : 'bg-gradient-to-r from-error-50 to-red-50 border-error-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className="text-6xl">
              {getResultIcon(transaction.responses.step4?.result)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {transaction.responses.step4?.result === 'SUCCESS' 
                  ? 'Payment Successful!' 
                  : 'Payment Failed'}
              </h2>
              <p className="text-lg font-semibold">
                Gateway Code:{' '}
                <span className={getGatewayCodeColor(transaction.responses.step4?.response?.gatewayCode)}>
                  {transaction.responses.step4?.response?.gatewayCode || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Order ID: <span className="font-mono">{transaction.orderId}</span>
                {' | '}
                Transaction ID: <span className="font-mono">{transaction.transactionId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Transaction Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-bold text-gray-900">
                ${transaction.amount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Authentication Status</p>
              <p className="text-lg font-bold text-gray-900">
                {transaction.responses.step2?.authentication?.status || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Result</p>
              <p className="text-lg font-bold text-gray-900">
                {transaction.responses.step4?.result || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Steps</p>
              <p className="text-lg font-bold text-gray-900">
                {Object.values(transaction.responses).filter(r => r !== null).length} / 4
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Results */}
        <div className="space-y-4 mb-6">
          {/* Step 1 Results */}
          {transaction.responses.step1 && (
            <div className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}
              >
                <div className="flex items-center gap-3">
                  <div className="step-indicator completed">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Step 1: Initiate Authentication
                    </h3>
                    <p className="text-sm text-gray-600">
                      Status: {transaction.responses.step1.authentication?.status}
                      {' | '}
                      Recommendation: {transaction.responses.step1.response?.gatewayRecommendation}
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">
                  {expandedStep === 1 ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Toggle Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 1: false })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        !showRequestData[1]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Response
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 1: true })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        showRequestData[1]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Request
                    </button>
                  </div>

                  {/* Request Data */}
                  {showRequestData[1] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Request Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step1.request || { note: "Request data not available" })}
                      </pre>
                    </div>
                  )}

                  {/* Response Data */}
                  {!showRequestData[1] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Response Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step1)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2 Results */}
          {transaction.responses.step2 && (
            <div className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}
              >
                <div className="flex items-center gap-3">
                  <div className="step-indicator completed">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Step 2: Authenticate Payer
                    </h3>
                    <p className="text-sm text-gray-600">
                      Status: {transaction.responses.step2.authentication?.status}
                      {transaction.responses.step2.authentication?.redirectHtml 
                        ? ' | Challenge Flow (with iframe)' 
                        : ' | Frictionless Flow'}
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">
                  {expandedStep === 2 ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === 2 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Toggle Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 2: false })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        !showRequestData[2]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Response
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 2: true })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        showRequestData[2]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Request
                    </button>
                  </div>

                  {/* Request Data */}
                  {showRequestData[2] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Request Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step2.request || { note: "Request data not available" })}
                      </pre>
                    </div>
                  )}

                  {/* Response Data */}
                  {!showRequestData[2] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Response Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson({
                          ...transaction.responses.step2,
                          authentication: {
                            ...transaction.responses.step2.authentication,
                            redirectHtml: transaction.responses.step2.authentication?.redirectHtml 
                              ? '[HTML Content - Hidden for brevity]' 
                              : undefined
                          }
                        })}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3 Results - Retrieve Order Details (NEW) */}
          {transaction.responses.step3 && (
            <div className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}
              >
                <div className="flex items-center gap-3">
                  <div className="step-indicator completed">3</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Step 3: Retrieve Order Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order Status: {transaction.responses.step3.status || 'N/A'}
                      {' | '}
                      Optional Step
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">
                  {expandedStep === 3 ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === 3 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Toggle Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 3: false })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        !showRequestData[3]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Response
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 3: true })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        showRequestData[3]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Request
                    </button>
                  </div>

                  {/* Request Data */}
                  {showRequestData[3] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Request Data:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p className="text-gray-700 mb-2"><strong>Method:</strong> GET</p>
                        <p className="text-gray-700 mb-2"><strong>URL:</strong> <span className="font-mono text-xs break-all">{transaction.responses.step3.request?.url || "N/A"}</span></p>
                        <p className="text-gray-600 italic">No request body for GET requests</p>
                      </div>
                    </div>
                  )}

                  {/* Response Data */}
                  {!showRequestData[3] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Response Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step3)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4 Results - Authorize/Pay (Previously Step 3) */}
          {transaction.responses.step4 && (
            <div className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === 4 ? null : 4)}
              >
                <div className="flex items-center gap-3">
                  <div className="step-indicator completed">4</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Step 4: Authorize/Pay
                    </h3>
                    <p className="text-sm text-gray-600">
                      Result: {transaction.responses.step4.result}
                      {' | '}
                      Gateway Code: {transaction.responses.step4.response?.gatewayCode}
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">
                  {expandedStep === 4 ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === 4 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Toggle Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 4: false })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        !showRequestData[4]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Response
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRequestData(prev => ({ ...prev, 4: true })); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        showRequestData[4]
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Request
                    </button>
                  </div>

                  {/* Request Data */}
                  {showRequestData[4] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Request Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step4.request || { note: "Request data not available" })}
                      </pre>
                    </div>
                  )}

                  {/* Response Data */}
                  {!showRequestData[4] && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Response Data:</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                        {formatJson(transaction.responses.step4)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Activity Logs ({transaction.logs.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transaction.logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  log.type === 'success'
                    ? 'bg-success-50 text-success-800'
                    : log.type === 'error'
                    ? 'bg-error-50 text-error-800'
                    : log.type === 'warning'
                    ? 'bg-warning-50 text-warning-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span>{log.message}</span>
                  <span className="text-xs opacity-70 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/settings')}
            className="btn-secondary min-w-[200px]"
          >
            ⚙️ Change Settings
          </button>
          <button
            onClick={handleNewTest}
            className="btn-primary min-w-[200px]"
          >
            🔄 New Test
          </button>
        </div>

        {/* Test Cards Reference */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Test Cards Reference</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>5123450000000008</strong> - Mastercard (3DS Challenge Success)</p>
            <p><strong>4000000000001091</strong> - Visa (3DS Frictionless Success)</p>
            <p><strong>5200000000001096</strong> - Mastercard (Declined)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
