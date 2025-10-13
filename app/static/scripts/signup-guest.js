document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signupForm");

    signupForm.addEventListener("submit", function(event) {
        const name = document.getElementById("gname").value.trim();
        const email = document.getElementById("gemail").value.trim();
        const username = document.getElementById("gusername").value.trim();
        const password = document.getElementById("gpassword").value.trim();
        const confirmPassword = document.getElementById("gconfirm_password").value.trim();
        const phone = document.getElementById("gphone").value.trim();

        // Perform client-side validation
        if (!name || !email || !username || !password || !confirmPassword) {
            event.preventDefault();
            alert("Please fill in all required fields.");
            return;
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            event.preventDefault();
            alert("Please enter a valid email address.");
            return;
        }

        // Username validation (minimum 3 characters)
        if (username.length < 3) {
            event.preventDefault();
            alert("Username must be at least 3 characters long.");
            return;
        }

        // Password validation (minimum 8 characters)
        if (password.length < 8) {
            event.preventDefault();
            alert("Password must be at least 8 characters long.");
            return;
        }

        // Confirm Password validation
        if (password !== confirmPassword) {
            event.preventDefault();
            alert("Passwords do not match.");
            return;
        }

        // Phone validation (only digits, 10-15 characters)
        if (phone && !/^\d{10,15}$/.test(phone)) {
            event.preventDefault();
            alert("Please enter a valid phone number (10-15 digits).");
            return;
        }
    });
});