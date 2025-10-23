document.addEventListener("DOMContentLoaded", function() {
    const searchQueryInput = document.getElementById('search-query');
    const resultsCount = document.getElementById('results-count');
    const moviesResultsContainer = document.getElementById('movies-results');
    const eventsResultsContainer = document.getElementById('events-results');
    const showsResultsContainer = document.getElementById('shows-results');
    const moviesCount = document.getElementById('movies-count');
    const eventsCount = document.getElementById('events-count');
    const showsCount = document.getElementById('shows-count');

    const createCard = (event) => `
        <div class="col-md-3">
            <div class="card mb-4 movie-card">
                <img src="${event.thumbnail}" class="card-img-top" alt="${event.event_name}">
                <div class="card-body">
                    <h5 class="card-title">${event.event_name}</h5>
                    <p class="card-text">${event.event_description}</p>
                    <a href="/view_description?event_id=${event.event_id}" class="btn btn-dark">View Details</a>
                </div>
            </div>
        </div>
    `;

    const fetchResults = (query) => {
        if (!query) {
            moviesResultsContainer.innerHTML = '<p>Type to search movies...</p>';
            eventsResultsContainer.innerHTML = '<p>Type to search events...</p>';
            showsResultsContainer.innerHTML = '<p>Type to search shows...</p>';
            resultsCount.textContent = 0;
            moviesCount.textContent = 0;
            eventsCount.textContent = 0;
            showsCount.textContent = 0;
            return;
        }

        fetch('/search_events', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ query: query })
        })
        .then(res => res.json())
        .then(data => {
            const movies = data.events.filter(e => e.event_type === 'movie');
            const events = data.events.filter(e => e.event_type === 'event');
            const shows = data.events.filter(e => e.event_type === 'show');

            resultsCount.textContent = data.events.length;
            moviesCount.textContent = movies.length;
            eventsCount.textContent = events.length;
            showsCount.textContent = shows.length;
            
            moviesResultsContainer.innerHTML = movies.length ? movies.map(createCard).join('') : '<p>No movies found.</p>';
            eventsResultsContainer.innerHTML = events.length ? events.map(createCard).join('') : '<p>No events found.</p>';
            showsResultsContainer.innerHTML = shows.length ? shows.map(createCard).join('') : '<p>No shows found.</p>';
        });
    };

    let timeout = null;
    searchQueryInput.addEventListener('input', function() {
        clearTimeout(timeout);
        const query = searchQueryInput.value.trim();
        timeout = setTimeout(() => fetchResults(query), 100);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');
    if (initialQuery) {
        searchQueryInput.value = initialQuery;
        fetchResults(initialQuery);
    }
});