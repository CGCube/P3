document.addEventListener('DOMContentLoaded', function() {
    const bookedSeatsData = document.getElementById('bookedSeatsData').textContent;
    const bookedSeats = bookedSeatsData ? JSON.parse(bookedSeatsData) : [];
    console.log('Booked Seats:', bookedSeats); // Debugging line
    const seatCheckboxes = document.querySelectorAll('.btn-check');
    const confirmButton = document.querySelector('#confirmButton');

    // Retrieve event_id and guest_id from the form
    const eventId = document.getElementById('event_id').value;
    const guestId = document.getElementById('guest_id').value;
    console.log('Event ID:', eventId); // Debugging line
    console.log('Guest ID:', guestId); // Debugging line

    // Disable booked seats
    bookedSeats.forEach(seatNumber => {
        const seatCheckbox = document.querySelector(`.btn-check[value="${seatNumber}"]`);
        if (seatCheckbox) {
            seatCheckbox.disabled = true;
            const label = document.querySelector(`label[for="${seatCheckbox.id}"]`);
            if (label) {
                label.classList.add('btn-secondary', 'text-muted', 'border-secondary');
            }
        }
    });

    // Add event listener for seat selection
    seatCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = document.querySelector(`label[for="${checkbox.id}\"]`);
            if (checkbox.checked && !checkbox.disabled) {
                label.classList.add('btn-success', 'text-white', 'border-success');
            } else {
                label.classList.remove('btn-success', 'text-white', 'border-success');
            }
            updateConfirmButton();
        });

        // Initial check for already selected seats
        if (checkbox.checked && !checkbox.disabled) {
            const label = document.querySelector(`label[for="${checkbox.id}\"]`);
            label.classList.add('btn-success', 'text-white', 'border-success');
        }
    });

    function updateConfirmButton() {
        const selectedSeats = Array.from(document.querySelectorAll('.btn-check:checked:not(:disabled)'))
            .map(seat => seat.value);
        console.log("Selected seats: ", selectedSeats.length); // Debugging line
    }

    // Add event listener for confirm button
    confirmButton.addEventListener('click', function(event) {
        event.preventDefault();

        const selectedSeats = Array.from(document.querySelectorAll('.btn-check:checked:not(:disabled)'))
            .map(seat => seat.value);

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat.');
            return;
        }

        // Store the values in appropriate variables
        const bookingDetails = {
            guest_id: guestId,
            event_id: eventId,
            seat_numbers: selectedSeats
        };

        console.log('Booking Details:', bookingDetails);

        // Redirect to booking confirmation page with parameters
        const url = new URL(window.location.origin + '/booking_confirmation');
        url.searchParams.append('seats', selectedSeats.join(','));
        url.searchParams.append('event_id', eventId);
        window.location.href = url.toString();
    });

    // Initial check for confirm button state
    updateConfirmButton();
});