document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-event-form');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form values
        const organizerId = document.getElementById('organizer-id').value;
        const eventName = document.getElementById('event-name').value;
        const eventType = document.getElementById('event-type').value;
        const eventDate = document.getElementById('event-date').value;
        const eventTime = document.getElementById('event-time').value;
        const venue = document.getElementById('venue').value;
        const city = document.getElementById('city').value;
        const pricePerSeat = document.getElementById('price-per-seat').value;
        const availableSeats = document.getElementById('available-seats').value; // Hidden field
        const genre = document.getElementById('genre').value;
        const thumbnailUrl = document.getElementById('thumbnail').value;
        const eventDescription = document.getElementById('event-description').value;

        // Check if organizerId is empty
        if (!organizerId) {
            alert('Organizer ID is missing. Please log in again.');
            return;
        }

        // Create an event object with only the fields that have values
        const newEvent = {
            organizer_id: organizerId,
            event_name: eventName,
            event_type: eventType,
            event_date: eventDate,
            event_time: eventTime,
            venue: venue,
            city: city,
            price_per_seat: pricePerSeat,
            available_seats: availableSeats, // Hidden field
            genre: genre,
            thumbnail: thumbnailUrl,
            event_description: eventDescription
        };

        // Send the new event data to the server
        fetch('/add_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Event added successfully!');
                form.reset();
            } else {
                alert('Failed to add event.');
            }
        })
        .catch(error => {
            console.error('Error adding event:', error);
            alert('An error occurred while adding the event.');
        });
    });
});