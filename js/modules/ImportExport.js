const exportModal = document.querySelector("#downloadContent");

const ImportExport = (() => {
  const init = () => {
    exportModal.showModal();
    document.querySelector("#modalHolder").style.display = "flex";
  };

  return {
    init,
  };
})();

document.querySelector("#exportSign").addEventListener("click", () => {
  ImportExport.init();
});
