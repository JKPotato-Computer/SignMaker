// form.js - JK_Potato/Computer
// Responsible for changes within the website form (editor)

window.onload = function() {
    const modal = document.getElementById("uploadModal");
    const btn = document.getElementById("Import");
    const span = document.getElementsByClassName("close")[0];
            
            
    btn.onclick = function() {
        modal.style.display = "block";
    }
            
    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }    
}
    