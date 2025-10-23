document.addEventListener("DOMContentLoaded", function () {
    const bookTicketBtn = document.querySelector('.book-ticket-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    console.log('Event ID from URL:', eventId); // Debug log

    // Fetch event details
    if (eventId) {
        fetch(`/api/event/${eventId}`) // Fetch event details from the server
            .then(response => response.json())
            .then(data => {
                console.log('Fetched event data:', data); // Debug log
                if (data.success) {
                    const event = data.event;
                    document.querySelector('.event-title').textContent = event.event_name;
                    document.querySelector('.event-image').src = event.event_thumbnail;
                    document.querySelector('.event-image').alt = event.event_name;
                    document.querySelector('.event-description').textContent = event.event_description;
                    document.querySelector('.event-genre').textContent = event.genre;
                    document.querySelector('.event-date-time').textContent = `${event.date}, ${event.time}`;
                    document.querySelector('.event-venue').textContent = event.venue;
                    document.querySelector('.event-city').textContent = event.city;
                    bookTicketBtn.href = `/select_seats?event_id=${event.event_id}`;
                } else {
                    console.error('Error fetching event details:', data.status_message);
                }
            })
            .catch(error => console.error('Error fetching event details:', error));
    } else {
        console.error('No event_id found in URL');
    }
});