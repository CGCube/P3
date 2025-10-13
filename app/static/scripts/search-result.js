document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById('search-form');
    const searchQueryInput = document.getElementById('search-query');
    const resultsCount = document.getElementById('results-count');
    const moviesResultsContainer = document.getElementById('movies-results');
    const eventsResultsContainer = document.getElementById('events-results');
    const showsResultsContainer = document.getElementById('shows-results');
    const moviesCount = document.getElementById('movies-count');
    const eventsCount = document.getElementById('events-count');
    const showsCount = document.getElementById('shows-count');

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = searchQueryInput.value.trim();

        if (query) {
            fetch('/search_events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    query: query,
                }),
            })
            .then(response => response.json())
            .then(data => {
                moviesResultsContainer.innerHTML = ''; // Clear previous results
                eventsResultsContainer.innerHTML = ''; // Clear previous results
                showsResultsContainer.innerHTML = ''; // Clear previous results

                const movies = data.events.filter(event => event.event_type === 'movie');
                const events = data.events.filter(event => event.event_type === 'event');
                const shows = data.events.filter(event => event.event_type === 'show');

                resultsCount.textContent = data.events.length;
                moviesCount.textContent = movies.length;
                eventsCount.textContent = events.length;
                showsCount.textContent = shows.length;

                if (movies.length > 0) {
                    movies.forEach(event => {
                        const eventCard = document.createElement('div');
                        eventCard.classList.add('col-md-3');
                        eventCard.innerHTML = `
                            <div class="card mb-4 movie-card">
                                <img src="${event.thumbnail}" class="card-img-top" alt="Event ${event.event_id}">
                                <div class="card-body">
                                    <h5 class="card-title">${event.event_name}</h5>
                                    <p class="card-text">${event.event_description}</p>
                                    <a href="/view_description?event_id=${event.event_id}" class="btn" style="background-color: #212529; color: white;">View Details</a>
                                </div>
                            </div>
                        `;
                        moviesResultsContainer.appendChild(eventCard);
                    });
                } else {
                    moviesResultsContainer.innerHTML = '<p>No matching movies found.</p>';
                }

                if (events.length > 0) {
                    events.forEach(event => {
                        const eventCard = document.createElement('div');
                        eventCard.classList.add('col-md-3');
                        eventCard.innerHTML = `
                            <div class="card mb-4 movie-card">
                                <img src="${event.thumbnail}" class="card-img-top" alt="Event ${event.event_id}">
                                <div class="card-body">
                                    <h5 class="card-title">${event.event_name}</h5>
                                    <p class="card-text">${event.event_description}</p>
                                    <a href="/view_description?event_id=${event.event_id}" class="btn" style="background-color: #212529; color: white;">View Details</a>
                                </div>
                            </div>
                        `;
                        eventsResultsContainer.appendChild(eventCard);
                    });
                } else {
                    eventsResultsContainer.innerHTML = '<p>No matching events found.</p>';
                }

                if (shows.length > 0) {
                    shows.forEach(event => {
                        const eventCard = document.createElement('div');
                        eventCard.classList.add('col-md-3');
                        eventCard.innerHTML = `
                            <div class="card mb-4 movie-card">
                                <img src="${event.thumbnail}" class="card-img-top" alt="Event ${event.event_id}">
                                <div class="card-body">
                                    <h5 class="card-title">${event.event_name}</h5>
                                    <p class="card-text">${event.event_description}</p>
                                    <a href="/view_description?event_id=${event.event_id}" class="btn" style="background-color: #212529; color: white;">View Details</a>
                                </div>
                            </div>
                        `;
                        showsResultsContainer.appendChild(eventCard);
                    });
                } else {
                    showsResultsContainer.innerHTML = '<p>No matching shows found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
            });
        }
    });
});