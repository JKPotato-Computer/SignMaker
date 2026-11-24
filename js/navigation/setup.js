const SignMakerSetup = (() => {
  const loadingScreen = document.querySelector("#signMakerLoadingScreen");
  const loadingContent = loadingScreen.querySelector(
    ".signMakerLoadingContent",
  );
  const progress = loadingContent.querySelector("progress");

  let progressValue = 0;
  const progressTimer = window.setInterval(() => {
    progressValue = Math.min(progressValue + 3, 90);
    progress.value = progressValue;
  }, 100);

  window.addEventListener("load", () => {
    window.clearInterval(progressTimer);
    progress.value = 100;
    window.setTimeout(() => {
      loadingScreen.classList.add("fadeOut");
      window.setTimeout(() => loadingScreen.remove(), 1000);
    }, 150);
  });

  return {};
})();
