const express = require('express');
const cors = require('cors');
let { movies, reviews } = require('./database.js');

const app = express();
app.use(express.static('.')); // Serve static files from the root directory
app.use(express.json());
app.use(cors());

const port = 3000;

// MIDDLEWARES
function middlewareFilmeEncontrado(req, res, next) {
    try {
        const { id } = req.params;
        const movie = movies.find(m => m.id == id);
        if (movie) {
            req.filme = movie;
            return next();
        }
        return res.status(404).send('Filme não encontrado');
    } catch (error) {
        console.error("Error in middlewareFilmeEncontrado:", error);
        return res.status(500).send('Erro no servidor');
    }
}

function middlewareReviewEncontrada(req, res, next) {
    try {
        const { reviewId } = req.params;
        const review = reviews.find(r => r.id == reviewId);
        if (review) {
            req.review = review;
            return next();
        }
        return res.status(404).send("Review não encontrada");
    } catch (error) {
        console.error("Error in middlewareReviewEncontrada:", error);
        return res.status(500).send('Erro no servidor');
    }
}

// GETS
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Filmes e Reviews!');
});

app.get('/movies', (req, res) => {
    try {
        res.json(movies);
    } catch (error) {
        console.error("Error in GET /movies:", error);
        res.status(500).send('Erro ao buscar os filmes');
    }
});

app.get('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    try {
        res.status(200).json(req.filme);
    } catch (error) {
        console.error(`Error in GET /movies/${req.params.id}:`, error);
        res.status(500).send('Erro ao buscar o filme');
    }
});

app.get('/movies/:id/reviews', middlewareFilmeEncontrado, (req, res) => {
    try {
        const movieReviews = reviews.filter(r => r.movieId == req.filme.id);
        res.status(200).json(movieReviews);
    } catch (error) {
        console.error(`Error in GET /movies/${req.params.id}/reviews:`, error);
        res.status(500).send('Erro ao buscar as reviews');
    }
});

app.get('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    try {
        if (req.filme.id !== req.review.movieId) {
            return res.status(400).send("Essa review não pertence a este filme");
        }
        res.status(200).json(req.review);
    } catch (error) {
        console.error(`Error in GET /movies/${req.params.id}/reviews/${req.params.reviewId}:`, error);
        res.status(500).send('Erro ao buscar a review');
    }
});

// POSTS
app.post('/movies', (req, res) => {
    try {
        const { title, director, year } = req.body;
        if (!title || !director || !year) {
            return res.status(400).send('Dados incompletos para criar o filme.');
        }
        const newId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1;
        const newMovie = { id: newId, title, director, year: parseInt(year) };
        movies.push(newMovie);
        res.status(201).json(newMovie);
    } catch (error) {
        console.error("Error in POST /movies:", error);
        res.status(500).send('Erro ao criar o filme.');
    }
});

app.post('/movies/:id/reviews', middlewareFilmeEncontrado, (req, res) => {
    try {
        const { text, rating } = req.body;
        if (!text || !rating) {
            return res.status(400).send('Dados incompletos para criar a review.');
        }
        const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
        const newReview = { id: newId, movieId: req.filme.id, text, rating: parseInt(rating) };
        reviews.push(newReview);
        res.status(201).json(newReview);
    } catch (error) {
        console.error(`Error in POST /movies/${req.params.id}/reviews:`, error);
        res.status(500).send('Erro ao criar a review.');
    }
});

// PUT
app.put('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    try {
        const { title, director, year } = req.body;
        if (!title || !director || !year) {
            return res.status(400).send('Dados incompletos para atualizar o filme.');
        }
        const movieIndex = movies.findIndex(m => m.id == req.filme.id);
        const updatedMovie = { ...movies[movieIndex], title, director, year: parseInt(year) };
        movies[movieIndex] = updatedMovie;
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.error(`Error in PUT /movies/${req.params.id}:`, error);
        res.status(500).send('Erro ao atualizar o filme.');
    }
});

app.put('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    try {
        if (req.filme.id !== req.review.movieId) {
            return res.status(400).send("Essa review não pertence a este filme");
        }
        const { text, rating } = req.body;
        if (!text || !rating) {
            return res.status(400).send('Dados incompletos para atualizar a review.');
        }
        const reviewIndex = reviews.findIndex(r => r.id == req.review.id);
        const updatedReview = { ...reviews[reviewIndex], text, rating: parseInt(rating) };
        reviews[reviewIndex] = updatedReview;
        res.status(200).json(updatedReview);
    } catch (error) {
        console.error(`Error in PUT /movies/${req.params.id}/reviews/${req.params.reviewId}:`, error);
        res.status(500).send('Erro ao atualizar a review.');
    }
});

// DELETE
app.delete('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    try {
        movies = movies.filter(m => m.id != req.filme.id);
        reviews = reviews.filter(r => r.movieId != req.filme.id);
        res.status(204).end();
    } catch (error) {
        console.error(`Error in DELETE /movies/${req.params.id}:`, error);
        res.status(500).send('Erro ao deletar o filme.');
    }
});

app.delete('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    try {
        if (req.filme.id !== req.review.movieId) {
            return res.status(400).send("Essa review não pertence a este filme");
        }
        reviews = reviews.filter(r => r.id != req.review.id);
        res.status(204).end();
    } catch (error) {
        console.error(`Error in DELETE /movies/${req.params.id}/reviews/${req.params.reviewId}:`, error);
        res.status(500).send('Erro ao deletar a review.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});