document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const dropdownMenuButton = document.getElementById("dropdownMenuButton");
    const dropdownSelection = document.getElementById("dropdownSelection");

    // Set the dropdown value to the hidden input field
    document.querySelectorAll(".dropdown-item").forEach(function(item) {
        item.addEventListener("click", function(event) {
            const value = event.target.getAttribute("data-value");
            dropdownSelection.value = value;
            dropdownMenuButton.textContent = `Login As: ${value}`;
        });
    });

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const userType = dropdownSelection.value.trim();

        // Perform client-side validation
        if (!username || !password || !userType) {
            alert("Please fill in all required fields and select a user type.");
            return;
        }

        // Perform the login request
        fetch("/submit_login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: username,
                password: password,
                user_type: userType,
            }),
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                window.location.href = "/"; // Redirect to the root page on success
            } else {
                alert("Invalid credentials. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    });
});