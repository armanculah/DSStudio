import './style.css'

console.log("Playground page loaded");

// Playground functionality
document.addEventListener('DOMContentLoaded', () => {
  const dataInput = document.getElementById('dataInput');
  const insertBtn = document.getElementById('insertBtn');
  const removeBtn = document.getElementById('removeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const algorithmSelect = document.getElementById('algorithmSelect');
  const statusDiv = document.getElementById('status');
  const svg = document.getElementById('vis');
  
  // State management
  let currentData = [];
  let isAutoPlaying = false;
  let animationSpeed = 50;
  
  // Update status message
  const updateStatus = (message, type = 'info') => {
    if (statusDiv) {
      const statusContent = statusDiv.querySelector('div');
      if (statusContent) {
        statusContent.textContent = message;
        statusContent.className = `text-sm ${
          type === 'error' ? 'text-red-600' : 
          type === 'success' ? 'text-green-600' : 
          'text-gray-600'
        }`;
      }
    }
  };
  
  // Speed slider handler
  if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', (e) => {
      animationSpeed = parseInt(e.target.value);
      speedValue.textContent = animationSpeed;
      updateStatus(`Animation speed set to ${animationSpeed}%`);
    });
  }
  
  // Insert button handler
  if (insertBtn && dataInput) {
    insertBtn.addEventListener('click', () => {
      const value = dataInput.value.trim();
      if (value) {
        currentData.push(value);
        dataInput.value = '';
        updateStatus(`Added "${value}" to data structure`, 'success');
        // TODO: Update visualization
      } else {
        updateStatus('Please enter a value to insert', 'error');
      }
    });
    
    // Allow Enter key to insert
    dataInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        insertBtn.click();
      }
    });
  }
  
  // Remove button handler
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (currentData.length > 0) {
        const removed = currentData.pop();
        updateStatus(`Removed "${removed}" from data structure`, 'success');
        // TODO: Update visualization
      } else {
        updateStatus('No data to remove', 'error');
      }
    });
  }
  
  // Clear button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentData = [];
      updateStatus('Data structure cleared', 'success');
      // TODO: Clear visualization
    });
  }
  
  // Auto-play button handler
  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      isAutoPlaying = !isAutoPlaying;
      autoplayBtn.textContent = isAutoPlaying ? 'Stop Auto-play' : 'Auto-play';
      autoplayBtn.className = isAutoPlaying ? 
        'w-full ds-btn ds-btn-primary' : 
        'w-full ds-btn ds-btn-outline';
      
      updateStatus(isAutoPlaying ? 'Auto-play started' : 'Auto-play stopped');
      // TODO: Implement auto-play logic
    });
  }
  
  // Algorithm selection handler
  if (algorithmSelect) {
    algorithmSelect.addEventListener('change', (e) => {
      const algorithm = e.target.value;
      updateStatus(`Switched to ${algorithm.toUpperCase()} visualization`);
      // TODO: Switch visualization type
    });
  }
  
  // Initialize
  updateStatus('Playground ready. Select a data structure and start adding values!');
});