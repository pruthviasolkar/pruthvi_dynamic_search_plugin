document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('dsp-search-input');
    const resultsContainer = document.getElementById('dsp-results');
    const iconContainer = document.querySelector('.icon');

    // Initially hide the results container
    resultsContainer.style.display = 'none';

    let debounceTimer;
    let currentPage = 1;
    let lastSearchTerm = '';

    const fetchResults = (query, page = 1) => {
        // Show loading indicator only if input is not empty
        resultsContainer.innerHTML = query ? '<p>Loading...</p>' : '';
        resultsContainer.style.display = query ? 'block' : 'none'; // Show only if query exists

        fetch(dspAjax.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'dsp_search',
                query: query,
                paged: page,
                security: dspAjax.security
            })
        })
        .then(response => response.json())
        .then(data => {
            if (page === 1) resultsContainer.innerHTML = ''; // Clear previous results
            if (data.results.length > 0) {
                data.results.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'dsp-result';
                    postElement.innerHTML = `
                        <h3><a href="${post.link}">${post.title}</a></h3>
                        <p>${post.excerpt}</p>
                    `;
                    resultsContainer.appendChild(postElement);
                });

                if (data.has_more) {
                    const loadMore = document.createElement('button');
                    loadMore.textContent = 'Load More';
                    loadMore.className = 'load-more-button'; // Assign a class for styling
                    loadMore.addEventListener('click', () => {
                        currentPage++;
                        fetchResults(query, currentPage);
                    });
                    resultsContainer.appendChild(loadMore);
                }
            } else {
                resultsContainer.innerHTML = '<p>No results found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching results:', error);
            resultsContainer.innerHTML = '<p>Error fetching results.</p>';
        });
    };

    // Event listener for search input field
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        clearTimeout(debounceTimer);

        if (query.length > 0) {
            debounceTimer = setTimeout(() => {
                currentPage = 1;
                lastSearchTerm = query;
                fetchResults(query);
            }, 300); // Wait for 300ms after user stops typing
        } else {
            lastSearchTerm = ''; // Reset search term
            resultsContainer.style.display = 'none'; // Hide results container if input is cleared
            resultsContainer.innerHTML = ''; // Clear results container
        }
    });

    // Optional: Handle icon click behavior (if you want any action)
    iconContainer.addEventListener('click', () => {
        // You can define any action for the icon here, such as clearing the search
        searchInput.value = ''; // Clear the search input field
        resultsContainer.style.display = 'none'; // Hide results container
        resultsContainer.innerHTML = ''; // Clear results container
    });
});
