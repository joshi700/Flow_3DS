import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  // Merchant Configuration (stored in sessionStorage)
  const [config, setConfig] = useState(() => {
    const saved = sessionStorage.getItem('merchantConfig');
    return saved ? JSON.parse(saved) : {
      merchantId: '',
      username: '',
      password: '',
      apiBaseUrl: 'https://mtf.gateway.mastercard.com',
      apiVersion: '100',  // Changed from 73 to 100
      currency: 'USD',
      mcc: '1242'
    };
  });

  // Test Card Configuration (stored in sessionStorage)
  const [testCard, setTestCard] = useState(() => {
    const saved = sessionStorage.getItem('testCard');
    return saved ? JSON.parse(saved) : {
      cardNumber: '5123450000000008',
      expiryMonth: '12',
      expiryYear: '39',  // Changed from 25 to 39
      cvv: '100'  // Changed from 123 to 100
    };
  });

  // Transaction State
  const [transaction, setTransaction] = useState({
    orderId: '',
    transactionId: '',
    amount: '',
    status: 'idle', // idle, step1, step2, step3, completed, error
    currentStep: 0,
    responses: {
      step1: null,
      step2: null,
      step3: null
    },
    logs: []
  });

  // Backend URL (update with your Vercel URL)
  const [backendUrl] = useState(
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
  );

  // Save config to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('merchantConfig', JSON.stringify(config));
  }, [config]);

  // Save test card to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('testCard', JSON.stringify(testCard));
  }, [testCard]);

  // Update configuration
  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Update test card
  const updateTestCard = (newCard) => {
    setTestCard(prev => ({ ...prev, ...newCard }));
  };

  // Update transaction
  const updateTransaction = (updates) => {
    setTransaction(prev => ({ ...prev, ...updates }));
  };

  // Add log entry
  const addLog = (type, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type, // 'info', 'success', 'error', 'warning'
      message,
      data
    };
    setTransaction(prev => ({
      ...prev,
      logs: [...prev.logs, logEntry]
    }));
  };

  // Reset transaction
  const resetTransaction = () => {
    setTransaction({
      orderId: '',
      transactionId: '',
      amount: '',
      status: 'idle',
      currentStep: 0,
      responses: {
        step1: null,
        step2: null,
        step3: null
      },
      logs: []
    });
  };

  // Clear all session data
  const clearSession = () => {
    sessionStorage.removeItem('merchantConfig');
    sessionStorage.removeItem('testCard');
    setConfig({
      merchantId: '',
      username: '',
      password: '',
      apiBaseUrl: 'https://mtf.gateway.mastercard.com',
      apiVersion: '73',
      currency: 'USD',
      mcc: '1242'
    });
    setTestCard({
      cardNumber: '5123450000000008',
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123'
    });
    resetTransaction();
  };

  const value = {
    config,
    updateConfig,
    testCard,
    updateTestCard,
    transaction,
    updateTransaction,
    addLog,
    resetTransaction,
    clearSession,
    backendUrl
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
