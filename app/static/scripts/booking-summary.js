document.addEventListener("DOMContentLoaded", function() {
    console.log("Booking Summary Page Loaded");

    // Fetch booking summary details
    const paymentIntentId = new URLSearchParams(window.location.search).get("payment_intent");
    if (!paymentIntentId) {
        console.error("Payment Intent ID is missing in the URL");
        return;
    }
    fetch(`/api/booking_summary?payment_intent=${paymentIntentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const eventName = document.querySelector("td[data-field='event_name']");
                const location = document.querySelector("td[data-field='location']");
                const date = document.querySelector("td[data-field='date']");
                const time = document.querySelector("td[data-field='time']");
                const seats = document.querySelector("td[data-field='seats']");
                const txnId = document.querySelector("td[data-field='txn_id']");
                const bookingDate = document.querySelector("td[data-field='booking_date']");
                const bookingTime = document.querySelector("td[data-field='booking_time']");

                if (eventName) eventName.innerText = data.event_name;
                if (location) location.innerText = data.location;
                if (date) date.innerText = data.date;
                if (time) time.innerText = data.time;
                if (seats) seats.innerText = data.seats.join(", ");
                if (txnId) txnId.innerText = data.txn_id;
                if (bookingDate) bookingDate.innerText = data.booking_date;
                if (bookingTime) bookingTime.innerText = data.booking_time;
            } else {
                console.error("Failed to fetch booking summary details:", data.error);
            }
        })
        .catch(error => console.error("Error fetching booking summary details:", error));
});

function printReceipt() {
    window.print();
}