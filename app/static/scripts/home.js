function selectLocation(location) {
    // Update the text of the Location dropdown
    document.getElementById('locationDropdown').textContent = location;
    // Store the location in localStorage
    localStorage.setItem('selectedLocation', location);
    // Fetch events based on the selected location
    fetchEvents(location);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded. Fetching events...');
    // Fetch location from localStorage
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        document.getElementById('locationDropdown').textContent = savedLocation;
        fetchEvents(savedLocation);
    } else {
        fetchEvents(); // Fetch events on initial load
    }
});

function fetchEvents(location = '') {
    let url = '/api/events';
    if (location) {
        url += `?location=${encodeURIComponent(location)}`;
    }

    fetch(url) // Fetch events from the server
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.status_message);
            }
            console.log('Data received:', data);
            const { movies, events, shows } = data.events;

            const movieCards = document.getElementById('movie-cards');
            movieCards.innerHTML = ''; // Clear existing cards
            movies.forEach((movie) => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('col-md-3');
                movieCard.innerHTML = `
                    <div class="card mb-4">
                        <img src="${movie.event_thumbnail}" class="card-img-top" alt="${movie.event_name}">
                        <div class="card-body">
                            <h5 class="card-title">${truncateText(movie.event_name, 25)}</h5>
                            <p class="card-text">${truncateText(movie.event_description, 50)}</p>
                            <a href="/view_description?event_id=${movie.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                        </div>
                    </div>
                `;
                movieCards.appendChild(movieCard);
            });

            const eventCards = document.getElementById('event-cards');
            eventCards.innerHTML = ''; // Clear existing cards
            events.forEach((event) => {
                const eventCard = document.createElement('div');
                eventCard.classList.add('col-md-3');
                eventCard.innerHTML = `
                    <div class="card mb-4">
                        <img src="${event.event_thumbnail}" class="card-img-top" alt="${event.event_name}">
                        <div class="card-body">
                            <h5 class="card-title">${truncateText(event.event_name, 25)}</h5>
                            <p class="card-text">${truncateText(event.event_description, 50)}</p>
                            <a href="/view_description?event_id=${event.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                        </div>
                    </div>
                `;
                eventCards.appendChild(eventCard);
            });

            const showCards = document.getElementById('show-cards');
            showCards.innerHTML = ''; // Clear existing cards
            shows.forEach((show) => {
                const showCard = document.createElement('div');
                showCard.classList.add('col-md-3');
                showCard.innerHTML = `
                    <div class="card mb-4">
                        <img src="${show.event_thumbnail}" class="card-img-top" alt="${show.event_name}">
                        <div class="card-body">
                            <h5 class="card-title">${truncateText(show.event_name, 25)}</h5>
                            <p class="card-text">${truncateText(show.event_description, 50)}</p>
                            <a href="/view_description?event_id=${show.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                        </div>
                    </div>
                `;
                showCards.appendChild(showCard);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}