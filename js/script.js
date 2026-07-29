/* ===========================================
   מכון לחקר גנאלוגיה
   script.js
=========================================== */


// HEADER
// ================= HEADER =================

function initHeader() {

    const header = document.querySelector("header");
    const menuButton = document.getElementById("menuButton");
    const nav = document.querySelector("header nav");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        });

    }

    if (menuButton && nav) {

        menuButton.addEventListener("click", () => {

            nav.classList.toggle("show");

            menuButton.setAttribute(
                "aria-expanded",
                nav.classList.contains("show")
            );

        });

        // סגירת התפריט לאחר לחיצה על קישור
        document.querySelectorAll("header nav a").forEach((link) => {

            link.addEventListener("click", () => {

                nav.classList.remove("show");

                menuButton.setAttribute("aria-expanded", "false");

            });

        });

    }
const langSwitch = document.querySelector(".lang-switch");

if (langSwitch) {

    langSwitch.addEventListener("click", function (e) {

        e.preventDefault();

        const path = window.location.pathname;

        if (path.includes("/he/")) {

            window.location.href = path.replace("/he/", "/en/");

        } else if (path.includes("/en/")) {

            window.location.href = path.replace("/en/", "/he/");

        }

    });

}
}


// BACK TO TOP

const backToTop = document.getElementById("backToTop");

if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("visible");

        } else {

            backToTop.classList.remove("visible");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// GALLERY

const galleryItems = document.querySelectorAll(".gallery-item");

const lightbox = document.getElementById("lightbox");

const lightboxImg = document.getElementById("lightboxImg");

const closeLightbox = document.getElementById("closeLightbox");

if (lightbox && lightboxImg && closeLightbox) {

galleryItems.forEach((img) => {

    img.addEventListener("click", () => {

        lightbox.classList.add("show");

        document.body.style.overflow="hidden";

        lightboxImg.src=img.src;
        
        lightboxImg.alt = img.alt;
    });

});

closeLightbox.addEventListener("click", () => {

    lightbox.classList.remove("show");

    lightboxImg.src = "";

    document.body.style.overflow = "";

});

lightbox.addEventListener("click", (e) => {

    if(e.target===lightbox){

    lightbox.classList.remove("show");

    lightboxImg.src = "";

    document.body.style.overflow = "";

}

});
document.addEventListener("keydown",(e)=>{

if (e.key === "Escape" && lightbox.classList.contains("show")) {

    lightbox.classList.remove("show");

    lightboxImg.src = "";

    document.body.style.overflow = "";

}

});
}
// WHATSAPP

const whatsapp = document.getElementById("whatsappFloating");

function updateWhatsapp(){

if (whatsapp) {

    const name = document.getElementById("name")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const phone = document.getElementById("phone")?.value || "";
    const message = document.getElementById("message")?.value.slice(0,500) || "";

    const text =`

שלום,

שמי ${name}

טלפון: ${phone}

אימייל: ${email}

${message}

`;

    whatsapp.href=

"https://wa.me/972556633180?text="+encodeURIComponent(text);

}

}

["name", "email", "phone", "message"].forEach((id) => {

    const input = document.getElementById(id);

    if (input) {

        input.addEventListener("input", updateWhatsapp);

    }

});

updateWhatsapp();



// ANIMATION

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");
            observer.unobserve(entry.target);

        }

    });

}, {

    rootMargin: "0px 0px -60px 0px"

});

document.querySelectorAll(".card,.project-card,.section-title,.gallery-item,.about-container")

.forEach((el) => observer.observe(el));

// CONTACT FORM

const form = document.getElementById("contactForm");
const success = document.getElementById("successMessage");

if (form && success) {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(form);

        try {

            const response = await fetch(form.action, {

                method: "POST",

                body: formData,

                headers: {

                    Accept: "application/json"

                }

            });

            if (response.ok) {

                success.style.display = "block";

                form.reset();

                if (typeof updateWhatsapp === "function") {

                    updateWhatsapp();

                }

                setTimeout(() => {

                    success.style.display = "none";

                }, 5000);

            } else {

                alert("אירעה שגיאה בשליחת הטופס. נסה שוב.");

            }

        } catch (error) {

            alert("לא ניתן היה להתחבר לשרת.");

            console.error(error);

        }

    });

}
// ================= HEADER & FOOTER LOADER =================

document.addEventListener("DOMContentLoaded", async () => {

const isEnglish = window.location.pathname.includes("/en/");

const headerFile = isEnglish
    ? "/components/header-en.html"
    : "/components/header-he.html";

const footerFile = isEnglish
    ? "/components/footer-en.html"
    : "/components/footer-he.html";

    // HEADER

    const header = document.getElementById("header");

    if (header) {

        try {

            const response = await fetch(headerFile);

            if (!response.ok) {
            throw new Error(`Header not found: ${headerFile}`);
            }

header.innerHTML = await response.text();

            initHeader();

        } catch (error) {

            console.error("Header failed to load:", error);

        }

    }

    // FOOTER

    const footer = document.getElementById("footer");

    if (footer) {

        try {

           const response = await fetch(footerFile);

            if (!response.ok) {
            throw new Error(`Footer not found: ${footerFile}`);
            }

footer.innerHTML = await response.text();

        } catch (error) {

            console.error("Footer failed to load:", error);

        }

    }

});

const isEnglish = document.documentElement.lang === "en";
document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const closeBtn = document.querySelector(".close");

    if (!modal || !modalTitle || !modalText || !closeBtn) return;

    const isEnglish = document.documentElement.lang === "en";

const modalData = isEnglish ? {

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
   document.querySelectorAll(".expertise-item[data-modal]").forEach(card => {
    card.addEventListener("click", () => {

        const item = modalData[card.dataset.modal];

        if (!item) return;

        modalTitle.textContent = item.title;
        modalText.textContent = item.text;

        modal.style.display = "flex";
    });

});

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

});
