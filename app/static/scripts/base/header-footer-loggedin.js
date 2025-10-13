document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById('search-form');
    const searchQueryInput = document.getElementById('search-query');

    searchForm.addEventListener('submit', function(event) {
        const query = searchQueryInput.value.trim();
        if (!query) {
            event.preventDefault();
            alert('Please enter a search query.');
        }
    });

    // Function to select location


    // Set the location dropdown based on the currentUserLocation

});