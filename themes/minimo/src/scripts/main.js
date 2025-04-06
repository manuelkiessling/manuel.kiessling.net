import '../stylesheets/style'

import docReady from 'es6-docready'

import { detailsTagSupported, shuffle } from './helpers'

docReady(() => {
  let termCloud = document.querySelector('.term-cloud:not(.no-shuffle)')
  if (termCloud) {
    let terms = termCloud.querySelectorAll('.term-cloud li')
    shuffle(terms).forEach(term => term.parentElement.appendChild(term))
  }

  let toc = document.querySelector('.entry-toc')
  if (toc) {
    if (!detailsTagSupported()) {
      document.body.classList.add('no-details')
      let tocToggler = document.querySelector('.toc-title')
      tocToggler.addEventListener('click', () => {
        if (toc.getAttribute('open')) {
          toc.open = false
          toc.removeAttribute('open')
        } else {
          toc.open = true
          toc.setAttribute('open', 'open')
        }
      })
    }
  }
  
  // Setup sidenote functionality
  let sidenoteContainers = document.querySelectorAll('.sidenote-container')
  if (sidenoteContainers.length > 0) {
    sidenoteContainers.forEach(container => {
      const trigger = container.querySelector('.sidenote-trigger')
      const content = container.querySelector('.sidenote-content')
      
      trigger.addEventListener('click', (event) => {
        event.stopPropagation()
        const isVisible = content.style.display === 'block'
        
        // Close all other sidenotes first
        document.querySelectorAll('.sidenote-content').forEach(el => {
          el.style.display = 'none'
          el.classList.remove('sidenote-visible')
        })
        
        if (!isVisible) {
          content.style.display = 'block'
          
          // Check if there's enough horizontal space
          if (window.innerWidth >= 768) {
            content.classList.add('sidenote-visible')
          }
        }
      })
    })
    
    // Close sidenotes when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.sidenote-content').forEach(el => {
        el.style.display = 'none'
        el.classList.remove('sidenote-visible')
      })
    })
  }
})
