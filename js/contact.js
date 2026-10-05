export function initContactForm() {

    const contactForm =
        document.getElementById("contact-form");

    const formStatus =
        document.getElementById("form-status");


    if (!contactForm || !formStatus) {
        return;
    }


    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const formData =
                new FormData(contactForm);


            try {

                const response =
                    await fetch(
                        contactForm.action,
                        {
                            method: contactForm.method,
                            body: formData,
                            headers: {
                                Accept: "application/json"
                            }
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Form submission failed."
                    );
                }


                formStatus.textContent =
                    "Message sent successfully!";

                formStatus.className =
                    "success";

                contactForm.reset();

            } catch (error) {

                console.error(error);

                formStatus.textContent =
                    "Something went wrong. Please try again.";

                formStatus.className =
                    "error";

            }

        }
    );
}