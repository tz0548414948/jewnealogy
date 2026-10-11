/* ===========================================
   מכון לחקר גנאלוגיה · Institute for Genealogy Research
   script.js

   Modules
   - components   loads the shared header & footer
   - header       sticky header, mobile menu, active link, language switch
   - reveal       fade-in on scroll
   - backToTop
   - gallery      accessible lightbox (keyboard, swipe, prev/next)
   - modal        expertise dialogs
   - search       live search for the articles & portfolio pages
   - whatsapp     floating button that carries the form text
   - contactForm  ajax submit with proper feedback
=========================================== */

(function () {

    "use strict";

    /* ---------- helpers ---------- */

    const root = document.documentElement;
    const isEN = root.lang === "en";
    const isRTL = root.dir === "rtl";

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const prefersReducedMotion = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const TEXT = isEN ? {
        menuOpen: "Open navigation menu",
        menuClose: "Close navigation menu",
        close: "Close",
        prev: "Previous image",
        next: "Next image",
        gallery: "Image viewer",
        sending: "Sending…",
        formError: "Something went wrong while sending. Please try again, or write to us on WhatsApp.",
        networkError: "Could not reach the server. Please check your connection and try again.",
        results: (n, total) => `Showing ${n} of ${total}`,
        hello: "Hello,",
        name: "My name is",
        phone: "Phone:",
        email: "Email:"
    } : {
        menuOpen: "פתיחת תפריט ניווט",
        menuClose: "סגירת תפריט ניווט",
        close: "סגור",
        prev: "התמונה הקודמת",
        next: "התמונה הבאה",
        gallery: "מציג תמונות",
        sending: "שולח…",
        formError: "אירעה שגיאה בשליחת הפנייה. אפשר לנסות שוב, או לפנות אלינו בוואטסאפ.",
        networkError: "לא ניתן להתחבר לשרת. כדאי לבדוק את החיבור לאינטרנט ולנסות שוב.",
        results: (n, total) => `מוצגות ${n} מתוך ${total}`,
        hello: "שלום,",
        name: "שמי",
        phone: "טלפון:",
        email: "אימייל:"
    };

    const WHATSAPP_NUMBER = "972556633180";


    /* ======================================================
       COMPONENTS – shared header & footer
    ====================================================== */

    async function loadComponent(targetId, file) {

        const target = document.getElementById(targetId);

        if (!target) return false;

        try {

            const response = await fetch(`/components/${file}`);

            if (!response.ok) {
                throw new Error(`${file}: HTTP ${response.status}`);
            }

            target.innerHTML = await response.text();

            return true;

        } catch (error) {

            console.error("Component failed to load:", error);

            return false;
        }
    }


    /* ======================================================
       HEADER
    ====================================================== */

    function initHeader() {

        const header = $("header");

        if (!header) return;

        const menuButton = $("#menuButton", header);
        const nav = $("nav", header);

        /* compact header after scrolling */

        let ticking = false;

        const onScroll = () => {

            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {
                header.classList.toggle("scrolled", window.scrollY > 30);
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        /* mobile menu */

        if (menuButton && nav) {

            const setMenu = (open) => {
                nav.classList.toggle("show", open);
                menuButton.classList.toggle("active", open);
                menuButton.setAttribute("aria-expanded", String(open));
                menuButton.setAttribute("aria-label", open ? TEXT.menuClose : TEXT.menuOpen);
            };

            setMenu(false);

            menuButton.addEventListener("click", () => {
                setMenu(!nav.classList.contains("show"));
            });

            $$("a", nav).forEach((link) => {
                link.addEventListener("click", () => setMenu(false));
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape" && nav.classList.contains("show")) {
                    setMenu(false);
                    menuButton.focus();
                }
            });

            document.addEventListener("click", (event) => {
                if (nav.classList.contains("show") && !header.contains(event.target)) {
                    setMenu(false);
                }
            });

            window.matchMedia("(min-width: 1101px)").addEventListener("change", (event) => {
                if (event.matches) setMenu(false);
            });
        }

        /* language switch – point straight at the same page in the other language */

        const langSwitch = $(".lang-switch", header);

        if (langSwitch) {

            const here = window.location.pathname;
            let target = null;

            if (here.includes("/he/")) target = here.replace("/he/", "/en/");
            else if (here.includes("/en/")) target = here.replace("/en/", "/he/");

            if (target) {
                langSwitch.href = target + window.location.search + window.location.hash;
            }
        }

        highlightNavigation(header);
    }

    /* mark where the visitor is: the section on the home page, the parent section on inner pages */

    function highlightNavigation(header) {

        const links = $$("nav a", header);

        const setActive = (hash) => {
            links.forEach((link) => {
                const active = hash && link.hash === hash;
                link.classList.toggle("is-active", Boolean(active));
                if (active) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        };

        const path = window.location.pathname;

        if (/\/(projects|partners)\//.test(path)) {
            setActive("#projects");
            return;
        }

        const sections = links
            .map((link) => (link.hash ? document.getElementById(link.hash.slice(1)) : null))
            .filter(Boolean);

        if (!sections.length || !("IntersectionObserver" in window)) return;

        const spy = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive("#" + entry.target.id);
            });

        }, { rootMargin: "-45% 0px -50% 0px" });

        sections.forEach((section) => spy.observe(section));
    }


    /* ======================================================
       FOOTER
    ====================================================== */

    function initFooter() {

        const year = $("#year");

        if (year) year.textContent = String(new Date().getFullYear());
    }


    /* ======================================================
       REVEAL ON SCROLL
    ====================================================== */

    function initReveal() {

        const selector = ".card,.project-card,.section-title,.gallery-item,.about-container," +
            ".article-card,.media-card,.expertise-item,.publication-item,.media-section h2";

        const elements = $$(selector);

        if (!elements.length || !("IntersectionObserver" in window) || prefersReducedMotion()) return;

        elements.forEach((element) => element.classList.add("reveal"));

        const observer = new IntersectionObserver((entries) => {

            let order = 0;

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                const element = entry.target;

                element.style.setProperty("--reveal-delay", `${Math.min(order * 80, 320)}ms`);
                order += 1;

                element.classList.add("is-visible");
                observer.unobserve(element);

                /* hand control back to the element's own hover transitions */

                const cleanup = () => {
                    element.classList.remove("reveal", "is-visible");
                    element.style.removeProperty("--reveal-delay");
                };

                element.addEventListener("transitionend", cleanup, { once: true });
                window.setTimeout(cleanup, 1400);
            });

        }, { rootMargin: "0px 0px -60px 0px", threshold: 0.05 });

        elements.forEach((element) => observer.observe(element));
    }


    /* ======================================================
       BACK TO TOP
    ====================================================== */

    function initBackToTop() {

        const button = $("#backToTop");

        if (!button) return;

        const update = () => button.classList.toggle("visible", window.scrollY > 500);

        window.addEventListener("scroll", update, { passive: true });
        update();

        button.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        });
    }


    /* ======================================================
       GALLERY LIGHTBOX
    ====================================================== */

    function initGallery() {

        const items = $$(".gallery-item");

        if (!items.length) return;

        const box = document.createElement("div");

        box.id = "lightbox";
        box.className = "lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", TEXT.gallery);

        box.innerHTML =
            `<button type="button" class="lightbox-btn lightbox-close" aria-label="${TEXT.close}">&times;</button>` +
            `<button type="button" class="lightbox-btn lightbox-prev" aria-label="${TEXT.prev}">${isRTL ? "&rsaquo;" : "&lsaquo;"}</button>` +
            `<img alt="" decoding="async">` +
            `<button type="button" class="lightbox-btn lightbox-next" aria-label="${TEXT.next}">${isRTL ? "&lsaquo;" : "&rsaquo;"}</button>` +
            `<div class="lightbox-count" dir="ltr" aria-live="polite"></div>`;

        document.body.appendChild(box);

        const image = $("img", box);
        const count = $(".lightbox-count", box);
        const closeButton = $(".lightbox-close", box);
        const prevButton = $(".lightbox-prev", box);
        const nextButton = $(".lightbox-next", box);

        let index = 0;
        let opener = null;

        const show = (newIndex) => {

            index = (newIndex + items.length) % items.length;

            const source = items[index];

            image.src = source.currentSrc || source.src;
            image.alt = source.alt;
            count.textContent = `${index + 1} / ${items.length}`;
        };

        const open = (newIndex) => {

            opener = document.activeElement;

            show(newIndex);

            box.classList.add("show");
            document.body.style.overflow = "hidden";
            closeButton.focus();
        };

        const close = () => {

            box.classList.remove("show");
            image.removeAttribute("src");
            document.body.style.overflow = "";

            if (opener && typeof opener.focus === "function") opener.focus();
        };

        /* "next" is the visual left in Hebrew, the visual right in English */

        const forwardKey = isRTL ? "ArrowLeft" : "ArrowRight";
        const backwardKey = isRTL ? "ArrowRight" : "ArrowLeft";

        items.forEach((item, position) => {

            item.tabIndex = 0;
            item.setAttribute("role", "button");

            item.addEventListener("click", () => open(position));

            item.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(position);
                }
            });
        });

        closeButton.addEventListener("click", close);
        nextButton.addEventListener("click", () => show(index + 1));
        prevButton.addEventListener("click", () => show(index - 1));

        box.addEventListener("click", (event) => {
            if (event.target === box) close();
        });

        document.addEventListener("keydown", (event) => {

            if (!box.classList.contains("show")) return;

            if (event.key === "Escape") close();
            else if (event.key === forwardKey) show(index + 1);
            else if (event.key === backwardKey) show(index - 1);
            else if (event.key === "Tab") {

                /* keep focus inside the dialog */

                const focusable = [closeButton, prevButton, nextButton];
                const position = focusable.indexOf(document.activeElement);
                const step = event.shiftKey ? -1 : 1;

                event.preventDefault();
                focusable[(position + step + focusable.length) % focusable.length].focus();
            }
        });

        /* swipe on touch screens */

        let startX = null;

        box.addEventListener("touchstart", (event) => {
            startX = event.changedTouches[0].clientX;
        }, { passive: true });

        box.addEventListener("touchend", (event) => {

            if (startX === null) return;

            const delta = event.changedTouches[0].clientX - startX;

            startX = null;

            if (Math.abs(delta) < 50) return;

            const forward = isRTL ? delta > 0 : delta < 0;

            show(index + (forward ? 1 : -1));
        }, { passive: true });
    }


    /* ======================================================
       EXPERTISE MODAL
    ====================================================== */

    function initModal() {

        const modal = $("#modal");
        const title = $("#modalTitle");
        const text = $("#modalText");
        const closeButton = modal ? $(".close", modal) : null;

        if (!modal || !title || !text || !closeButton) return;

        const data = isEN ? {

            genealogy: {
                title: "Genealogical Research",
                text: "Locating historical sources and documents, researching family roots, and creating professional family trees."
            },

            documents: {
                title: "Manuscript Analysis",
                text: "Identification and interpretation of Hebrew manuscripts, signatures, Aramaic and Yiddish writings."
            },

            books: {
                title: "Editing & Publishing",
                text: "Editing manuscripts, preparing introductions, completing research and verifying sources."
            }

        } : {

            genealogy: {
                title: "מחקר גנאלוגי",
                text: "איתור מקורות מידע, מסמכים היסטוריים, חיפוש שורשים משפחתיים ובניית אילן יוחסין מקצועי."
            },

            documents: {
                title: "פענוח כתבי יד",
                text: "זיהוי ופענוח חתימות, כתבי יד בעברית, ארמית ויידיש."
            },

            books: {
                title: "עריכה והוצאה לאור",
                text: "עריכת כתבי יד, מבואות לספרים, השלמות ומקורות."
            }
        };

        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "modalTitle");
        closeButton.setAttribute("aria-label", TEXT.close);

        let opener = null;

        const open = (key) => {

            const item = data[key];

            if (!item) return;

            opener = document.activeElement;

            title.textContent = item.title;
            text.textContent = item.text;

            modal.classList.add("open");
            document.body.style.overflow = "hidden";
            closeButton.focus();
        };

        const close = () => {

            modal.classList.remove("open");
            document.body.style.overflow = "";

            if (opener && typeof opener.focus === "function") opener.focus();
        };

        $$(".expertise-item[data-modal]").forEach((card) => {

            card.tabIndex = 0;
            card.setAttribute("role", "button");

            card.addEventListener("click", () => open(card.dataset.modal));

            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(card.dataset.modal);
                }
            });
        });

        closeButton.addEventListener("click", close);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) close();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("open")) close();
        });
    }


    /* ======================================================
       LIVE SEARCH  (articles page & portfolio page)
    ====================================================== */

    /* case-, accent- and niqqud-insensitive: "koln" finds "Köln", quotes are ignored */

    function normalise(value) {

        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-֑ͯ-ׇ]/g, "")
            .replace(/["'`׳״“”‘’]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function initSearch() {

        const input = $("#searchInput");

        if (!input) return;

        const list = $("#publicationList");
        const grid = $("#articlesList");

        const rows = list ? $$("li", list) : $$(".article-card", grid || document);

        if (!rows.length) return;

        const index = rows.map((row) => normalise(row.textContent));

        const dataRows = rows.filter((row) => !row.classList.contains("pub-heading"));

        /* result counter and "nothing found" message */

        const counter = document.createElement("p");

        counter.className = "search-count";
        counter.setAttribute("role", "status");
        counter.setAttribute("aria-live", "polite");

        const empty = document.createElement("p");

        empty.className = "no-results";
        empty.textContent = isEN
            ? "No results found. Try a different spelling or a shorter keyword."
            : "לא נמצאו תוצאות. אפשר לנסות איות אחר או מילת חיפוש קצרה יותר.";

        const box = input.closest(".search-box") || input.parentElement;

        box.after(counter);
        (list || grid).after(empty);

        input.setAttribute("aria-label", input.getAttribute("placeholder") || (isEN ? "Search" : "חיפוש"));

        let timer = null;

        const run = () => {

            const query = normalise(input.value);
            const terms = query ? query.split(" ") : [];

            let visible = 0;
            let headingRow = null;
            let headingHasMatch = false;

            const flushHeading = () => {
                if (headingRow) headingRow.hidden = Boolean(terms.length) && !headingHasMatch;
            };

            rows.forEach((row, position) => {

                if (row.classList.contains("pub-heading")) {

                    flushHeading();

                    headingRow = row;
                    headingHasMatch = false;

                    return;
                }

                const match = terms.every((term) => index[position].includes(term));

                row.hidden = !match;

                if (match) {
                    visible += 1;
                    headingHasMatch = true;
                }
            });

            flushHeading();

            counter.textContent = terms.length ? TEXT.results(visible, dataRows.length) : "";
            empty.classList.toggle("visible", terms.length > 0 && visible === 0);
        };

        input.addEventListener("input", () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(run, 120);
        });
    }


    /* ======================================================
       WHATSAPP – carries whatever the visitor already typed
    ====================================================== */

    function initWhatsApp() {

        const link = $("#whatsappFloating");

        if (!link) return;

        const value = (id) => {
            const field = document.getElementById(id);
            return field ? field.value.trim() : "";
        };

        const update = () => {

            const name = value("name");
            const phone = value("phone");
            const email = value("email");
            const message = value("message").slice(0, 500);

            const lines = [TEXT.hello];

            if (name) lines.push("", `${TEXT.name} ${name}`);
            if (phone) lines.push("", `${TEXT.phone} ${phone}`);
            if (email) lines.push("", `${TEXT.email} ${email}`);
            if (message) lines.push("", message);

            link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
        };

        ["name", "email", "phone", "message"].forEach((id) => {
            const field = document.getElementById(id);
            if (field) field.addEventListener("input", update);
        });

        update();

        document.addEventListener("contact:sent", update);
    }


    /* ======================================================
       CONTACT FORM
    ====================================================== */

    function initContactForm() {

        const form = $("#contactForm");
        const success = $("#successMessage");

        if (!form || !success) return;

        /* an error box that sits next to the success box */

        const error = document.createElement("div");

        error.className = "error-message";
        error.setAttribute("role", "alert");

        success.after(error);

        const button = $("button[type='submit']", form);
        const idleLabel = button ? button.innerHTML : "";

        /* formsubmit.co answers JSON on its /ajax/ endpoint */

        const endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            success.style.display = "none";
            error.style.display = "none";

            /* spam trap: bots fill every field, people never see this one */

            const trap = form.elements["_honey"];

            if (trap && trap.value) {
                success.style.display = "block";
                return;
            }

            if (button) {
                button.disabled = true;
                button.textContent = TEXT.sending;
            }

            try {

                const response = await fetch(endpoint, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" }
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                success.style.display = "block";
                success.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });

                form.reset();

                document.dispatchEvent(new Event("contact:sent"));

                window.setTimeout(() => { success.style.display = "none"; }, 8000);

            } catch (problem) {

                console.error("Contact form failed:", problem);

                error.textContent = problem instanceof TypeError ? TEXT.networkError : TEXT.formError;
                error.style.display = "block";

            } finally {

                if (button) {
                    button.disabled = false;
                    button.innerHTML = idleLabel;
                }
            }
        });
    }


    /* ======================================================
       SMALL SAFETY NET
    ====================================================== */

    function secureExternalLinks() {

        $$("a[target='_blank']").forEach((link) => {
            link.rel = "noopener noreferrer";
        });
    }


    /* ======================================================
       START
    ====================================================== */

    async function start() {

        /* everything that does not depend on the shared components */

        initReveal();
        initBackToTop();
        initGallery();
        initModal();
        initSearch();
        initWhatsApp();
        initContactForm();

        /* shared components */

        const [headerLoaded, footerLoaded] = await Promise.all([
            loadComponent("header", isEN ? "header-en.html" : "header-he.html"),
            loadComponent("footer", isEN ? "footer-en.html" : "footer-he.html")
        ]);

        if (headerLoaded) initHeader();
        if (footerLoaded) initFooter();

        secureExternalLinks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

})();
