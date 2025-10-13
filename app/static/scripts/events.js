document.addEventListener('DOMContentLoaded', function () {
    const eventsContainer = document.getElementById('events-container');
    const loadingIndicator = document.getElementById('loading');
    let loading = false;
    let eventIndex = 0;
    let events = [];

    function loadEvents() {
        if (loading || eventIndex >= events.length) return;
        loading = true;
        loadingIndicator.style.display = 'block';

        const eventsToLoad = events.slice(eventIndex, eventIndex + 8);
        eventsToLoad.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'col-md-3';
            eventCard.innerHTML = `
                <div class="card mb-4">
                    <img src="${event.event_thumbnail}" class="card-img-top" alt="${event.event_name}">
                    <div class="card-body">
                        <h5 class="card-title">${event.event_name}</h5>
                        <p class="card-text">${event.event_description}</p>
                        <a href="/view_description?event_id=${event.event_id}" class="btn" style="background-color: #212529; color: white;">Book Ticket</a>
                    </div>
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });

        eventIndex += 8;
        loading = false;
        if (eventIndex >= events.length) {
            loadingIndicator.textContent = 'No more events to load.';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    fetch(`/api/events?location=${encodeURIComponent(localStorage.getItem('selectedLocation') || '')}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.events) {
                events = data.events.events;
                loadEvents(); // Initial load
            } else {
                console.error('Unexpected response format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading events:', error);
        });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadEvents();
        }
    });

    // Fetch location from localStorage and update dropdown
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        document.getElementById('locationDropdown').textContent = savedLocation;
    }
});