document.addEventListener('DOMContentLoaded', function() {
  // Setup sidenote functionality
  let sidenoteContainers = document.querySelectorAll('.sidenote-container');
  if (sidenoteContainers.length > 0) {
    sidenoteContainers.forEach(container => {
      const trigger = container.querySelector('.sidenote-trigger');
      const content = container.querySelector('.sidenote-content');
      
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = content.style.display === 'block';
        
        // Close all other sidenotes first
        document.querySelectorAll('.sidenote-content').forEach(el => {
          el.style.display = 'none';
          el.classList.remove('sidenote-visible');
        });
        
        if (!isVisible) {
          content.style.display = 'block';
          content.classList.add('sidenote-visible');
        }
      });
    });
    
    // Close sidenotes when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.sidenote-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('sidenote-visible');
      });
    });
  }
});
