document.addEventListener('DOMContentLoaded', function () {
    const showsContainer = document.getElementById('shows-container');
    const loadingIndicator = document.getElementById('loading');
    let loading = false;
    let showIndex = 0;
    let shows = [];

    function loadShows() {
        if (loading || showIndex >= shows.length) return;
        loading = true;
        loadingIndicator.style.display = 'block';

        const showsToLoad = shows.slice(showIndex, showIndex + 8);
        showsToLoad.forEach(show => {
            const showCard = document.createElement('div');
            showCard.className = 'col-md-3';
            showCard.innerHTML = `
                <div class="card mb-4">
                    <img src="${show.event_thumbnail}" class="card-img-top" alt="${show.event_name}">
                    <div class="card-body">
                        <h5 class="card-title">${show.event_name}</h5>
                        <p class="card-text">${show.event_description}</p>
                        <a href="/view_description?event_id=${show.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                    </div>
                </div>
            `;
            showsContainer.appendChild(showCard);
        });

        showIndex += 8;
        loading = false;
        if (showIndex >= shows.length) {
            loadingIndicator.textContent = 'No more shows to load.';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    fetch(`/api/shows?location=${encodeURIComponent(localStorage.getItem('selectedLocation') || '')}`)
        .then(response => response.json())
        .then(data => {
            if (data.shows) {
                shows = data.shows;
                loadShows(); // Initial load
            } else {
                console.error('Unexpected response format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading shows:', error);
        });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadShows();
        }
    });

    // Fetch location from localStorage and update dropdown
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        document.getElementById('locationDropdown').textContent = savedLocation;
    }
});