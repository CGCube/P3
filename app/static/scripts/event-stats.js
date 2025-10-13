document.addEventListener("DOMContentLoaded", function() {
    const eventNameElement = document.getElementById('event-name');
    const ticketsBookedElement = document.getElementById('tickets-booked');
    const reviewsContainer = document.getElementById('reviews-container');
    const bookedTicketsTableBody = document.querySelector('#booked-tickets-table tbody');
    const videoContainer = document.getElementById('video-container'); // Reference to video container
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    // Function to render event statistics
    function renderStats(stats) {
        eventNameElement.textContent = `Event Name: ${stats.name}`;
        ticketsBookedElement.textContent = `Number of Tickets Booked: ${stats.ticketsBooked}`;
        
        // Render reviews
        stats.reviews.forEach(review => {
            const reviewElement = document.createElement('p');
            reviewElement.textContent = review.review_text;
            reviewsContainer.appendChild(reviewElement);
        });
        
        // Render booked tickets table
        stats.bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.guest_name}</td>
                <td>${booking.number_of_tickets}</td>
            `;
            bookedTicketsTableBody.appendChild(row);
        });

        // Fetch and render generated video
        fetch(`/generate_video/${eventId}`)
            .then(response => response.json())
            .then(data => {
                if (data.video_url) {
                    const videoElement = document.createElement('video');
                    videoElement.setAttribute('controls', 'controls');
                    videoElement.setAttribute('width', '100%');
                    videoElement.innerHTML = `
                        <source src="${data.video_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    `;
                    videoContainer.innerHTML = ''; // Clear placeholder text
                    videoContainer.appendChild(videoElement);
                } else {
                    videoContainer.textContent = 'No video available for this event.';
                }
            })
            .catch(error => {
                console.error("Error fetching video:", error);
                videoContainer.textContent = 'An error occurred while fetching the video.';
            });
    }

    // Fetch event statistics from the server
    fetch(`/api/event_stats?event_id=${eventId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderStats(data.event_stats);
            } else {
                alert("Failed to fetch event statistics.");
            }
        })
        .catch(error => {
            console.error("Error fetching event statistics:", error);
            alert("An error occurred while fetching event statistics.");
        });
});