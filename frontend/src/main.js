import './style.css'

// Shared functionality across pages
document.addEventListener('DOMContentLoaded', () => {
  // Speed slider functionality for playground
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  
  if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', (e) => {
      speedValue.textContent = e.target.value;
    });
  }
  
  // Simple form focus improvements
  const inputs = document.querySelectorAll('.ds-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement?.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement?.classList.remove('focused');
    });
  });
});
