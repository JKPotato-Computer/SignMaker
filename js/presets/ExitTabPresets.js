// default configurations
const exitTabPresets = (() => {
  return {
    Normal: {
      ["Pay Toll"]: {
        textContent: "PAY TOLL",
        backgroundColor: "yellow",
        fontSize: 20,
        fontFamily: "Series E",
        variant: "Normal",
        holderPadding: "2",
        useTrimFormat: true,
      },
      ["TX Exit Sign (2000)"]: {
        minimumHeight: 1.8,
        fontFamily: "Clearview 4W",
        variant: "Normal",
        useTrimFormat: true,
        fullBorder: true,
        borderStyle: "round",
      },
      ["TX EXIT Sign (2018+)"]: {
        minimumHeight: 2.6,
        fontSize: 22,
        enlargeNumerals: true,
        enlargeNumeralsSize: 150,
        spaceLettersNumerals: true,
        fontFamily: "Clearview 4W",
        alignment: "right",
        variant: "Normal",
        useTrimFormat: false,
        fullBorder: true,
        borderStyle: "round",
      },
    },
    HOVVariant2: {
      ["HOV Lane"]: {
        textContent: "HOV LANE",
        backgroundColor: "white",
        fontFamily: "Series E",
        alignment: "center",
        width: "full",
        widthSize: 0,
        variant: "HOVVariant2",
        variantSettings: {
          icon: {
            icon: "",
            isTextBased: false,
            showBackground: true,
            addon: "none",
            iconSize: 3,
            isSquare: true,
            isTollIcon: false,
          },
          partialLeft: {
            separateRow: true,
            horizontalPadding: 0.6,
            verticalPadding: 0.3,
            letterSpacing: 2,
            minWidth: 7,
            spacing: 1.8,
          },
          hovVariant1: {
            height: 0,
            width: 0,
            verticalPadding: 0.125,
            roundCorners: false,
          },
          hovVariant2: {
            height: 2,
            width: 0,
            verticalPadding: 0.125,
          },
        },
        useTrimFormat: true,
      },
    },
  };
})();
