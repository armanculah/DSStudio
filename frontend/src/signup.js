import './style.css'

console.log("Signup page loaded");

// Basic form handling (placeholder for future API integration)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const messageDiv = document.getElementById('signupMsg');
  
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
      
      if (password.length < 8) {
        messageDiv.textContent = 'Password must be at least 8 characters long.';
        return;
      }
      
      // Placeholder for API call
      messageDiv.className = 'text-sm text-blue-600';
      messageDiv.textContent = 'Creating account... (API integration pending)';
      
      // TODO: Implement actual signup API call
      setTimeout(() => {
        messageDiv.className = 'text-sm text-green-600';
        messageDiv.textContent = 'Account created successfully! (Demo mode)';
      }, 1000);
    });
  }
});