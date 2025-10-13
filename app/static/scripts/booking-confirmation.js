document.addEventListener("DOMContentLoaded", function() {
    console.log("Booking Confirmation Page Loaded");

    // Initialize Stripe
    const stripe = Stripe('pk_test_51R1BD1IEJxqImnyT9bZmktRgNe2NOMyZwK58qJpISlm9aizgrD5V7OgsvmYOxUbYmFnpinH0G9wmja0iNlI8mrFS00Yc1s3oYY');
    const elements = stripe.elements();
    const cardElement = elements.create('card');

    // Mount the card element
    cardElement.mount('#card-element');

    // Fetch event details
    const eventId = new URLSearchParams(window.location.search).get("event_id");
    if (!eventId) {
        console.error("Event ID is missing in the URL");
        return;
    }
    fetch(`/api/event/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const pricePerSeat = data.event.price;
                const seats = document.getElementById("seats").innerText.split(",");
                const totalAmount = pricePerSeat * seats.length;

                document.getElementById("price_per_seat").innerText = pricePerSeat;
                document.getElementById("total_amount").innerText = totalAmount;
            } else {
                console.error("Failed to fetch event details:", data.status_message);
            }
        })
        .catch(error => console.error("Error fetching event details:", error));

    // Handle payment form submission
    document.getElementById("payment-form").addEventListener("submit", function(event) {
        event.preventDefault();

        const totalAmount = document.getElementById("total_amount").innerText;
        const currency = "usd"; // Set your currency

        fetch("/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: totalAmount * 100, // Stripe expects amount in cents
                currency: currency
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Payment Intent created:", data.client_secret);
                return stripe.confirmCardPayment(data.client_secret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            // Include any additional billing details if required
                        }
                    }
                });
            } else {
                console.error("Failed to create Payment Intent:", data.error);
            }
        })
        .then(result => {
            if (result.error) {
                console.error("Payment failed:", result.error.message);
                // Show error to your customer (e.g., insufficient funds)
                document.getElementById("card-errors").textContent = result.error.message;
                // Redirect to booking summary with failed note
                window.location.href = `/booking_summary?payment_intent=failed`;
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                console.log("Payment succeeded:", result.paymentIntent);
                // Save payment and booking details to the server
                fetch("/complete-booking", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        payment_intent_id: result.paymentIntent.id,
                        event_id: eventId,
                        seats: document.getElementById("seats").innerText.split(","),
                        total_amount: totalAmount
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Redirect to booking summary
                        window.location.href = `/booking_summary?payment_intent=${result.paymentIntent.id}`;
                    } else {
                        console.error("Failed to complete booking:", data.error);
                    }
                })
                .catch(error => console.error("Error completing booking:", error));
            }
        })
        .catch(error => console.error("Error during payment process:", error));
    });
});