// Defines the reusable Danei app screen showcase component.

const showcaseImageDimensions = {
  "assets/images/panel": { width: 720, height: 1510 },
  "assets/images/history": { width: 720, height: 1510 },
  "assets/images/category": { width: 720, height: 1510 },
};

const requestedShowcaseImageSources = new Set();
const showcaseImagePreloads = new Map();

class DaneiScreenShowcase extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;

    this.dataset.initialized = "true";

    const screen = this.getAttribute("screen") || "panel";
    const imageBase = this.getAttribute("image-base") || "";

    const cardOne = {
      icon: this.getAttribute("card-one-icon") || "✓",
      tone: this.getAttribute("card-one-tone") || "aqua",
      titleKey: `showcases.${screen}.cardOne.title`,
      textKey: `showcases.${screen}.cardOne.text`,
    };

    const cardTwo = {
      icon: this.getAttribute("card-two-icon") || "✦",
      tone: this.getAttribute("card-two-tone") || "violet",
      titleKey: `showcases.${screen}.cardTwo.title`,
      textKey: `showcases.${screen}.cardTwo.text`,
    };

    const showcase = document.createElement("div");
    showcase.className = "screen-showcase";

    showcase.append(
      this.createRipple(),
      this.createFrame(
        imageBase,
        `showcases.${screen}.alt`,
        screen === "panel",
      ),
      this.createFloatingCard(cardOne, "one"),
      this.createFloatingCard(cardTwo, "two"),
    );

    this.append(showcase);
    window.daneiI18n?.translateElement(this);
  }

  createRipple() {
    const ripple = document.createElement("div");
    ripple.className = "screen-showcase-ripple";
    ripple.setAttribute("aria-hidden", "true");

    for (let index = 0; index < 3; index += 1) {
      ripple.append(document.createElement("span"));
    }

    return ripple;
  }

  createFrame(imageBase, imageAltKey, isPriority) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const placeholder = document.createElement("div");
    const placeholderMark = document.createElement("span");
    const placeholderText = document.createElement("small");
    const dimensions = showcaseImageDimensions[imageBase];

    figure.className = "screen-showcase-frame";

    image.src = `${imageBase}-light.png`;
    image.alt = "";
    image.loading = isPriority ? "eager" : "lazy";
    image.decoding = "async";
    image.dataset.themeImage = "true";
    image.dataset.lightSource = `${imageBase}-light.png`;
    image.dataset.darkSource = `${imageBase}-dark.png`;
    image.setAttribute("data-i18n-alt", imageAltKey);

    if (isPriority) {
      image.setAttribute("fetchpriority", "high");
    }

    if (dimensions) {
      image.width = dimensions.width;
      image.height = dimensions.height;
    }

    placeholder.className = "screen-showcase-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholderMark.textContent = "D";
    placeholderText.setAttribute("data-i18n", "showcases.placeholder");
    placeholder.append(placeholderMark, placeholderText);

    image.addEventListener("load", () => {
      figure.classList.remove("screen-showcase-frame-missing");
      this.preloadOppositeThemeImage(image);
    });

    image.addEventListener("error", () => {
      figure.classList.add("screen-showcase-frame-missing");
    });

    figure.append(image, placeholder);

    return figure;
  }

  preloadOppositeThemeImage(image) {
    const currentSource = image.getAttribute("src");
    const oppositeSource =
      currentSource === image.dataset.darkSource
        ? image.dataset.lightSource
        : image.dataset.darkSource;

    if (currentSource) {
      requestedShowcaseImageSources.add(currentSource);
    }

    if (!oppositeSource || requestedShowcaseImageSources.has(oppositeSource)) {
      return;
    }

    const preload = new Image();

    requestedShowcaseImageSources.add(oppositeSource);
    showcaseImagePreloads.set(oppositeSource, preload);
    preload.src = oppositeSource;
  }

  createFloatingCard(card, position) {
    const article = document.createElement("article");
    const icon = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    const text = document.createElement("small");

    article.className = [
      "screen-showcase-card",
      `screen-showcase-card-${position}`,
    ].join(" ");

    icon.className = [
      "screen-showcase-card-icon",
      `screen-showcase-tone-${card.tone}`,
    ].join(" ");

    content.className = "screen-showcase-card-content";
    icon.textContent = card.icon;
    title.setAttribute("data-i18n", card.titleKey);
    text.setAttribute("data-i18n", card.textKey);

    content.append(title, text);
    article.append(icon, content);

    return article;
  }
}

if (!customElements.get("danei-screen-showcase")) {
  customElements.define("danei-screen-showcase", DaneiScreenShowcase);
}
