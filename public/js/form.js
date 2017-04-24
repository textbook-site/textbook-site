const userFunction = require('../../data/users');

(function () {

    const login = document.getElementById("login");

    if (login) {
        const username = document.getElementById("username");
        const password = document.getElementById("password");

        login.addEventListener("submit", (event) => {
            event.preventDefault();

            try {
                userFunction.getUserByUsername(username)
            } catch (e) {
                const message = typeof e === "string" ? e : e.message;
                errorTextElement.textContent = e;
                errorContainer.classList.remove("hidden");
            }
        });
    }
})();