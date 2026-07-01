// This script handles basic UI interactions

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on based on URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Highlight active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (currentPage === linkPage) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });

});
