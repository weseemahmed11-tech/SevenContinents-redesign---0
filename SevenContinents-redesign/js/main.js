document.documentElement.classList.add("js");

const siteHeader = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
let headerIsScrolled = false;

const setHeaderState = () => {
  const nextHeaderState = window.scrollY > 12;
  if (!siteHeader || nextHeaderState === headerIsScrolled) return;

  headerIsScrolled = nextHeaderState;
  siteHeader.classList.toggle("is-scrolled", headerIsScrolled);
};

const closeNavigation = () => {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

const toggleNavigation = () => {
  if (!menuToggle || !navigation) return;

  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeNavigation();
    return;
  }

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  requestAnimationFrame(() => navigation.querySelector("a")?.focus());
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
menuToggle?.addEventListener("click", toggleNavigation);

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});

document.addEventListener("keydown", (event) => {
  const isNavigationOpen = menuToggle?.getAttribute("aria-expanded") === "true";
  if (!isNavigationOpen) return;

  if (event.key === "Escape") {
    closeNavigation();
    menuToggle.focus();
    return;
  }

  if (event.key !== "Tab" || window.innerWidth >= 1024) return;

  const focusableElements = [menuToggle, ...navigation.querySelectorAll("a")];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) closeNavigation();
});

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -48px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const heroMedia = document.querySelector("[data-hero-media]");
const heroRoute = document.querySelector("[data-hero-route]");
const heroScene = document.querySelector("[data-atlas-scene]") || heroMedia;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const canRespondToHeroPointer =
  heroScene && heroRoute && window.matchMedia("(min-width: 801px) and (pointer: fine)").matches;

if (canRespondToHeroPointer) {
  let routeFrame = 0;

  heroScene.addEventListener("pointermove", (event) => {
    if (motionPreference.matches) return;
    cancelAnimationFrame(routeFrame);
    routeFrame = requestAnimationFrame(() => {
      const bounds = heroScene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroRoute.style.setProperty("--route-shift-x", `${(x * 5).toFixed(2)}px`);
      heroRoute.style.setProperty("--route-shift-y", `${(y * 4).toFixed(2)}px`);
    });
  });

  heroScene.addEventListener("pointerleave", () => {
    cancelAnimationFrame(routeFrame);
    heroRoute.style.setProperty("--route-shift-x", "0px");
    heroRoute.style.setProperty("--route-shift-y", "0px");
  });
}

const serviceOptions = [...document.querySelectorAll("[data-service-option]")];
const serviceDetailTitle = document.querySelector("[data-service-detail-title]");
const serviceDetailCopy = document.querySelector("[data-service-detail-copy]");
const servicePanel = document.getElementById("atlas-service-detail");
const serviceImage = document.querySelector("[data-service-image]");
const serviceCount = document.querySelector("[data-service-count]");
const servicePhotos = [
  "imgi_9_asia-1.webp", "imgi_22_europe-2.webp", "imgi_18_australia-1.webp",
  "imgi_21_europe-1.webp", "imgi_15_america-1.webp", "imgi_8_philippines-3.webp",
  "imgi_22_europe-2.webp", "imgi_7_philippines-2.webp",
];
let selectedServiceIndex = 0;
const serviceDetails = [
  {
    title: "Air, Sea and Land Travel Reservations",
    copy: "Reservations for your flights, sea voyages and land travel.",
  },
  {
    title: "Hotel Bookings",
    copy: "Hotel stays booked to suit your trip.",
  },
  {
    title: "Ticketing/E-Tickets",
    copy: "Tickets and e-tickets issued and managed for you.",
  },
  {
    title: "Travel Documentation Services",
    copy: "Help preparing the documents your trip requires.",
  },
  {
    title: "Ground Transportation (Car/Bus Rentals, Train Tickets)",
    copy: "Car and bus rentals and train tickets, arranged for you.",
  },
  {
    title: "Domestic Flights/Packaged Tours",
    copy: "Domestic flights and ready-made tour packages.",
  },
  {
    title: "Foreign Tours/Land Arrangements",
    copy: "Foreign tours with land arrangements handled for you.",
  },
  {
    title: "Travel Insurance",
    copy: "Travel insurance arranged for your journey.",
  },
];

const selectService = (index, moveFocus = false) => {
  if (!serviceOptions.length || !serviceDetailTitle || !serviceDetailCopy) return;

  const safeIndex = Math.max(0, Math.min(index, serviceOptions.length - 1));
  const selectedOption = serviceOptions[safeIndex];
  const detail = serviceDetails[safeIndex];
  const changed = selectedServiceIndex !== safeIndex;
  selectedServiceIndex = safeIndex;

  serviceOptions.forEach((option, optionIndex) => {
    const isSelected = optionIndex === safeIndex;
    option.classList.toggle("is-active", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
    option.tabIndex = isSelected ? 0 : -1;
    option.id = `atlas-service-tab-${optionIndex}`;
  });

  serviceDetailTitle.textContent = detail.title;
  serviceDetailCopy.textContent = detail.copy;
  servicePanel?.setAttribute("aria-labelledby", selectedOption.id);
  if (serviceCount) serviceCount.textContent = `${String(safeIndex + 1).padStart(2, "0")} / 08`;
  if (serviceImage) serviceImage.src = `images/optimized/${servicePhotos[safeIndex]}`;
  if (changed && !motionPreference.matches && serviceDetailTitle.animate) {
    serviceDetailTitle.getAnimations().forEach((animation) => animation.cancel());
    serviceDetailTitle.animate(
      [{ opacity: 0.3, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 230, easing: "ease-out" },
    );
  }

  if (moveFocus) selectedOption.focus();
};

serviceOptions.forEach((option, index) => {
  option.addEventListener("click", () => selectService(index));
  option.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? serviceOptions.length - 1 : (index + direction + serviceOptions.length) % serviceOptions.length;
    selectService(nextIndex, true);
  });
});

if (serviceOptions.length > 0) selectService(0);
document.querySelectorAll("[data-service-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextIndex = (selectedServiceIndex + Number(button.dataset.serviceStep) + serviceOptions.length) % serviceOptions.length;
    selectService(nextIndex);
  });
});

const openHashDetails = () => {
  const hashTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  if (!hashTarget) return;
  let parent = hashTarget;
  while (parent) {
    if (parent.matches("details")) parent.open = true;
    parent = parent.parentElement?.closest("details");
  }
};

openHashDetails();
window.addEventListener("hashchange", openHashDetails);

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const galleryItems = [...document.querySelectorAll("[data-gallery-item]")];
const galleryStatus = document.querySelector("[data-gallery-status]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-previous]");
const lightboxNext = document.querySelector("[data-lightbox-next]");

let visibleGalleryItems = galleryItems;
let currentLightboxIndex = 0;
let lastLightboxTrigger = null;

const setLightboxContent = (index) => {
  if (!lightboxImage || !lightboxCaption || visibleGalleryItems.length === 0) return;

  currentLightboxIndex = (index + visibleGalleryItems.length) % visibleGalleryItems.length;
  const item = visibleGalleryItems[currentLightboxIndex];
  const image = item.querySelector("img");
  const caption = item.dataset.caption || image.alt;

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = caption;
};

const closeLightbox = () => {
  if (!lightbox?.open) return;

  lightbox.close();
};

const openLightbox = (item) => {
  if (!lightbox) return;

  lastLightboxTrigger = item;
  setLightboxContent(visibleGalleryItems.indexOf(item));
  lightbox.showModal();
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
};

const applyGalleryFilter = (filter, updateUrl = true) => {
  const availableFilters = filterButtons.map((button) => button.dataset.filter);
  const selectedFilter = availableFilters.includes(filter) ? filter : "all";

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === selectedFilter));
  });

  galleryItems.forEach((item) => {
    item.hidden = selectedFilter !== "all" && item.dataset.category !== selectedFilter;
  });

  visibleGalleryItems = galleryItems.filter((item) => !item.hidden);

  if (galleryStatus) {
    const noun = visibleGalleryItems.length === 1 ? "photo" : "photos";
    galleryStatus.textContent = `${visibleGalleryItems.length} ${noun} shown.`;
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    if (selectedFilter === "all") {
      url.searchParams.delete("region");
    } else {
      url.searchParams.set("region", selectedFilter);
    }
    window.history.replaceState({}, "", url);
  }

  closeLightbox();
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyGalleryFilter(button.dataset.filter));
});

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrevious?.addEventListener("click", () => setLightboxContent(currentLightboxIndex - 1));
lightboxNext?.addEventListener("click", () => setLightboxContent(currentLightboxIndex + 1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  lastLightboxTrigger?.focus();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setLightboxContent(currentLightboxIndex - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setLightboxContent(currentLightboxIndex + 1);
  }
});

if (filterButtons.length > 0) {
  const initialFilter = new URLSearchParams(window.location.search).get("region") || "all";
  applyGalleryFilter(initialFilter, false);
}

const inquiryForm = document.querySelector("[data-inquiry-form]");
const inquiryFields = [...document.querySelectorAll("[data-validate]")];
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
const formStatus = document.querySelector("[data-form-status]");

const setFieldError = (field, message) => {
  const errorElement = document.querySelector(`[data-error-for="${field.id}"]`);

  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (!errorElement) return;

  errorElement.textContent = message;
  errorElement.classList.toggle("is-visible", Boolean(message));
};

const getFieldError = (field) => {
  const label = field.labels?.[0]?.textContent.trim() || "This field";

  if (field.required && field.value.trim() === "") {
    return `${label} is required.`;
  }

  if (field.validity.typeMismatch) {
    return "Enter a valid email address.";
  }

  if (field.validity.badInput) {
    return `Enter a valid ${label.toLowerCase()}.`;
  }

  if (field.validity.rangeUnderflow) {
    return `${label} must be at least ${field.min}.`;
  }

  if (!field.validity.valid) {
    return `Check the ${label.toLowerCase()} and try again.`;
  }

  return "";
};

const validateField = (field) => {
  const error = getFieldError(field);
  setFieldError(field, error);
  return error === "";
};

const setFormStatus = (type, message) => {
  if (!formStatus) return;

  formStatus.classList.remove("is-success", "is-error", "is-visible");
  formStatus.textContent = message;

  if (type && message) {
    formStatus.classList.add(`is-${type}`, "is-visible");
  }
};

inquiryFields.forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
});

inquiryForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("", "");

  const isValid = inquiryFields.map(validateField).every(Boolean);
  if (!isValid) {
    inquiryFields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitLabel.textContent = "Sending...";

  try {
    const response = await fetch(inquiryForm.action, {
      method: "POST",
      body: new FormData(inquiryForm),
      headers: {
        Accept: "application/json",
      },
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error("Web3Forms submission failed");
    }

    inquiryForm.reset();
    inquiryFields.forEach((field) => setFieldError(field, ""));
    setFormStatus("success", "Thank you. Your inquiry has been sent.");
  } catch {
    setFormStatus("error", "We couldn't send your inquiry. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "Send Inquiry";
    formStatus?.focus({ preventScroll: true });
  }
});
