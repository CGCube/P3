document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('update-event-form');
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    // Fetch event details and populate the form
    fetch(`/api/event_details?event_id=${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('event-name').value = data.event.event_name || '';
                document.getElementById('event-type').value = data.event.event_type || '';
                document.getElementById('event-date').value = data.event.date || '';
                document.getElementById('event-time').value = data.event.time || '';
                document.getElementById('venue').value = data.event.venue || '';
                document.getElementById('city').value = data.event.city || '';
                document.getElementById('price-per-seat').value = data.event.price || '';
                document.getElementById('genre').value = data.event.genre || '';

                // Populate genres as cards
                const genresContainer = document.getElementById('genres-container');
                if (genresContainer) {
                    genresContainer.innerHTML = '';
                    const genres = data.event.genre.split(',').map(genre => genre.trim());
                    genres.forEach(genre => {
                        const genreCard = document.createElement('div');
                        genreCard.className = 'genre-card';
                        genreCard.textContent = genre;
                        genresContainer.appendChild(genreCard);
                    });
                }
            } else {
                alert('Failed to fetch event details.');
            }
        })
        .catch(error => {
            console.error('Error fetching event details:', error);
            alert('An error occurred while fetching event details.');
        });

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form values
        const eventName = document.getElementById('event-name').value;
        const eventType = document.getElementById('event-type').value;
        const eventDate = document.getElementById('event-date').value;
        const eventTime = document.getElementById('event-time').value;
        const venue = document.getElementById('venue').value;
        const city = document.getElementById('city').value;
        const pricePerSeat = document.getElementById('price-per-seat').value;
        const genre = document.getElementById('genre').value;
        const thumbnail = document.getElementById('thumbnail').files[0];

        // Upload image to ImageKit
        let thumbnailUrl = '';
        if (thumbnail) {
            const formData = new FormData();
            formData.append('file', thumbnail);
            formData.append('fileName', thumbnail.name);

            const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + btoa('public_XXd3A1aug1Soz3jffRJcEK4Mhaw=' + ':' + 'private_llSA2qj4HPn5FKSXuBKIdZaSw/A='),
                },
                body: formData,
            });

            const data = await response.json();
            thumbnailUrl = data.url;
        }

        // Create an event object with only the fields that have values
        const updatedEvent = { event_id: eventId };
        if (eventName) updatedEvent.name = eventName;
        if (eventType) updatedEvent.type = eventType;
        if (eventDate) updatedEvent.date = eventDate;
        if (eventTime) updatedEvent.time = eventTime;
        if (venue) updatedEvent.venue = venue;
        if (city) updatedEvent.city = city;
        if (pricePerSeat) updatedEvent.pricePerSeat = pricePerSeat;
        if (genre) updatedEvent.genre = genre;
        if (thumbnailUrl) updatedEvent.thumbnail = thumbnailUrl;

        // Send the updated event data to the server
        fetch('/update_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Event updated successfully!');
                form.reset();
            } else {
                alert('Failed to update event.');
            }
        })
        .catch(error => {
            console.error('Error updating event:', error);
            alert('An error occurred while updating the event.');
        });
    });
});