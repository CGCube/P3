document.addEventListener("DOMContentLoaded", function () {
    const bookTicketBtn = document.querySelector('.book-ticket-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    const eventVideo = document.getElementById("event-video");
    const reviewForm = document.getElementById('review-form');
    const reviewsContainer = document.getElementById('reviews-container');

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

    // Auto-generate video on page load
    if (eventId) {
        fetch(`/generate_video/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.video_url) {
                    // Set the video source to the returned URL and display the video
                    eventVideo.src = data.video_url;
                    eventVideo.style.display = "block";
                    console.log("Video generated and displayed successfully!");
                } else if (data.error) {
                    console.error(`Error generating video: ${data.error}`);
                }
            })
            .catch(error => {
                console.error("Error auto-generating video:", error);
            });
    }

    // Submit review
    reviewForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        fetch('/submit_review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                event_id: eventId,
                rating: rating,
                comment: comment
            })
        })
            .then(response => response.text()) // Changed to .text() to handle HTML response
            .then(data => {
                try {
                    data = JSON.parse(data); // Attempt to parse JSON
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    throw new Error('Invalid JSON response');
                }

                if (data.success) {
                    const reviewElement = document.createElement('div');
                    reviewElement.classList.add('card', 'mb-3');
                    reviewElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Rating: ${rating}</h5>
                            <p class="card-text">${comment}</p>
                            <p class="card-text"><small class="text-muted">Just now</small></p>
                        </div>
                    `;

                    reviewsContainer.prepend(reviewElement);
                    reviewForm.reset();
                } else {
                    console.error('Error submitting review:', data.message);
                }
            })
            .catch(error => console.error('Error submitting review:', error));
    });
});