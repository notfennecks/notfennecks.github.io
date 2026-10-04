document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio website loaded!");
});

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const menuLinks = document.querySelectorAll(".nav-links a");
const navIcon = navToggle.querySelector("i");

navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    const menuOpen = navMenu.classList.contains("active");
    if(menuOpen){
        navIcon.classList.remove("fa-bars");
        navIcon.classList.add("fa-xmark");
    } else {
        navIcon.classList.remove("fa-xmark");
        navIcon.classList.add("fa-bars");
    }
});

menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navIcon.classList.remove("fa-xmark");
        navIcon.classList.add("fa-bars");
    });
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop;

        if (window.scrollY >= sectionTop - 150) {
            currentSection = section.getAttribute("id");
        }

    });

    //Detect if user has reached the bottom of the page
    const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

    if (atBottom) {
        currentSection = "contact";
    }

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
        const response = await fetch(contactForm.action, {
            method: contactForm.method,
            body: formData,
            headers: {
                Accept: "application/json"
            }
        });

        if (response.ok) {
            formStatus.textContent = "Message sent successfully!";
            formStatus.className = "success";

            contactForm.reset();
        } else {
            formStatus.textContent =
                "Something went wrong. Please try again.";
            formStatus.className = "error";
        }
    } catch (error) {
        formStatus.textContent =
            "Something went wrong. Please try again.";
        formStatus.className = "error";
    }
});