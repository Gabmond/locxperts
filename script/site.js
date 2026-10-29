/* ==========================================================
   LOCXPERT site.js
   Each section below does one job. Pages without the matching
   elements simply skip that section.
   ========================================================== */

// Tell the CSS that JavaScript is running (used for the mobile menu)
document.documentElement.classList.add("js");

/* ---------- 1. Scroll and hero animations ---------- */
(function setUpAnimations() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealSelector = [
    ".page-hero-content", ".section-heading", ".trust-card", ".service-card",
    ".process-step", ".featured-grid > *", ".gallery-card", ".value-card",
    ".contact-card", ".about-text", ".about-section > .image-frame", ".booking-form",
    ".cta-section > *"
  ].join(",");

  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  const siblingCounts = new Map();
  document.querySelectorAll(revealSelector).forEach(function (element) {
    const parent = element.parentElement;
    const siblingIndex = siblingCounts.get(parent) || 0;
    siblingCounts.set(parent, siblingIndex + 1);
    element.style.setProperty("--reveal-delay", Math.min(siblingIndex * 80, 320) + "ms");
    element.classList.add("reveal-on-scroll");
    observer.observe(element);
  });
})();

/* ---------- 2. Footer year ---------- */
(function setCopyrightYear() {
  const yearElement = document.getElementById("copyright-year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();
})();

/* ---------- 3. Mobile navigation ---------- */
(function setUpNavigation() {
  const toggle = document.querySelector(".nav-toggle, .menu-toggle");
  const menu = document.getElementById("site-navigation");
  if (!toggle || !menu) return;

  function setOpen(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (toggle.classList.contains("menu-toggle")) {
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close when a link is chosen
  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  // Close with the Escape key and return focus to the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when the screen becomes wide enough for the full menu
  window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
    if (event.matches) setOpen(false);
  });
})();

/* ---------- 4. Missing images ----------
   If a photo file is not there yet, hide the broken image so the
   styled placeholder underneath shows instead. */
(function handleMissingImages() {
  function markMissing(image) {
    const frame = image.closest(".image-frame");
    if (frame) {
      frame.classList.add("is-missing");
      const galleryButton = frame.closest(".gallery-open");
      if (galleryButton) galleryButton.disabled = true; // nothing to enlarge yet
    } else {
      image.hidden = true; // for example, the logo
    }
  }

  document.querySelectorAll(".image-frame img, .logo-image").forEach(function (image) {
    if (image.complete && image.naturalWidth === 0) {
      markMissing(image);
    } else {
      image.addEventListener("error", function () { markMissing(image); });
    }
  });
})();

/* ---------- 5. Gallery filter and lightbox ---------- */
(function setUpGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  // Filtering
  const filterButtons = document.querySelectorAll(".filter-button");
  const cards = grid.querySelectorAll(".gallery-card");
  const status = document.getElementById("gallery-status");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      cards.forEach(function (card) {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
      if (status) status.textContent = "Showing " + visibleCount + " image" + (visibleCount === 1 ? "" : "s") + ".";
    });
  });

  // Lightbox (the native <dialog> handles the Escape key and keyboard focus)
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeButton = document.getElementById("lightbox-close");
  if (!lightbox || typeof lightbox.showModal !== "function") return;

  grid.addEventListener("click", function (event) {
    const button = event.target.closest(".gallery-open");
    if (!button || button.disabled) return;
    const image = button.querySelector("img");
    const caption = button.closest(".gallery-card").querySelector("figcaption");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption ? caption.textContent : "";
    lightbox.showModal();
  });

  closeButton.addEventListener("click", function () { lightbox.close(); });
  // Clicking the dark area outside the picture also closes it
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) lightbox.close();
  });
})();

/* ---------- 6. Booking form and WhatsApp message ---------- */
(function setUpBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const WHATSAPP_NUMBER = "2347063916558";
  const MAX_PHOTOS = 5;
  const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const nameInput = document.getElementById("full-name");
  const phoneInput = document.getElementById("phone-number");
  const serviceSelect = document.getElementById("requested-service");
  const dateInput = document.getElementById("appointment-date");
  const areaInput = document.getElementById("lagos-area");
  const detailsInput = document.getElementById("loc-details");
  const photoInput = document.getElementById("loc-photos");
  const photoList = document.getElementById("photo-list");
  const result = document.getElementById("form-result");

  /* --- Today's date as YYYY-MM-DD in the visitor's own time zone --- */
  function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }
  dateInput.min = todayString(); // blocks past dates in the date picker

  /* --- Preselect a service from ?service=starter-locs ---
     We only accept values that already exist in the dropdown. */
  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (requestedService) {
    const match = Array.from(serviceSelect.options).find(function (option) {
      return option.value !== "" && option.value === requestedService;
    });
    if (match) serviceSelect.value = match.value;
  }

  /* --- Error messages --- */
  function showError(input, message) {
    const errorElement = document.getElementById("error-" + input.id);
    if (errorElement) errorElement.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validateName() {
    const ok = nameInput.value.trim().length >= 2;
    showError(nameInput, ok ? "" : "Please enter your full name.");
    return ok;
  }
  function validatePhone() {
    const value = phoneInput.value.trim();
    const digits = value.replace(/\D/g, "");
    const ok = /^[0-9+\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
    showError(phoneInput, ok ? "" : "Please enter a valid phone number, for example +234 706 000 0000.");
    return ok;
  }
  function validateService() {
    const ok = serviceSelect.value !== "";
    showError(serviceSelect, ok ? "" : "Please choose a service, or select Not Sure Yet.");
    return ok;
  }
  function validateDate() {
    let message = "";
    if (!dateInput.value) message = "Please choose your preferred appointment date.";
    else if (dateInput.value < todayString()) message = "Please choose today or a future date.";
    showError(dateInput, message);
    return message === "";
  }
  function validateArea() {
    const ok = areaInput.value.trim().length >= 2;
    showError(areaInput, ok ? "" : "Please tell us your Lagos area or neighbourhood.");
    return ok;
  }

  // Check each field when the visitor leaves it, and re-check while fixing an error
  [[nameInput, validateName], [phoneInput, validatePhone], [serviceSelect, validateService],
   [dateInput, validateDate], [areaInput, validateArea]].forEach(function (pair) {
    const input = pair[0];
    const check = pair[1];
    input.addEventListener("blur", check);
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") check();
    });
    input.addEventListener("change", function () {
      if (input.getAttribute("aria-invalid") === "true") check();
    });
  });

  /* --- Photographs: choose, preview, remove (nothing is uploaded anywhere) --- */
  let selectedPhotos = [];
  const previewUrls = new Map();

  function syncPhotoInput() {
    // Keep the real file input in step with our list
    const transfer = new DataTransfer();
    selectedPhotos.forEach(function (file) { transfer.items.add(file); });
    photoInput.files = transfer.files;
  }

  function renderPhotoList() {
    photoList.textContent = "";
    selectedPhotos.forEach(function (file, index) {
      if (!previewUrls.has(file)) previewUrls.set(file, URL.createObjectURL(file));

      const item = document.createElement("li");
      item.className = "photo-item";

      const thumb = document.createElement("img");
      thumb.className = "photo-thumb";
      thumb.src = previewUrls.get(file);
      thumb.alt = ""; // decorative: the file name is shown beside it

      const name = document.createElement("span");
      name.className = "photo-name";
      name.textContent = file.name + " (" + (file.size / 1024 / 1024).toFixed(1) + " MB)";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "photo-remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove photo " + file.name);
      remove.addEventListener("click", function () {
        URL.revokeObjectURL(previewUrls.get(file));
        previewUrls.delete(file);
        selectedPhotos.splice(index, 1);
        syncPhotoInput();
        renderPhotoList();
        showError(photoInput, "");
        photoInput.focus();
      });

      item.append(thumb, name, remove);
      photoList.append(item);
    });
  }

  photoInput.addEventListener("change", function () {
    const problems = [];
    Array.from(photoInput.files).forEach(function (file) {
      const duplicate = selectedPhotos.some(function (existing) {
        return existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified;
      });
      if (duplicate) return;
      if (ALLOWED_TYPES.indexOf(file.type) === -1) {
        problems.push(file.name + " is not a JPEG, PNG or WebP image.");
      } else if (file.size > MAX_PHOTO_BYTES) {
        problems.push(file.name + " is larger than 10 MB.");
      } else if (selectedPhotos.length >= MAX_PHOTOS) {
        problems.push("You can select up to " + MAX_PHOTOS + " photos. " + file.name + " was not added.");
      } else {
        selectedPhotos.push(file);
      }
    });
    syncPhotoInput();
    renderPhotoList();
    showError(photoInput, problems.join(" "));
  });

  /* --- Build the WhatsApp message --- */
  function formatDate(dateString) {
    const parts = dateString.split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function buildMessage() {
    const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
    const lines = [
      "Hello LocxPert, I would like to request a consultation.",
      "",
      "Name: " + nameInput.value.trim(),
      "Phone: " + phoneInput.value.trim(),
      "Requested service: " + serviceName,
      "Preferred date: " + formatDate(dateInput.value),
      "Lagos area: " + areaInput.value.trim()
    ];
    if (detailsInput.value.trim()) {
      lines.push("About my locs / desired result: " + detailsInput.value.trim());
    }
    lines.push("", "I understand that pricing is determined during consultation. Please let me know about availability.");
    if (selectedPhotos.length > 0) {
      lines.push("I selected " + selectedPhotos.length + " photo" + (selectedPhotos.length === 1 ? "" : "s") +
        " on the website and will attach " + (selectedPhotos.length === 1 ? "it" : "them") + " here in WhatsApp.");
    }
    return lines.join("\n");
  }

  function showResult(url) {
    result.hidden = false;
    result.textContent = "";

    const first = document.createElement("p");
    first.textContent = "WhatsApp should now be opening with your message prepared. Opening WhatsApp does not send it: please review the message, press send, and wait for LocxPert to reply.";
    result.append(first);

    if (selectedPhotos.length > 0) {
      const photos = document.createElement("p");
      photos.textContent = "Your photos have not been sent. Please attach them manually in WhatsApp.";
      result.append(photos);
    }

    const last = document.createElement("p");
    last.textContent = "Your appointment is not confirmed until LocxPert has agreed the service, price, date, time and location with you. ";
    const fallback = document.createElement("a");
    fallback.href = url;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "WhatsApp did not open? Open it here.";
    last.append(fallback);
    result.append(last);

    result.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    result.hidden = true;

    // Run every check (don't stop at the first problem)
    const checks = [
      [nameInput, validateName()], [phoneInput, validatePhone()], [serviceSelect, validateService()],
      [dateInput, validateDate()], [areaInput, validateArea()]
    ];
    const firstInvalid = checks.find(function (pair) { return !pair[1]; });
    if (firstInvalid) {
      firstInvalid[0].focus();
      return;
    }

    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildMessage());

    // Open WhatsApp in a new tab, keeping the browser's security protections
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.append(link);
    link.click();
    link.remove();

    showResult(url);
  });
})();
