// Handles language controls, theme and reveal animations.

const body = document.body;
const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");
const languageSelector = document.getElementById("languageSelector");
const languageButtons = [...document.querySelectorAll("[data-language]")];
const revealElements = document.querySelectorAll(".reveal");
const compactLanguageQuery = window.matchMedia("(max-width: 850px)");

function getThemeImages() {
  return document.querySelectorAll("[data-theme-image]");
}

function preloadThemeImages() {
  getThemeImages().forEach((image) => {
    [image.dataset.lightSource, image.dataset.darkSource]
      .filter(Boolean)
      .forEach((source) => {
        const preload = new Image();
        preload.src = source;
      });
  });
}

function updateThemeImages(isDark) {
  getThemeImages().forEach((image) => {
    const nextSource = isDark
      ? image.dataset.darkSource
      : image.dataset.lightSource;

    if (!nextSource || image.getAttribute("src") === nextSource) return;
    image.setAttribute("src", nextSource);
  });
}

function translate(key, fallback) {
  return window.daneiI18n?.t(key, fallback) || fallback;
}

function updateThemeLabel() {
  const isDark = body.classList.contains("dark-theme");
  const key = isDark
    ? "accessibility.activateLightTheme"
    : "accessibility.activateDarkTheme";

  themeButton.setAttribute("aria-label", translate(key, "Change theme"));
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  body.classList.toggle("dark-theme", isDark);
  updateThemeImages(isDark);

  themeIcon.textContent = isDark ? "⏾" : "☼";
  themeButton.setAttribute("aria-pressed", String(isDark));

  const themeColor = document.querySelector('meta[name="theme-color"]');

  if (themeColor) {
    themeColor.setAttribute("content", isDark ? "#1a2c3d" : "#ebebeb");
  }

  localStorage.setItem("danei-theme", theme);
  updateThemeLabel();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("danei-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  applyTheme(body.classList.contains("dark-theme") ? "light" : "dark");
}



function observeElements() {
  body.classList.add("reveal-enabled");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
    observer.observe(element);
  });
}

function selectLanguage(language) {
  const changed = window.daneiI18n?.setLanguage(language);

  if (changed) updateThemeLabel();

  return changed;
}

function languageIndex(language) {
  return languageButtons.findIndex((button) => {
    return button.dataset.language === language;
  });
}

function focusLanguageButton(index) {
  const normalizedIndex = (index + languageButtons.length) % languageButtons.length;
  languageButtons[normalizedIndex].focus();
}

function focusCurrentLanguageButton() {
  const currentLanguage = window.daneiI18n?.currentLanguage;
  const index = languageIndex(currentLanguage);

  if (index >= 0) focusLanguageButton(index);
}

function cycleLanguage(step) {
  const currentLanguage = window.daneiI18n?.currentLanguage;
  const currentIndex = languageIndex(currentLanguage);
  const nextIndex = currentIndex < 0 ? 0 : currentIndex + step;
  const normalizedIndex = (nextIndex + languageButtons.length) % languageButtons.length;
  const nextLanguage = languageButtons[normalizedIndex].dataset.language;

  if (!selectLanguage(nextLanguage)) return;

  requestAnimationFrame(focusCurrentLanguageButton);
}

function handleLanguageClick(button) {
  const language = button.dataset.language;
  const isCurrent = language === window.daneiI18n?.currentLanguage;

  if (compactLanguageQuery.matches && isCurrent) {
    cycleLanguage(1);
    return;
  }

  selectLanguage(language);
}

function handleLanguageKeys(event) {
  const currentIndex = languageButtons.indexOf(document.activeElement);

  if (currentIndex < 0) return;

  if (compactLanguageQuery.matches) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      cycleLanguage(1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      cycleLanguage(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectLanguage(languageButtons[0].dataset.language);
      requestAnimationFrame(focusCurrentLanguageButton);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectLanguage(languageButtons.at(-1).dataset.language);
      requestAnimationFrame(focusCurrentLanguageButton);
    }

    return;
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    focusLanguageButton(currentIndex + 1);
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    focusLanguageButton(currentIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    focusLanguageButton(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    focusLanguageButton(languageButtons.length - 1);
  }
}

function bindEvents() {
  themeButton.addEventListener("click", toggleTheme);
  languageSelector.addEventListener("keydown", handleLanguageKeys);

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => handleLanguageClick(button));
  });


  document.addEventListener("danei:languagechange", updateThemeLabel);
}

function start() {
  bindEvents();

  loadTheme();
  observeElements();
  preloadThemeImages();

  window.daneiI18n?.init();
  updateThemeLabel();
}

start();
