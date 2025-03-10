const STYLE_ID = 'blue-screen-filter-style';
const existingStyle = document.getElementById(STYLE_ID);

if (existingStyle) {
    existingStyle.remove();
} else {
    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.innerHTML = `
      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 191, 0, 0.15);
        pointer-events: none; /* Click-through */
        z-index: 9999;
      }
    `;
    document.head.appendChild(styleElement);
}
