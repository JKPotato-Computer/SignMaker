class CustomShields {
  constructor() {
    this.db = new IndexDB();
    this.uploadField = document.getElementById("shieldUploadField");
    this.fileInput = document.getElementById("uploadCustomShield");
    this.savedShieldsList = document.getElementById("savedCustomShieldsList");
    this.linkUploadInput = document.getElementById("linkUpload");

    // Initialize asynchronously
    this.initialized = this.init();
  }

  async init() {
    // Initialize drag and drop
    this.setupDragAndDrop();

    // Initialize file input click
    this.uploadField.addEventListener("click", () => this.fileInput.click());

    // Initialize file input change
    this.fileInput.addEventListener("change", (e) =>
      this.handleFileUpload(e.target.files)
    );

    // Initialize URL input
    this.linkUploadInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleUrlUpload(e.target.value);
      }
    });

    // Load existing shields
    this.loadSavedShields();
  }

  setupDragAndDrop() {
    this.uploadField.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploadField.classList.add("dragover");
    });

    this.uploadField.addEventListener("dragleave", () => {
      this.uploadField.classList.remove("dragover");
    });

    this.uploadField.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploadField.classList.remove("dragover");

      const files = e.dataTransfer.files;
      this.handleFileUpload(files);
    });
  }

  async handleFileUpload(files) {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files.");
        continue;
      }

      try {
        await this.db.saveShield(file);
        await this.loadSavedShields();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      }
    }
  }

  async handleUrlUpload(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop();
      const file = new File([blob], fileName, { type: blob.type });

      await this.db.saveShield(file);
      await this.loadSavedShields();
      this.linkUploadInput.value = "";
    } catch (error) {
      console.error("Error uploading from URL:", error);
      alert("Error uploading from URL. Please check the URL and try again.");
    }
  }

  async loadSavedShields(onShieldClick) {
    try {
      const shields = await this.db.getAllShields();
      this.savedShieldsList.innerHTML = "";

      shields.forEach((shield) => {
        const shieldElement = document.createElement("div");
        shieldElement.className = "customShieldItem";
        shieldElement.innerHTML = `
                    <img src="${shield.data}" class="shieldItemImg">
                    <span class="shieldItemName">${shield.fileName}</span>
                    <button class="deleteCustomShieldBtn" data-filename="${shield.fileName}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                `;

        // Add delete functionality
        shieldElement
          .querySelector(".deleteCustomShieldBtn")
          .addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this shield?")) {
              await this.db.deleteShield(shield.fileName);
              await this.loadSavedShields();
            }
          });

        if (onShieldClick) {
          shieldElement.addEventListener("click", () => onShieldClick(shield));
        }

        this.savedShieldsList.appendChild(shieldElement);
      });
    } catch (error) {
      console.error("Error loading shields:", error);
    }
  }
}
