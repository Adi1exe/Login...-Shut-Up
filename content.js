function removeLoginElements() {
    const elementsToRemove = [
        'div[aria-hidden="true"]',  
        '.login-modal',  
        '.overlay',  
        '[id*="login"]',  
        '[class*="login"]',  
        '[class*="popup"]',  
        '[class*="overlay"]',  
        '[role="dialog"]',  
        '[data-testid="login-modal"]',
        'iframe', 
        '[id*="paywall"]', 
        '[class*="paywall"]' 
    ];

    elementsToRemove.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.remove();
            console.log(`Removed: ${selector}`);
        });
    });

    document.querySelectorAll('*').forEach(el => {
        if (getComputedStyle(el).filter.includes('blur')) {
            el.style.filter = 'none';
        }
        if (getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'absolute') {
            el.style.position = 'relative';
        }
        if (getComputedStyle(el).overflow === 'hidden') {
            el.style.overflow = 'auto';
        }
    });

    // Unlock scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    console.log("Login popups & blur effects removed!");
}

removeLoginElements();

setInterval(removeLoginElements, 2000);
