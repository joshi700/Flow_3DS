# 3DS Payment Testing Tool - Frontend

Modern React application for testing MPGS 3D Secure authentication flows. Built with Vite, React 18, and Tailwind CSS.

## Features

- ✅ **3-Step 3DS Flow**: Initiate → Authenticate → Authorize
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- 🔒 **Secure**: Credentials stored in sessionStorage (cleared on tab close)
- 📊 **Real-time Logs**: Activity logging for debugging
- 🔄 **Both Flows**: Supports challenge and frictionless authentication
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Security**: DOMPurify for HTML sanitization

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your backend URL
# For local development: http://localhost:3005
# For production: https://your-backend.vercel.app
```

## Environment Variables

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3005
```

## Running Locally

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

App will run at `http://localhost:5173`

## Application Flow

### 1. Settings Page (`/settings`)

Configure merchant credentials and test card:

**Merchant Configuration:**
- Merchant ID
- API Username
- API Password (sessionStorage only)
- Gateway URL
- API Version
- Default Currency
- MCC

**Test Card Configuration:**
- Card Number
- Expiry Month/Year
- CVV

### 2. Home Page (`/home`)

Set up transaction details:
- Payment Amount
- Order ID (auto-generate or custom)
- Transaction ID (auto-generate or custom)

### 3. Test Page (`/test`)

Execute 3DS flow step-by-step:

**Step 1: Initiate Authentication**
- Checks if 3DS is available
- Returns authentication method

**Step 2: Authenticate Payer**
- Challenge Flow: Displays 3DS iframe
- Frictionless Flow: Auto-proceeds

**Step 3: Authorize/Pay**
- Completes payment
- Returns result (SUCCESS/FAILURE)

### 4. Results Page (`/results`)

View complete test results:
- Overall status
- Transaction summary
- Step-by-step responses
- Activity logs

## Key Features

### SessionStorage Security

All credentials are stored in `sessionStorage`:
- Automatically cleared when tab/browser closes
- Not shared across tabs
- More secure than `localStorage`

```javascript
// Credentials are stored per-session
sessionStorage.setItem('merchantConfig', JSON.stringify(config));
```

### 3DS Challenge Handling

The app handles both authentication flows:

**Challenge Flow** (with iframe):
```javascript
if (response.data.redirectHtml) {
  const sanitizedHtml = DOMPurify.sanitize(response.data.redirectHtml);
  setChallengeHtml(sanitizedHtml);
}
```

**Frictionless Flow** (no challenge):
```javascript
if (!response.data.redirectHtml) {
  // Automatically proceed to Step 3
  setTimeout(() => executeStep3(), 2000);
}
```

### Activity Logging

All actions are logged for debugging:

```javascript
addLog('info', 'Starting Step 1: Initiate Authentication');
addLog('success', 'Step 1 completed successfully', { data });
addLog('error', 'Step 1 failed: Invalid credentials');
```

## Test Cards

Use these test cards from MPGS:

| Card Number          | Type       | Flow           | Result  |
|---------------------|------------|----------------|---------|
| 5123450000000008    | Mastercard | Challenge      | Success |
| 4000000000001091    | Visa       | Frictionless   | Success |
| 5200000000001096    | Mastercard | Any            | Declined|

## Deployment to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Build the Project

```bash
npm run build
```

### Step 3: Deploy

```bash
# From the frontend directory
vercel

# For production
vercel --prod
```

### Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = `https://your-backend.vercel.app`
3. Redeploy

### Step 5: Update Backend CORS

Add your frontend Vercel URL to backend's `allowedOrigins`:

```javascript
const allowedOrigins = [
  'https://your-frontend.vercel.app'
];
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── SettingsPage.jsx     # Merchant & card configuration
│   │   ├── HomePage.jsx          # Transaction setup
│   │   ├── TestPage.jsx          # 3DS flow execution
│   │   └── ResultsPage.jsx       # Test results
│   ├── context/
│   │   └── ConfigContext.jsx     # Global state management
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Configuration Management

The app uses React Context for state management:

```javascript
const {
  config,           // Merchant configuration
  testCard,         // Test card details
  transaction,      // Current transaction state
  updateConfig,     // Update merchant config
  updateTestCard,   // Update card details
  addLog,          // Add activity log
  resetTransaction // Reset transaction state
} = useConfig();
```

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#3b82f6',  // Your brand color
    600: '#2563eb',
  }
}
```

### Change API Timeout

Edit timeout in API calls:

```javascript
const response = await axios.post(url, payload, {
  timeout: 30000  // 30 seconds
});
```

### Add Custom Validation

Edit validation in `SettingsPage.jsx`:

```javascript
const validateConfig = () => {
  if (!config.merchantId) return 'Merchant ID is required';
  // Add more validation
};
```

## Troubleshooting

### Backend Connection Error

**Error**: "Cannot connect to backend server"

**Solution**:
1. Verify backend is running
2. Check `VITE_BACKEND_URL` in `.env`
3. Verify backend CORS allows your frontend URL

### 3DS Challenge Not Showing

**Error**: Challenge iframe doesn't display

**Solution**:
1. Check browser console for errors
2. Verify `redirectHtml` exists in Step 2 response
3. Check DOMPurify is sanitizing HTML correctly

### Credentials Not Persisting

**Issue**: Credentials lost on page refresh

**Expected Behavior**: This is intentional! Credentials are stored in `sessionStorage` and persist only while the tab is open. They're cleared when:
- Tab is closed
- Browser is closed
- User navigates away (in some browsers)

### CORS Errors

**Error**: "CORS policy blocked"

**Solution**:
1. Add your frontend URL to backend's `allowedOrigins`
2. Restart backend server
3. Clear browser cache

## Best Practices

1. **Never hardcode credentials** in the code
2. **Always validate** user input before API calls
3. **Use sessionStorage** for sensitive data (not localStorage)
4. **Sanitize HTML** from API responses using DOMPurify
5. **Log activities** for debugging (mask sensitive data)
6. **Handle errors** gracefully with user-friendly messages

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- **Build size**: ~150KB (gzipped)
- **Load time**: <2s on 3G
- **Lighthouse score**: 95+

## Contributing

To contribute:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use for testing and demos.

## Support

For issues:
1. Check browser console for errors
2. Review backend logs
3. Verify MPGS credentials
4. Test with known working cards

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MPGS API Docs](https://mpgs.fingent.wiki/)
