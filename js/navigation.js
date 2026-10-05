export function initNavigation() {

    const navToggle =
        document.querySelector(".nav-toggle");

    const navMenu =
        document.querySelector(".nav-links");

    const navIcon =
        navToggle?.querySelector("i");

    const navLinks =
        document.querySelectorAll(".nav-links a");

    const sections =
        document.querySelectorAll("section");

    if (!navToggle || !navMenu || !navIcon) {
        return;
    }


    /* ==============================
       Mobile Navigation
    ============================== */

    navToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

        const menuOpen =
            navMenu.classList.contains("active");

        navIcon.classList.toggle(
            "fa-bars",
            !menuOpen
        );

        navIcon.classList.toggle(
            "fa-xmark",
            menuOpen
        );

    });


    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            navIcon.classList.remove("fa-xmark");
            navIcon.classList.add("fa-bars");

        });

    });


    /* ==============================
       Active Navigation Link
    ============================== */

    function updateActiveSection() {

        let currentSection = "";

        sections.forEach((section) => {

            const sectionTop =
                section.offsetTop;

            if (
                window.scrollY >=
                sectionTop - 150
            ) {
                currentSection =
                    section.getAttribute("id");
            }

        });


        const atBottom =
            window.innerHeight +
            window.scrollY >=
            document.documentElement.scrollHeight - 10;


        if (atBottom) {
            currentSection = "contact";
        }


        navLinks.forEach((link) => {

            link.classList.remove("active");

            if (
                link.getAttribute("href") ===
                `#${currentSection}`
            ) {
                link.classList.add("active");
            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveSection,
        { passive: true }
    );

    updateActiveSection();
}