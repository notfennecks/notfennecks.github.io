import { initNavigation } from "./navigation.js";
import { initContactForm } from "./contact.js";
import { initHero } from "./hero/hero.js";

document.addEventListener("DOMContentLoaded", () => {

    initNavigation();
    initContactForm();
    initHero();

});