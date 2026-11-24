const sMCreationsSaved = document.querySelector("#sMCreationsSaved");

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateToString = (date) => {
  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: second },
  ] = formatter.formatToParts(date);
  return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
};

const SavesNTemplates = (() => {
  let allSaveFiles = [];
  let currentTemplateCategory = "All";

  const updateAutoSave = (post) => {
    let signData = ImportExport.signToJson(post, "post");
    let saveTimestamp = new Date().toISOString();

    let saveFile = {
      signData: signData,
      timestamp: saveTimestamp,
      fileName: "Autosave " + saveTimestamp,
    };

    localStorage.setItem("autoSaveSignData", JSON.stringify(saveFile));
    document.querySelector("#sMCreationsAutosaveDate").textContent =
      "Last updated: " + dateToString(new Date(saveTimestamp));
  };

  const fetchAutoSave = () => {
    const saveFile = localStorage.getItem("autoSaveSignData");
    if (saveFile && JSON.parse(saveFile)) {
      return JSON.parse(saveFile).signData;
    }
    return null;
  };

  const loadAllFiles = () => {
    document.querySelector("#sMCreationsSavedList").innerHTML = "";
    for (const [key, saveFile] of Object.entries(allSaveFiles)) {
      const saveItem = document.createElement("div");
      saveItem.classList.add("sMCreationsSavedItem");
      saveItem.dataset.fileName = saveFile.fileName.toLowerCase();

      const div1 = document.createElement("div");
      div1.innerHTML = `
        <span class="sMCreationsFileName">${saveFile.fileName}</span>
        <span class="sMCreationsFileSaveDate">Last updated: ${dateToString(new Date(saveFile.timestamp))}</span>
      `;

      const div2 = document.createElement("div");
      const loadBtn = document.createElement("button");
      loadBtn.textContent = "Load";

      const renameBtn = document.createElement("button");
      renameBtn.textContent = "Rename";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "redButton";
      deleteBtn.textContent = "Delete";

      div2.appendChild(loadBtn);
      div2.appendChild(renameBtn);
      div2.appendChild(deleteBtn);

      saveItem.appendChild(div1);
      saveItem.appendChild(div2);
      document.querySelector("#sMCreationsSavedList").appendChild(saveItem);

      loadBtn.addEventListener("click", () => {
        const signData = saveFile.signData;
        if (
          signData &&
          confirm(
            "Are you sure you want to load this file? Unsaved changes will be lost.",
          )
        ) {
          document.querySelector("#sMCreationsFileName").value =
            saveFile.fileName;
          App.setPost(ImportExport.jsonToSign(signData));
          App.resetSelectors();
          formHandler.updateForm();
          App.redraw();
        }
      });

      renameBtn.addEventListener("click", () => {
        const newFileName = prompt(
          "Enter a new name for this file:",
          saveFile.fileName,
        );
        if (newFileName) {
          saveFile.fileName = newFileName;
          allSaveFiles[key] = saveFile;
          localStorage.setItem("savedSignData", JSON.stringify(allSaveFiles));
          loadAllFiles();
        }
      });

      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this file?")) {
          allSaveFiles.splice(key, 1);
          localStorage.setItem("savedSignData", JSON.stringify(allSaveFiles));
          loadAllFiles();
        }
      });
    }
  };

  const loadTemplateFiles = () => {
    document.querySelector("#sMCreationsTemplatesList").innerHTML = "";

    let itemsToSearch = [];
    if (currentTemplateCategory === "All") {
      for (const category in TemplatePresets) {
        let list = TemplatePresets[category];
        for (const templateName in list) {
          let clone = {
            name: `(${category}) ${templateName.split("_")[1]}`,
            id: templateName,
            data: list[templateName],
          };
          itemsToSearch.push(clone);
        }
      }
    } else {
      let list = TemplatePresets[currentTemplateCategory];
      for (const templateName in list) {
        let clone = {
          name: templateName.split("_")[1],
          id: templateName,
          data: list[templateName],
        };
        itemsToSearch.push(clone);
      }
    }

    for (const template of itemsToSearch) {
      const templateItem = document.createElement("div");
      templateItem.classList.add("sMCreationsTemplateItem");
      templateItem.dataset.templateName = template.id.toLowerCase();

      const templateName = document.createElement("span");
      templateName.textContent = template.name;
      templateName.className = "sMCreationsTemplateName";

      const loadBtn = document.createElement("button");
      loadBtn.textContent = "Load";

      templateItem.appendChild(templateName);
      templateItem.appendChild(loadBtn);

      document
        .querySelector("#sMCreationsTemplatesList")
        .appendChild(templateItem);

      loadBtn.addEventListener("click", () => {
        const signData = template.data;
        if (
          signData &&
          confirm(
            "Are you sure you want to load this " +
              (template.id.includes("POST_") ? "template" : "panel") +
              "? Unsaved changes will be lost.",
          )
        ) {
          document.querySelector("#sMCreationsFileName").value = template.name;

          if (template.id.startsWith("PANEL_")) {
            console.log(template.id, App.getCurrentPanel());
            Object.assign(
              App.getCurrentPanel(),
              ImportExport.jsonToSign(signData)[0],
            );
          } else {
            App.setPost(ImportExport.jsonToSign(signData));
            App.resetSelectors();
          }
          formHandler.updateForm();
          App.redraw();
        }
      });
    }
  };

  const init = () => {
    allSaveFiles = localStorage.getItem("savedSignData");
    if (!allSaveFiles) {
      allSaveFiles = [];
      localStorage.setItem("savedSignData", JSON.stringify([]));
    } else {
      allSaveFiles = JSON.parse(allSaveFiles) || [];
    }

    loadAllFiles();
    loadTemplateFiles();

    lib.appendOption(
      document.querySelector("#sMcreationsTemplateCategory"),
      "All",
      { selected: true },
    );
    for (const key in TemplatePresets) {
      lib.appendOption(
        document.querySelector("#sMcreationsTemplateCategory"),
        key,
      );
    }

    document
      .querySelector("#sMCreationsReset")
      .addEventListener("click", () => {
        if (confirm("Are you sure you want to reset your sign?")) {
          localStorage.removeItem("autoSaveSignData");
          App.setPost(new Post(Post.polePositions[0]));
          App.resetSelectors();
          App.newPanel();
        }
      });

    document
      .querySelector("#sMCreationsSaveAs")
      .addEventListener("click", () => {
        const fileName = document
          .querySelector("#sMCreationsFileName")
          .value.trim();
        if (!fileName) {
          alert("Please enter a file name.");
          return;
        }

        let hasMatch = -1;
        for (const [key, saveFile] of Object.entries(allSaveFiles)) {
          if (saveFile.fileName === fileName) {
            hasMatch = key;
            break;
          }
        }

        if (hasMatch !== -1) {
          if (
            !confirm(
              "A file with this name already exists. Do you want to overwrite it?",
            )
          ) {
            return;
          }
        }

        const signData = ImportExport.signToJson(App.getPost(), "post");
        const saveTimestamp = new Date().toISOString();

        const saveFile = {
          signData: signData,
          timestamp: saveTimestamp,
          fileName: fileName,
        };

        if (hasMatch !== -1) {
          allSaveFiles[hasMatch] = saveFile;
        } else {
          allSaveFiles.push(saveFile);
        }

        localStorage.setItem("savedSignData", JSON.stringify(allSaveFiles));
        loadAllFiles();
      });

    document
      .querySelector("#sMCreationsSearchList")
      .addEventListener("input", () => {
        const searchTerm = document
          .querySelector("#sMCreationsSearchList")
          .value.toLowerCase();
        const savedItems = document.querySelectorAll(".sMCreationsSavedItem");

        for (const item of savedItems) {
          item.style.display = item.dataset.fileName.includes(
            searchTerm.toLowerCase().trim(),
          )
            ? "flex"
            : "none";
        }
      });

    document
      .querySelector("#sMCreationsTemplateSearch")
      .addEventListener("input", () => {
        const searchTerm = document
          .querySelector("#sMCreationsTemplateSearch")
          .value.toLowerCase();
        const savedItems = document.querySelectorAll(
          ".sMCreationsTemplateItem",
        );

        for (const item of savedItems) {
          item.style.display = item.dataset.templateName.includes(
            searchTerm.toLowerCase().trim(),
          )
            ? "flex"
            : "none";
        }
      });

    document
      .querySelector("#sMCreationsTemplateCategory")
      .addEventListener("change", (e) => {
        currentTemplateCategory = e.target.value;
        loadTemplateFiles();
      });
  };

  return {
    init,
    updateAutoSave,
    fetchAutoSave,
  };
})();
