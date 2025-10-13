function selectLocation(location) {
    // Update the text of the Location dropdown
    document.getElementById('locationDropdown').textContent = location;
    // Store the location in localStorage
    localStorage.setItem('selectedLocation', location);
    // Reload the page to fetch events based on the selected location
    location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch location from localStorage and update dropdown
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        document.getElementById('locationDropdown').textContent = savedLocation;
    }
});