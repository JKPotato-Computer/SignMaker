// Back Button
window.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            }
        });
    }
});