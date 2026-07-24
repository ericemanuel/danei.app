// Applies and persists Danei translations registered by the locale files.

class DaneiI18n {
  constructor() {
    this.supportedLanguages = ["pt", "en", "es"];
    this.languageTags = {
      pt: "pt-BR",
      en: "en",
      es: "es",
    };
    this.languagePaths = {
      pt: "/pt/",
      en: "/en/",
      es: "/es/",
    };
    this.socialCards = {
      pt: {
        url: "https://danei.app/pt/social-card.png",
        alt: "Danei — Seu dinheiro, seu controle.",
      },
      en: {
        url: "https://danei.app/en/social-card.png",
        alt: "Danei — Your money, your control.",
      },
      es: {
        url: "https://danei.app/es/social-card.png",
        alt: "Danei — Tu dinero, tu control.",
      },
    };
    this.siteUrl = "https://danei.app";
    this.defaultLanguage = "pt";
    this.storageKey = "danei-language";
    this.currentLanguage = this.defaultLanguage;
    this.translations = {};
  }

  matchLanguage(language) {
    if (!language) return null;

    const normalized = language.toLowerCase();

    if (normalized.startsWith("pt")) return "pt";
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("es")) return "es";

    return null;
  }

  normalizeLanguage(language) {
    return this.matchLanguage(language) || this.defaultLanguage;
  }

  getRouteLanguage(pathname = window.location.pathname) {
    const normalizedPath = `/${pathname.split("/").filter(Boolean).join("/")}`;
    const routeLanguages = {
      "/pt": "pt",
      "/en": "en",
      "/es": "es",
    };

    if (normalizedPath === "/") return this.defaultLanguage;

    return routeLanguages[normalizedPath] || null;
  }

  getLanguageFromPathname(pathname = window.location.pathname) {
    return this.getRouteLanguage(pathname) || this.defaultLanguage;
  }

  getPathForLanguage(language) {
    const normalizedLanguage = this.normalizeLanguage(language);

    return this.languagePaths[normalizedLanguage];
  }

  getInitialLanguage() {
    const routeLanguage = this.getRouteLanguage();

    return routeLanguage || this.defaultLanguage;
  }

  getCanonicalUrl() {
    const path =
      window.location.pathname === "/"
        ? "/"
        : this.getPathForLanguage(this.currentLanguage);

    return new URL(path, this.siteUrl).href;
  }

  getDictionary(language) {
    return window.DANEI_LOCALES?.[language] || null;
  }

  getValue(key) {
    return key.split(".").reduce((value, segment) => {
      if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
        return value[segment];
      }

      return undefined;
    }, this.translations);
  }

  t(key, fallback = "") {
    const value = this.getValue(key);
    return typeof value === "string" ? value : fallback;
  }

  findElements(root, selector) {
    const elements = [];

    if (root instanceof Element && root.matches(selector)) {
      elements.push(root);
    }

    if (root?.querySelectorAll) {
      elements.push(...root.querySelectorAll(selector));
    }

    return elements;
  }

  translateText(root) {
    this.findElements(root, "[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);

      if (translation) element.textContent = translation;
    });
  }

  translateAttribute(root, attribute) {
    const selector = `[data-i18n-${attribute}]`;

    this.findElements(root, selector).forEach((element) => {
      const key = element.getAttribute(`data-i18n-${attribute}`);
      const translation = this.t(key);

      if (translation) element.setAttribute(attribute, translation);
    });
  }

  translateElement(root = document) {
    this.translateText(root);
    this.translateAttribute(root, "aria-label");
    this.translateAttribute(root, "alt");
    this.translateAttribute(root, "title");
    this.translateAttribute(root, "placeholder");
  }

  updateMetadata() {
    document.documentElement.lang = this.languageTags[this.currentLanguage];

    const title = this.t("meta.title");
    const description = this.t("meta.description");
    const pageUrl = this.getCanonicalUrl();
    const socialCard = this.socialCards[this.currentLanguage];
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const openGraphUrlMeta = document.querySelector('meta[property="og:url"]');
    const socialTitleMetas = document.querySelectorAll(
      'meta[property="og:title"], meta[name="twitter:title"]',
    );
    const socialDescriptionMetas = document.querySelectorAll(
      'meta[property="og:description"], meta[name="twitter:description"]',
    );
    const socialImageMetas = document.querySelectorAll(
      'meta[property="og:image"], meta[name="twitter:image"]',
    );
    const socialImageAltMetas = document.querySelectorAll(
      'meta[property="og:image:alt"], meta[name="twitter:image:alt"]',
    );

    if (title) {
      document.title = title;
      socialTitleMetas.forEach((meta) => meta.setAttribute("content", title));
    }

    if (description && descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }

    if (description) {
      socialDescriptionMetas.forEach((meta) => {
        meta.setAttribute("content", description);
      });
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", pageUrl);
    }

    if (openGraphUrlMeta) {
      openGraphUrlMeta.setAttribute("content", pageUrl);
    }

    if (socialCard) {
      socialImageMetas.forEach((meta) => {
        meta.setAttribute("content", socialCard.url);
      });
      socialImageAltMetas.forEach((meta) => {
        meta.setAttribute("content", socialCard.alt);
      });
    }
  }

  updateLanguageSelector() {
    const selector = document.getElementById("languageSelector");
    const buttons = [...document.querySelectorAll("[data-language]")];
    const activeIndex = buttons.findIndex((button) => {
      return button.dataset.language === this.currentLanguage;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.language === this.currentLanguage;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    if (!selector || activeIndex < 0) return;

    selector.style.setProperty("--language-index", String(activeIndex));

    requestAnimationFrame(() => {
      selector.classList.add("ready");
    });
  }

  applyTranslations() {
    this.updateMetadata();
    this.translateElement(document);
    this.updateLanguageSelector();
  }

  setLanguage(language, persist = true) {
    const normalizedLanguage = this.normalizeLanguage(language);
    const requestedDictionary = this.getDictionary(normalizedLanguage);
    const fallbackDictionary = this.getDictionary(this.defaultLanguage);

    if (requestedDictionary) {
      this.currentLanguage = normalizedLanguage;
      this.translations = requestedDictionary;
    } else if (fallbackDictionary) {
      this.currentLanguage = this.defaultLanguage;
      this.translations = fallbackDictionary;
    } else {
      console.error("No Danei language dictionaries were loaded.");
      return false;
    }

    if (persist) {
      localStorage.setItem(this.storageKey, this.currentLanguage);
    }

    this.applyTranslations();

    document.dispatchEvent(
      new CustomEvent("danei:languagechange", {
        detail: {
          language: this.currentLanguage,
        },
      }),
    );

    return true;
  }

  init() {
    return this.setLanguage(this.getInitialLanguage(), false);
  }
}

window.daneiI18n = new DaneiI18n();
