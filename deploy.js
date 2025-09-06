// Simple deployment test script
const app = require('./index');

// Test all endpoints
const testEndpoints = [
  '/api/health',
  '/api/campaigns/test',
  '/api/contacts/test', 
  '/api/templates/test'
];

console.log('Testing backend endpoints...');
console.log('Make sure to deploy to Vercel after making changes');
console.log('Run: vercel --prod');
console.log('\nTest these URLs after deployment:');
testEndpoints.forEach(endpoint => {
  console.log(`https://bulk-email-backend-mu.vercel.app${endpoint}`);
});