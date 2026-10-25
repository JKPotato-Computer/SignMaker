const exportModal = document.querySelector("#downloadContent");
const smRender = document.querySelector("#smRender");
const previewImage = document.querySelector("#downloadPreview");

let cssAnchorPolyfillFn = null;
let zoomLevel = 1;

let originalSizeX = null,
  originalSizeY = null;

import("https://unpkg.com/@oddbird/css-anchor-positioning/dist/css-anchor-positioning-fn.js").then(
  (module) => {
    cssAnchorPolyfillFn = module.default;
  },
);

const ImportExport = (() => {
  // serializing & unserializing
  const signToJson = (signContent, type) => {
    const copyValue = (value) => {
      if (Array.isArray(value)) {
        return value.map((item) => copyValue(item));
      }

      if (!value || typeof value !== "object") {
        return value;
      }

      const className = value.constructor?.name;
      if (
        className &&
        MUTCDVariants.MUTCD &&
        Object.hasOwn(MUTCDVariants.MUTCD, className)
      ) {
        return tagCopy(value);
      }

      const copy = {};
      for (const key of Object.keys(value)) {
        copy[key] = copyValue(value[key]);
      }
      return copy;
    };

    const tagCopy = (obj) => {
      if (!obj || typeof obj !== "object") {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => tagCopy(item));
      }

      const copy = {};

      copy._type = obj.constructor.name;
      const proto = Object.getPrototypeOf(obj);
      const constructor = obj.constructor;
      const variableNames = MUTCDVariants.getVariableNames(
        obj.constructor.name,
      );
      const fields =
        variableNames.length > 0
          ? variableNames
          : obj.constructor.name === "Object"
            ? Object.keys(obj)
            : [];

      for (const key of fields) {
        if (!Object.hasOwn(obj, key)) {
          continue;
        }

        if (proto && key in proto) {
          continue;
        }

        if (constructor && Object.hasOwn(constructor, key)) {
          continue;
        }

        copy[key] = copyValue(obj[key]);
      }

      return copy;
    };

    let dataToSerialize = signContent;

    if (type === "post") {
      dataToSerialize = tagCopy(signContent);
    } else if (type === "panels") {
      if (Array.isArray(signContent)) {
        dataToSerialize = signContent.map((panel) => tagCopy(panel));
      }
    }

    return JSON.stringify(dataToSerialize);
  };

  const jsonToSign = (jsonData) => {
    const rawData = JSON.parse(jsonData);

    const convert = (data) => {
      if (Array.isArray(data)) {
        return data.map((elem) => convert(elem));
      }

      if (data && typeof data === "object") {
        const processedData = {};
        for (const key of Object.keys(data)) {
          processedData[key] = convert(data[key]);
        }

        if (
          processedData._type &&
          typeof window[processedData._type] === "function"
        ) {
          const targetClass = window[processedData._type];
          const cleanClass = new targetClass();

          for (const key of Object.keys(processedData)) {
            if (key === "_type") continue;

            if (key in targetClass.prototype) {
              continue;
            }

            if (Object.hasOwn(targetClass, key)) {
              continue;
            }

            cleanClass[key] = processedData[key];
          }

          return cleanClass;
        }

        return processedData;
      }

      return data;
    };

    return convert(rawData);
  };

  // image export
  const fileExportDetails = {
    fileType: "PNG",
    isFullSign: true,
    groupNumbers: [0],
    snapdomData: null,
    rawFileData: null,
    imageScale: 2,
  };

  const updatePreview = async () => {
    smRender.style.setProperty("--zoomLevelDec", 1);
    previewImage.innerHTML = `
      <span>Generating...</span>
    `;

    let anchorSession;
    if (cssAnchorPolyfillFn) {
      anchorSession = await cssAnchorPolyfillFn({
        elements: [smRender, ...smRender.querySelectorAll(".routeNumber")],
      });
    }

    if (fileExportDetails.isFullSign) {
      fileExportDetails.snapdomData = await snapdom(smRender, {
        scale: fileExportDetails.imageScale,
        embedFonts: true,
        compress: true,
      });
    } else {
      // hide posts temporarily
      for (const post of smRender.querySelectorAll(".post")) {
        post.style.display = "none";
      }
      document.querySelector("#panelContainer").style.background = "none";
      document.querySelector("#panelContainer").style.height = "max-content";

      const panelGroupNodeList = smRender.querySelectorAll(
        "#panelContainer > .panelGroupContainer",
      );
      for (let i = 0; i < App.getPost().panels.length; i++) {
        const panelGroup = panelGroupNodeList[i];
        if (fileExportDetails.groupNumbers.includes(i)) {
          panelGroup.style.display = "flex";
        } else {
          panelGroup.style.display = "none";
        }
      }

      fileExportDetails.snapdomData = await snapdom(
        smRender.querySelector("#panelContainer"),
        {
          scale: fileExportDetails.imageScale,
          embedFonts: true,
          compress: true,
        },
      );

      // restore posts
      for (const post of smRender.querySelectorAll(".post")) {
        post.style.display = "";
      }

      document.querySelector("#panelContainer").style.background = "";
      document.querySelector("#panelContainer").style.height = "";

      for (const panel of panelGroupNodeList) {
        panel.style.display = "block";
      }
    }

    if (anchorSession && typeof anchorSession.disconnect === "function") {
      anchorSession.disconnect();
    }

    smRender.style.setProperty("--zoomLevelDec", formHandler.vars.zoomLevel);

    // convert file
    switch (fileExportDetails.fileType) {
      case "JSON":
      case "PNG":
        fileExportDetails.rawFileData =
          await fileExportDetails.snapdomData.toPng();
        break;
      case "SVG":
        fileExportDetails.rawFileData =
          await fileExportDetails.snapdomData.toSvg();
        break;
      default:
        break;
    }
    previewImage.innerHTML = "";

    const elem = fileExportDetails.rawFileData;

    previewImage.appendChild(elem);

    const clientRect = elem.getBoundingClientRect();
    originalSizeX = clientRect.width;
    originalSizeY = clientRect.height;

    document.querySelector("#downloadImageSize").textContent = `${Math.round(
      originalSizeX,
    )} x ${Math.round(originalSizeY)}`;

    elem.style.width = `${originalSizeX * zoomLevel}px`;
    elem.style.height = `${originalSizeY * zoomLevel}px`;
  };

  const init = async () => {
    exportModal.showModal();
    document.querySelector("#modalHolder").style.display = "flex";

    document.querySelector("#downloadPanelList").innerHTML = "";
    for (let i = 0; i < App.getPost().panels.length; i++) {
      const panelListItem = document.createElement("button");
      panelListItem.classList.add("downloadPanelBtn");

      if (fileExportDetails.groupNumbers.includes(i)) {
        panelListItem.classList.add("selected");
      }

      panelListItem.innerHTML = `${i + 1}`;
      document.querySelector("#downloadPanelList").appendChild(panelListItem);

      panelListItem.addEventListener("click", async () => {
        if (fileExportDetails.groupNumbers.includes(i)) {
          fileExportDetails.groupNumbers =
            fileExportDetails.groupNumbers.filter((num) => num !== i);
          panelListItem.classList.remove("selected");
        } else {
          fileExportDetails.groupNumbers.push(i);
          panelListItem.classList.add("selected");
        }
        updatePreview();
      });
    }

    updatePreview();
  };

  const toggleEntirePost = (bool) => {
    fileExportDetails.isFullSign = bool;
    document.querySelector("#downloadPanelContainer").style.display = bool
      ? "none"
      : "";
  };

  const changeFileType = (fileType) => {
    fileExportDetails.fileType = fileType.toUpperCase();

    document.querySelector("#exportAsPNG").className =
      fileType === "png" ? "selected" : "";
    document.querySelector("#exportAsSVG").className =
      fileType == "svg" ? "selected" : "";
    document.querySelector("#exportAsJSON").className =
      fileType === "json" ? "selected" : "";

    document.querySelector("#downloadSignButton").textContent =
      `Download ${fileType.toUpperCase()}`;
  };

  const setImageScale = (scale) => {
    fileExportDetails.imageScale = Math.max(Math.min(scale, 10), 1);
  };

  const close = () => {
    exportModal.close();
    document.querySelector("#modalHolder").style.display = "none";
  };

  const downloadSign = async (copyToClipboard) => {
    if (!fileExportDetails.rawFileData) {
      await updatePreview();
    }

    if (copyToClipboard) {
      if (fileExportDetails.fileType == "JSON") {
        const jsonOutput = signToJson(
          fileExportDetails.toggleEntirePost
            ? App.getPost()
            : App.getPost().panels.filter((_, i) =>
                fileExportDetails.groupNumbers.includes(i),
              ),
          fileExportDetails.toggleEntirePost ? "post" : "panels",
        );
        await navigator.clipboard.write([
          new ClipboardItem({
            "application/json": new Blob([jsonOutput], {
              type: "application/json",
            }),
          }),
        ]);
      }
    } else {
      let signName = prompt("Enter a name for the sign file:", "MySign");
      if (signName) {
        if (fileExportDetails.fileType == "JSON") {
          const jsonOutput = signToJson(
            fileExportDetails.toggleEntirePost
              ? App.getPost()
              : App.getPost().panels.filter((_, i) =>
                  fileExportDetails.groupNumbers.includes(i),
                ),
            fileExportDetails.toggleEntirePost ? "post" : "panels",
          );
          const blob = new Blob([jsonOutput], {
            type: "text/json",
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${signName}.signmaker`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          await fileExportDetails.snapdomData.download({
            format: fileExportDetails.fileType.toLowerCase(),
            filename: signName,
          });
        }
      }
    }
  };

  return {
    init,
    close,
    updatePreview,
    toggleEntirePost,
    changeFileType,
    setImageScale,
    downloadSign,

    signToJson,
    jsonToSign,
  };
})();

document.querySelector("#exportSign").addEventListener("click", async () => {
  ImportExport.init();
});

exportModal.addEventListener("cancel", (event) => {
  event.preventDefault();
  ImportExport.close();
});

// zoom handler
const updateZoomImage = () => {
  const image = previewImage.querySelector("img, svg");
  if (image) {
    image.style.width = `${originalSizeX * zoomLevel}px`;
    image.style.height = `${originalSizeY * zoomLevel}px`;
  }
};

document
  .querySelector("#downloadImageZoomOut")
  .addEventListener("click", () => {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.1);
    document.querySelector("#downloadImageZoomValue").textContent =
      Math.floor(zoomLevel * 100) + "%";
    updateZoomImage();
  });

document.querySelector("#downloadImageZoomIn").addEventListener("click", () => {
  zoomLevel = Math.min(zoomLevel + 0.1, 10);
  document.querySelector("#downloadImageZoomValue").textContent =
    Math.floor(zoomLevel * 100) + "%";
  updateZoomImage();
});

document
  .querySelector("#downloadImageZoomReset")
  .addEventListener("click", () => {
    zoomLevel = 1;
    document.querySelector("#downloadImageZoomValue").textContent =
      Math.floor(zoomLevel * 100) + "%";
    updateZoomImage();
  });

document.querySelector("#importSign").addEventListener("click", async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".signmaker,application/json";

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    fileInput.remove();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = e.target.result;
        const signContent = ImportExport.jsonToSign(jsonData);

        if (
          signContent instanceof Post &&
          confirm("Are you sure you want to overwrite the post?")
        ) {
          App.setPost(signContent);
        } else if (
          Array.isArray(signContent) &&
          confirm("Are you sure you want to overwrite all your panels?")
        ) {
          App.getPost().panels =
            signContent.length > 0 && Array.isArray(signContent[0])
              ? signContent
              : signContent.map((panel) => [panel]);
        }

        formHandler.updateForm();
        App.redraw();
      };

      reader.readAsText(file);
    }
  });

  fileInput.click();
});
