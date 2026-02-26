const THEME_CLASS_PREFIX = "theme--";

export function setTheme(modeOrFlower: string): void {
  const body = document.body;
  const toRemove: string[] = [];
  body.classList.forEach((cls) => {
    if (cls.startsWith(THEME_CLASS_PREFIX)) {
      toRemove.push(cls);
    }
  });
  toRemove.forEach((cls) => body.classList.remove(cls));

  if (modeOrFlower === "start") {
    body.classList.add("theme--start");
    return;
  }
  if (modeOrFlower === "quiz") {
    body.classList.add("theme--quiz");
    return;
  }

  // Flower-specific themes
  const themeMap: Record<string, string> = {
    lalea: "theme--lalea",
    bujor: "theme--bujor",
    trandafir: "theme--trandafir",
    margareta: "theme--margareta",
    floarea_soarelui: "theme--floarea-soarelui",
    floare_albastra: "theme--floare-albastra",
  };

  const flowerTheme = themeMap[modeOrFlower];
  body.classList.add(flowerTheme ?? "theme--quiz");
}

export function preloadImages(): void {
  const srcs = [
    "/assets/bg-start.png",
    "/assets/bg-lalea.png",
    "/assets/bg-bujor.png",
    "/assets/bg-trandafir.png",
    "/assets/bg-margareta.png",
    "/assets/bg-floarea-soarelui.png",
    "/assets/bg-floare-albastra.png",
  ];
  srcs.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
