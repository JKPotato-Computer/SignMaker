const SignMakerSetup = (() => {
  const loadingScreen = () => {
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

        if (!StorageManager.getItem("closedWelcome")) {
          setupScreen();
        }

        window.setTimeout(() => loadingScreen.remove(), 1000);
      }, 150);
    });
  };

  const setupScreen = () => {
    const setupScreen = document.querySelector("#welcomeToSignMaker");
    document.querySelector("#modalHolder").style.display = "flex";
    document.querySelector("#welcomeToSignMaker").showModal();

    setupScreen.addEventListener("cancel", (event) => {
      event.preventDefault();
    });

    setupScreen.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // intro slide
    const introSlide = setupScreen.querySelector("#introSlide");
    const colors = [
      "rgb(167, 196, 255)",
      "rgb(101, 152, 255)",
      "rgb(121, 166, 255)",
      "rgb(87, 143, 255)",
      "rgb(193, 214, 255)",
    ];
    const lighterColors = [
      "rgb(127, 164, 238)",
      "rgb(135, 161, 212)",
      "rgb(121, 163, 236)",
      "rgb(117, 160, 246)",
      "rgb(158, 192, 255)",
    ];
    for (let i = 0; i < 22; i++) {
      const triangle = document.createElement("div");
      triangle.classList.add("welcomeAnim_triangle");
      triangle.style.left = `${((i % 12) - 1.5) * 10}%`;
      triangle.style.backgroundColor = `${lighterColors[i % 6]}`;
      triangle.style.transform = `scale(${Math.random() * 0.5 + 0.75})`;

      if (i >= 12) {
        triangle.style.zIndex = "2";
        triangle.style.backgroundColor = `${colors[i % 6]}`;
        triangle.style.transform = `scale(${Math.random() * 0.5 + 0.25})`;
      }

      introSlide.querySelector("#welcomeAnim_background").appendChild(triangle);
    }

    introSlide.querySelector("#welcomeAnim_background").style.top = "100%";
    introSlide.querySelector("#welcomeAnim_grass").style.top = "80%";
    introSlide.querySelector("#welcomeAnim_sign").style.top = "125%";
    introSlide.querySelector("#welcomeAnim_sign").style.scale = "1.3";

    introSlide.querySelector(".welcomeAnim_signHolder > img").style.visibility =
      "hidden";
    introSlide.querySelector(".welcomeAnim_signHolder > span").style.display =
      "none";

    introSlide.querySelector(".welcomeAnim_poleGantry.left").style.left = "5%";
    introSlide.querySelector(".welcomeAnim_poleGantry.left").style.top = "125%";
    introSlide.querySelector(".welcomeAnim_poleGantry.right").style.top =
      "125%";
    introSlide.querySelector(".welcomeAnim_poleGantry.right").style.left =
      "97.5%";
    introSlide.querySelector(".welcomeAnim_poleGantry.left").style.height =
      "0%";
    introSlide.querySelector(".welcomeAnim_poleGantry.right").style.height =
      "0%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.top").style.width =
      "92.5%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.bottom").style.width =
      "92.5%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.top").style.left =
      "5%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.bottom").style.left =
      "5%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.top").style.top =
      "120%";
    introSlide.querySelector(".welcomeAnim_poleHorizontal.bottom").style.top =
      "135%";

    setTimeout(() => {
      // fly in grass and background
      introSlide.classList.add("animation-in-progress");
      introSlide.querySelector("#welcomeAnim_background").style.top = "";
      introSlide.querySelector("#welcomeAnim_grass").style.top = "0";
      introSlide.style.backgroundColor = `rgb(128, 171, 255)`;

      setTimeout(() => {
        // left/right pole gantry
        introSlide.querySelector(".welcomeAnim_poleGantry.left").style.height =
          "";
        introSlide.querySelector(".welcomeAnim_poleGantry.right").style.height =
          "";
        introSlide.querySelector(".welcomeAnim_poleGantry.left").style.top = "";
        introSlide.querySelector(".welcomeAnim_poleGantry.right").style.top =
          "";
        introSlide.querySelector(".welcomeAnim_poleGantry.left").style.left =
          "";
        introSlide.querySelector(".welcomeAnim_poleGantry.right").style.left =
          "";

        introSlide.querySelector(
          ".welcomeAnim_poleHorizontal.top",
        ).style.width = "";
        introSlide.querySelector(
          ".welcomeAnim_poleHorizontal.bottom",
        ).style.width = "";
        introSlide.querySelector(".welcomeAnim_poleHorizontal.top").style.left =
          "";
        introSlide.querySelector(
          ".welcomeAnim_poleHorizontal.bottom",
        ).style.left = "";
        introSlide.querySelector(".welcomeAnim_poleHorizontal.top").style.top =
          "";
        introSlide.querySelector(
          ".welcomeAnim_poleHorizontal.bottom",
        ).style.top = "";
        introSlide.querySelector("#welcomeAnim_sign").style.top = "";
        introSlide.querySelector("#welcomeAnim_sign").style.scale = "1";

        setTimeout(() => {
          introSlide.querySelector(
            ".welcomeAnim_signHolder > img",
          ).style.visibility = "";
          introSlide.querySelector(
            ".welcomeAnim_signHolder > img",
          ).style.transform = "rotate(366.7deg) scale(.8)";
          introSlide.querySelector(
            ".welcomeAnim_signHolder > img",
          ).style.opacity = "1";
          setTimeout(() => {
            introSlide.style.transition = "none";
            introSlide.style.backgroundColor = `rgb(166, 196, 255)`;
            introSlide.querySelector(
              ".welcomeAnim_signHolder > span",
            ).style.display = "";
            setTimeout(() => {
              introSlide.style.transition = "";
              introSlide.style.backgroundColor = `rgb(128, 171, 255)`;
              introSlide.querySelector(
                ".welcomeAnim_signHolder > span",
              ).style.opacity = "1";

              setTimeout(() => {
                document.querySelector("#introSlide_continue").style.display =
                  "";

                document
                  .querySelector("#introSlide_continue")
                  .addEventListener("click", () => {
                    introSlide.style.display = "none";
                    document.querySelector("#welcomeSlide").style.display = "";
                  });
              }, 1000);
            }, 5);
          }, 1000);
        }, 1000);
      }, 250);
    }, 250);
  };

  document.querySelector("#takeMeOnATour").addEventListener("click", () => {
    localStorage.setItem("closedWelcome", true);
    document.querySelector("#modalHolder").style.display = "none";
    document.querySelector("#welcomeToSignMaker").close();
  });

  loadingScreen();

  return {};
})();
