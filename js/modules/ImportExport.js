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
  const fileExportDetails = {
    fileType: "PNG",
    isFullSign: true,
    panelNumbers: [0],
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
      fileExportDetails.snapdomData = await snapdom(
        smRender.querySelector("#postContainer"),
        {
          scale: fileExportDetails.imageScale,
          embedFonts: true,
          compress: true,
        },
      );
    } else {
      // hide posts temporarily
      for (const post of smRender.querySelectorAll(".post")) {
        post.style.display = "none";
      }
      document.querySelector("#panelContainer").style.background = "none";
      document.querySelector("#panelContainer").style.height = "max-content";

      const panelNodeList = smRender.querySelectorAll(
        "#panelContainer > .panel",
      );
      for (let i = 0; i < App.getPost().panels.length; i++) {
        const panel = panelNodeList[i];
        if (fileExportDetails.panelNumbers.includes(i)) {
          panel.style.display = "block";
        } else {
          panel.style.display = "none";
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

      for (const panel of panelNodeList) {
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

      if (fileExportDetails.panelNumbers.includes(i)) {
        panelListItem.classList.add("selected");
      }

      panelListItem.innerHTML = `${i + 1}`;
      document.querySelector("#downloadPanelList").appendChild(panelListItem);

      panelListItem.addEventListener("click", async () => {
        if (fileExportDetails.panelNumbers.includes(i)) {
          fileExportDetails.panelNumbers =
            fileExportDetails.panelNumbers.filter((num) => num !== i);
          panelListItem.classList.remove("selected");
        } else {
          fileExportDetails.panelNumbers.push(i);
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
      const blob = await fileExportDetails.snapdomData.toBlob({
        format: fileExportDetails.fileType.toLowerCase(),
      });
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } else {
      let signName = prompt("Enter a name for the sign file:", "MySign");
      if (signName) {
        await fileExportDetails.snapdomData.download({
          format: fileExportDetails.fileType.toLowerCase(),
          filename: signName,
        });
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
