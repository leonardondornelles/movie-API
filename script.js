document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';

    // Elementos do DOM
    const moviesGrid = document.getElementById('movies-grid');
    const movieDetailsContainer = document.getElementById('movie-details-container');
    const moviesGridContainer = document.getElementById('movies-grid-container');
    
    // Modals e Formulários
    const movieModal = document.getElementById('movie-modal');
    const reviewModal = document.getElementById('review-modal');
    const movieForm = document.getElementById('movie-form');
    const reviewForm = document.getElementById('review-form');
    
    const modalTitle = document.getElementById('modal-title');
    const movieIdInput = document.getElementById('movie-id');
    const titleInput = document.getElementById('title');
    const directorInput = document.getElementById('director');
    const yearInput = document.getElementById('year');

    const TMDB_API_KEY = '8465b48c5bef30c62c8bf149e90ecc1a';
    const TMDB_API_URL = 'https://api.themoviedb.org/3';

    // Função para buscar a URL do pôster no TMDb
    const getPosterUrl = async (title) => {
        try {
            const response = await fetch(`${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            const data = await response.json();
            if (data.results && data.results.length > 0 && data.results[0].poster_path) {
                return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
            }
        } catch (error) {
            console.error('Error fetching poster from TMDb for title:', title, error);
        }
        // URL de fallback caso o pôster não seja encontrado
        return `https://placehold.co/300x450/f8f9fa/6c757d?text=${encodeURIComponent(title.replace(' ', '+'))}`;
    };

    async function fetchAndDisplayMovies() {
        try {
            const response = await fetch(`${API_URL}/movies`);
            const movies = await response.json();
            
            moviesGrid.innerHTML = ''; // Clear previous content

            for (const movie of movies) {
                const posterUrl = await getPosterUrl(movie.title); // Await the poster URL

                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                movieCard.dataset.id = movie.id;

                movieCard.innerHTML = `
                    <img src="${posterUrl}" alt="Pôster de ${movie.title}">
                    <div class="movie-card-info">
                        <div>
                            <h3>${movie.title}</h3>
                            <p>${movie.year}</p>
                        </div>
                    </div>
                    <div class="movie-actions">
                        <button class="edit-btn" data-id="${movie.id}">Editar</button>
                        <button class="delete-btn" data-id="${movie.id}">Excluir</button>
                    </div>
                `;
                moviesGrid.appendChild(movieCard);
            }
        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
        }
    }

    async function fetchAndDisplayDetails(movieId) {
        try {
            const movieResponse = await fetch(`${API_URL}/movies/${movieId}`);
            const movie = await movieResponse.json();

            const reviewsResponse = await fetch(`${API_URL}/movies/${movieId}/reviews`);
            const reviews = await reviewsResponse.json();

            const posterUrl = await getPosterUrl(movie.title); // Await the poster URL

            movieDetailsContainer.innerHTML = `
                <button id="back-to-list-btn">&larr; Voltar à Lista</button>
                <div class="details-header">
                    <div class="details-poster">
                        <img src="${posterUrl}" alt="Pôster de ${movie.title}">
                    </div>
                    <div class="details-info">
                        <div>
                            <h2>${movie.title}</h2>
                            <p><strong>Diretor:</strong> ${movie.director}</p>
                            <p><strong>Ano:</strong> ${movie.year}</p>
                        </div>
                        <button id="add-review-btn" data-id="${movie.id}">Adicionar Review</button>
                    </div>
                </div>

                <div class="reviews-section">
                    <h3>Reviews</h3>
                    <div id="reviews-list">
                        ${Array.isArray(reviews) && reviews.length > 0 ? reviews.map(review => `
                            <div class="review-item">
                                <p><strong>Nota:</strong> ${'⭐'.repeat(review.rating)}</p>
                                <p>${review.text}</p>
                            </div>
                        `).join('') : '<p>Nenhuma review ainda.</p>'}
                    </div>
                </div>
            `;
            
            movieDetailsContainer.classList.remove('hidden');
            moviesGridContainer.classList.add('hidden');

        } catch (error) {
            console.error('Erro ao buscar detalhes do filme:', error);
        }
    }
    
    // Delegação de eventos para o grid de filmes
    moviesGrid.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        const editButton = e.target.closest('.edit-btn');
        const deleteButton = e.target.closest('.delete-btn');
        
        if (editButton) {
            openMovieModal(editButton.dataset.id);
            return;
        }
        if (deleteButton) {
            deleteMovie(deleteButton.dataset.id);
            return;
        }
        if (movieCard) {
            fetchAndDisplayDetails(movieCard.dataset.id);
        }
    });

    movieDetailsContainer.addEventListener('click', (e) => {
        if (e.target.id === 'back-to-list-btn') {
            movieDetailsContainer.classList.add('hidden');
            moviesGridContainer.classList.remove('hidden');
        }
        if (e.target.id === 'add-review-btn') {
            openReviewModal(e.target.dataset.id);
        }
    });

    async function deleteMovie(movieId) {
        if (confirm('Tem certeza que deseja excluir este filme?')) {
            try {
                await fetch(`${API_URL}/movies/${movieId}`, { method: 'DELETE' });
                fetchAndDisplayMovies(); 
            } catch (error) {
                console.error('Erro ao excluir filme:', error);
            }
        }
    }
    
    function openMovieModal(movieId = null) {
        movieForm.reset();
        if (movieId) {
            modalTitle.textContent = 'Editar Filme';
            fetch(`${API_URL}/movies/${movieId}`)
                .then(res => res.json())
                .then(movie => {
                    movieIdInput.value = movie.id;
                    titleInput.value = movie.title;
                    directorInput.value = movie.director;
                    yearInput.value = movie.year;
                });
        } else {
            modalTitle.textContent = 'Adicionar Filme';
            movieIdInput.value = '';
        }
        movieModal.classList.remove('hidden');
    }

    function openReviewModal(movieId) {
        reviewForm.reset();
        document.getElementById('review-movie-id').value = movieId;
        reviewModal.classList.remove('hidden');
    }

    function closeModal() {
        movieModal.classList.add('hidden');
        reviewModal.classList.add('hidden');
    }

    document.getElementById('add-movie-btn').addEventListener('click', () => openMovieModal());
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', closeModal));
    window.addEventListener('click', (e) => {
        if (e.target === movieModal || e.target === reviewModal) closeModal();
    });

    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = movieIdInput.value;
        const movieData = {
            title: titleInput.value,
            director: directorInput.value,
            year: yearInput.value
        };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/movies/${id}` : `${API_URL}/movies`;
        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });
            closeModal();
            fetchAndDisplayMovies();
        } catch (error) {
            console.error('Erro ao salvar filme:', error);
        }
    });

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const movieId = document.getElementById('review-movie-id').value;
        const reviewData = {
            rating: document.getElementById('rating').value,
            text: document.getElementById('text').value
        };
        try {
            await fetch(`${API_URL}/movies/${movieId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            closeModal();
            fetchAndDisplayDetails(movieId);
        } catch (error) {
            console.error('Erro ao adicionar review:', error);
        }
    });

    fetchAndDisplayMovies();
});
