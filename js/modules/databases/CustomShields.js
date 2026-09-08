class CustomShields {
  constructor() {
    this.db = IndexDBManager.getDatastore("customShields", {
      keyPath: "fileName",
    });
    this.uploadField = document.getElementById("shieldUploadField");
    this.fileInput = document.getElementById("uploadCustomShield");
    this.savedShieldsList = document.getElementById("savedCustomShieldsList");
    this.linkUploadInput = document.getElementById("linkUpload");
    this.initialized = this.init();
    this.shieldClickCallback = null;
  }

  async init() {
    this.setupDragAndDrop();

    this.uploadField.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) =>
      this.handleFileUpload(e.target.files),
    );

    this.linkUploadInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleUrlUpload(e.target.value);
      }
    });

    await this.loadSavedShields();
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
        const reader = new FileReader();
        reader.readAsDataURL(file);

        const shield = await new Promise((resolve, reject) => {
          reader.onload = () => {
            resolve({
              fileName: file.name,
              type: file.type,
              data: reader.result,
              dateAdded: new Date().toISOString(),
            });
          };
          reader.onerror = (error) => reject(error);
        });

        await this.db.put(shield);
        await this.loadSavedShields();
      } catch (error) {
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

      const reader = new FileReader();
      reader.readAsDataURL(file);

      const shield = await new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve({
            fileName: file.name,
            type: file.type,
            data: reader.result,
            dateAdded: new Date().toISOString(),
          });
        };
        reader.onerror = (error) => reject(error);
      });

      await this.db.put(shield);
      await this.loadSavedShields();
      this.linkUploadInput.value = "";
    } catch (error) {
      console.error("Error uploading from URL:", error);
      alert("Error uploading from URL. Please check the URL and try again.");
    }
  }

  async loadSavedShields(onShieldClick) {
    if (!onShieldClick) {
      onShieldClick = this.shieldClickCallback;
    } else {
      this.shieldClickCallback = onShieldClick;
    }
    try {
      const shields = await this.db.getAll();
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

        shieldElement
          .querySelector(".deleteCustomShieldBtn")
          .addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this shield?")) {
              await this.db.delete(shield.fileName);
              await this.loadSavedShields();
            }
          });

        shieldElement.addEventListener("click", () => onShieldClick(shield));

        this.savedShieldsList.appendChild(shieldElement);
      });
    } catch (error) {
      console.error("Error loading shields:", error);
    }
  }
}
