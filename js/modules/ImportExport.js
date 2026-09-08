const ImportExport = (function () {
  let fileInfo = {
    fileType: "png",
    panel: -1,
  };

  /**
		Download the sign from options
	*/

  function getFile() {
    let screenshotTarget;
    let postClass;

    if (fileInfo.panel == -1) {
      screenshotTarget = document.querySelector("#postContainer");
    } else {
      screenshotTarget = document.getElementById(
        "panel" + fileInfo.panel.toString()
      );
    }

    return screenshotTarget;
  }

  const downloadFile = function (dataURL, ending) {
    let a = document.createElement(`a`);
    a.setAttribute("href", dataURL);
    a.setAttribute("download", "downloadedSign" + ending);
    a.click();
    a.remove();
  };

  const saveSign = async function (file, isPreview, isSVG) {
    let newElem = file.cloneNode(true);
    newElem.style.position = "absolute";
    newElem.style.top = "0";
    newElem.style.left = "0";
    document.body.appendChild(newElem);
    return new Promise((resolve, reject) => {
      let svg = htmlToImage.toSvg(newElem);
      newElem.remove();
      svg
        .then(function (dataUrl) {
          if (isSVG) {
            if (isPreview) {
              resolve(dataUrl);
            }
            downloadFile(dataUrl, ".svg");
            return;
          }

          let tmpCanvas = document.createElement("canvas");
          let ctx = tmpCanvas.getContext("2d");

          let tmpImg = new Image();
          tmpImg.addEventListener("load", onTempImageLoad);
          tmpImg.src = dataUrl;

          tmpCanvas.width = tmpCanvas.height = 512;
          function onTempImageLoad(e) {
            tmpCanvas.width = e.target.width;
            tmpCanvas.height = e.target.height;

            ctx.drawImage(e.target, 0, 0);
            if (isPreview) {
              resolve(tmpCanvas.toDataURL());
            } else {
              downloadFile(tmpCanvas.toDataURL(), ".png");
              resolve(true);
            }
          }
        })
        .catch(function (error) {
          console.error("Error Saving!", error);
        });
    });
  };

  const downloadSign = async function () {
    const downloadPreview = document.getElementById("downloadPreview");
    const entirePost_option = document.getElementById("entirePost");
    const panelContainer = document.getElementById("panelContainer");
    const panelNumberSelector = document.getElementById("singularPanel");

    let background = "";

    if (entirePost_option.checked == true) {
      fileInfo.panel = -1;
      panelNumberSelector.style.display = "none";
      document.getElementById("downloadContents").style.verticalAlign = "10rem";
    } else {
      const panelNumber = document.getElementById("selectPanel");
      fileInfo.panel = panelNumber.value - 1;
      panelNumberSelector.style.display = "block";
      document.getElementById("downloadContents").style.verticalAlign = "";
    }

    if (fileInfo.fileType == "png") {
      saveSign(getFile(), false);
    } else if (fileInfo.fileType == "svg") {
      saveSign(getFile(), false, true);
    }
  };

  const updatePreview = async function () {
    const downloadPreview = document.getElementById("downloadPreview");
    const entirePost_option = document.getElementById("entirePost");
    const panelContainer = document.getElementById("panelContainer");
    const panelNumberSelector = document.getElementById("singularPanel");

    let background = "";

    if (entirePost_option.checked == true) {
      fileInfo.panel = -1;
      panelNumberSelector.style.display = "none";
      document.getElementById("downloadContents").style.verticalAlign = "10rem";
    } else {
      const panelNumber = document.getElementById("selectPanel");
      fileInfo.panel = panelNumber.value - 1;
      panelNumberSelector.style.display = "block";
      document.getElementById("downloadContents").style.verticalAlign = "";
    }

    while (downloadPreview.firstChild) {
      downloadPreview.removeChild(downloadPreview.lastChild);
    }

    const targetImg = new Image();
    targetImg.src = await saveSign(getFile(), true);
    downloadPreview.appendChild(targetImg);
  };

  const updateFileType = function (fileType) {
    fileInfo.fileType = fileType;
    updatePreview();

    if (fileType == "png") {
      document.getElementById("PNG").className = "activated";
      document.getElementById("SVG").className = "";
    } else if (fileType == "svg") {
      document.getElementById("PNG").className = "";
      document.getElementById("SVG").className = "activated";
    }
  };

  return {
    getFile,
    downloadFile,
    saveSign,
    downloadSign,
    updatePreview,
    updateFileType,
  };
})();
