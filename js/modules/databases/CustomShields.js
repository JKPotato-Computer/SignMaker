const CustomShields = (() => {
  let db;
  let uploadField;
  let fileInput;
  let savedShieldsList;
  let linkUploadInput;
  let shieldClickCallback = null;

  const handleFileUpload = async (files) => {
    for (const file of files) {
      await db.uploadFile(file);
    }
    await loadSavedShields();
  };

  const handleUrlUpload = async (url) => {
    if (!url) return;
    await db.uploadUrl(url);
    linkUploadInput.value = "";
    await loadSavedShields();
  };

  const setupDragAndDrop = () => {
    uploadField.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      uploadField.classList.add("dragover");
    });
    uploadField.addEventListener("dragleave", () =>
      uploadField.classList.remove("dragover"),
    );
    uploadField.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      uploadField.classList.remove("dragover");
      handleFileUpload(event.dataTransfer.files);
    });
  };

  const loadSavedShields = async (onShieldClick) => {
    if (onShieldClick) shieldClickCallback = onShieldClick;
    const images = await db.getAllImages();
    savedShieldsList.innerHTML = "";

    images.forEach((image) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "customShieldItem";

      const preview = document.createElement("img");
      preview.src = image.data;
      preview.className = "shieldItemImg";
      item.appendChild(preview);

      const name = document.createElement("span");
      name.className = "shieldItemName";
      name.textContent = image.fileName;
      item.appendChild(name);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "deleteCustomShieldBtn";
      deleteButton.innerHTML =
        '<span class="material-symbols-outlined">delete</span>';
      deleteButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this image?")) {
          await db.deleteImage(image.fileName);
          await loadSavedShields();
        }
      });
      item.appendChild(deleteButton);

      item.addEventListener("click", () => shieldClickCallback?.(image));
      savedShieldsList.appendChild(item);
    });
  };

  const init = () => {
    db = window.customImages;
    uploadField = document.getElementById("shieldUploadField");
    fileInput = document.getElementById("uploadCustomShield");
    savedShieldsList = document.getElementById("savedCustomShieldsList");
    linkUploadInput = document.getElementById("linkUpload");

    setupDragAndDrop();
    uploadField.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) =>
      handleFileUpload(event.target.files),
    );
    linkUploadInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") handleUrlUpload(event.target.value);
    });

    return loadSavedShields();
  };

  return {
    init,
    loadSavedShields,
    handleFileUpload,
    handleUrlUpload,
  };
})();
