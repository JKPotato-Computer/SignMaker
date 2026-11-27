const DiagrammicLibrary = (() => {
  const db = IndexDBManager.getDatastore("diagrammicLibrary", {
    keyPath: "diagramName",
  });
  let holder = document.getElementById("diagramPresetGallery");
  let retMethod = null;
  let replacedDiagram = null;

  let hasInit = false;
  const init = async () => {
    if (hasInit) return;

    hasInit = true;
  };

  const addDiagram = async (diagram, diagramName) => {
    const existingDiagrams = await db.getAll();
    const signAlreadyExists = existingDiagrams.some(
      (diagram) => diagram.diagramName === diagramName,
    );

    if (
      !signAlreadyExists ||
      (signAlreadyExists &&
        confirm(
          "A diagram with that name already exists. Do you want to overwrite it?",
        ) == true)
    ) {
      diagram.diagramName = signAlreadyExists
        ? diagramName
        : diagramName || "New Diagram " + (existingDiagrams.length + 1);
    }

    replacedDiagram = signAlreadyExists ? diagram.diagramName : null;

    try {
      await db.put(diagram);
      return true;
    } catch (err) {
      alert("Failed to add diagram: " + err);
      return false;
    }
  };

  const deleteDiagram = async (diagramName) => {
    if (confirm("Are you sure you want to remove " + diagramName + "?")) {
      try {
        await db.delete(diagramName);
      } catch (err) {
        alert("Failed to delete diagram: " + err);
      }
    }
  };

  const renameDiagram = async (oldDiagramName, newDiagramName) => {
    if (oldDiagramName === newDiagramName) {
      return;
    }

    const existingDiagrams = await db.getAll();
    if (
      existingDiagrams.some((diagram) => diagram.diagramName === newDiagramName)
    ) {
      alert("A diagram with that name already exists.");
      return false;
    }

    try {
      const diagram = await db.get(oldDiagramName);
      diagram.diagramName = newDiagramName;
      await db.delete(oldDiagramName);
      await db.put(diagram);
      return true;
    } catch (err) {
      alert("Failed to rename diagram: " + err);
    }
  };

  const getAllDiagramNames = async () => {
    try {
      const diagrams = await db.getAll();
      return diagrams.map((diagram) => diagram.diagramName).filter(Boolean);
    } catch (err) {
      console.error("Failed to load diagram names:", err);
      return [];
    }
  };

  const getDiagramByName = async (diagramName) => {
    if (!diagramName || diagramName === "None") {
      return null;
    }

    if (diagramName.startsWith("preset_")) {
      const presetName = diagramName.split("preset_")[1];
      if (DiagrammaticPresets[presetName]) {
        return JSON.parse(DiagrammaticPresets[presetName]);
      }
    }

    try {
      return await db.get(diagramName);
    } catch (err) {
      console.error("Failed to get diagram:", err);
      return null;
    }
  };

  const loadDiagrams = async (returnMethod) => {
    if (!returnMethod) {
      returnMethod = retMethod;
    } else {
      retMethod = returnMethod;
    }

    const diagrams = await db.getAll();
    holder.innerHTML = "";

    for (const diagram of diagrams) {
      const diagramPresetCard = document.createElement("button");
      diagramPresetCard.className = "diagramPresetCard";
      diagramPresetCard.dataset.name = diagram.diagramName;

      const diagramPresetLabel = document.createElement("span");
      diagramPresetLabel.className = "diagramPresetLabel";
      diagramPresetLabel.textContent = diagram.diagramName;

      const diagramImage = document.createElement("img");
      diagramImage.src = await DiagramDrawing.diagramDataToImage(
        diagram,
        replacedDiagram == diagram.diagramName,
      );

      if (replacedDiagram == diagram.diagramName) {
        replacedDiagram = null;
      }

      diagramPresetCard.appendChild(diagramPresetLabel);
      diagramPresetCard.appendChild(diagramImage);

      holder.appendChild(diagramPresetCard);
      diagramPresetCard.addEventListener("click", () => {
        returnMethod(diagram);
      });
    }
  };

  return {
    init,
    addDiagram,
    deleteDiagram,
    renameDiagram,
    getAllDiagramNames,
    getDiagramByName,
    loadDiagrams,
  };
})();
