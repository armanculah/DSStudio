import './style.css'

console.log("Login page loaded");

// Basic form handling (placeholder for future API integration)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const messageDiv = document.getElementById('loginMsg');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Clear previous messages
      messageDiv.textContent = '';
      messageDiv.className = 'text-sm text-red-600';
      
      // Basic validation
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      
      if (!email || !password) {
        messageDiv.textContent = 'Please fill in all fields.';
        return;
      }
      
      // Placeholder for API call
      messageDiv.className = 'text-sm text-blue-600';
      messageDiv.textContent = 'Signing in... (API integration pending)';
      
      // TODO: Implement actual login API call
      setTimeout(() => {
        messageDiv.className = 'text-sm text-green-600';
        messageDiv.textContent = 'Login successful! (Demo mode)';
      }, 1000);
    });
  }
});