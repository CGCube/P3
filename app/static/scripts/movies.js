document.addEventListener('DOMContentLoaded', function () {
    const moviesContainer = document.getElementById('movies-container');
    const loadingIndicator = document.getElementById('loading');
    let loading = false;
    let movieIndex = 0;
    let movies = [];

    function loadMovies() {
        if (loading || movieIndex >= movies.length) return;
        loading = true;
        loadingIndicator.style.display = 'block';

        const moviesToLoad = movies.slice(movieIndex, movieIndex + 8);
        moviesToLoad.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'col-md-3';
            movieCard.innerHTML = `
                <div class="card mb-4">
                    <img src="${movie.event_thumbnail}" class="card-img-top" alt="${movie.event_name}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.event_name}</h5>
                        <p class="card-text">${movie.event_description}</p>
                        <a href="/view_description?event_id=${movie.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                    </div>
                </div>
            `;
            moviesContainer.appendChild(movieCard);
        });

        movieIndex += 8;
        loading = false;
        if (movieIndex >= movies.length) {
            loadingIndicator.textContent = 'No more movies to load.';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    fetch(`/api/movies?location=${encodeURIComponent(localStorage.getItem('selectedLocation') || '')}`)
        .then(response => response.json())
        .then(data => {
            if (data.movies) {
                movies = data.movies;
                loadMovies(); // Initial load
            } else {
                console.error('Unexpected response format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading movies:', error);
        });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadMovies();
        }
    });

    // Fetch location from localStorage and update dropdown
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        document.getElementById('locationDropdown').textContent = savedLocation;
    }
});