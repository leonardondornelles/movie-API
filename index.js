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
    const { id } = req.params;
    const movie = movies.find(m => m.id == id);
    if (movie) {
        req.filme = movie;
        return next();
    }
    return res.status(404).send('Filme não encontrado');
}

function middlewareReviewEncontrada(req, res, next) {
    const { reviewId } = req.params;
    const review = reviews.find(r => r.id == reviewId);
    if (review) {
        req.review = review;
        return next();
    }
    return res.status(404).send("Review não encontrada");
}

// GETS
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Filmes e Reviews!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    res.status(200).json(req.filme);
});

app.get('/movies/:id/reviews', middlewareFilmeEncontrado, (req, res) => {
    const movieReviews = reviews.filter(r => r.movieId == req.filme.id);
    if (movieReviews.length === 0) {
        // Return empty array to be consistent, instead of a string message
        res.status(200).json([]);
    } else {
        res.status(200).json(movieReviews);
    }
});

app.get('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    res.status(200).json(req.review);
});

// POSTS
app.post('/movies', (req, res) => {
    const { title, director, year } = req.body;
    const newId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1;
    const newMovie = { id: newId, title, director, year: parseInt(year) };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.post('/movies/:id/reviews', middlewareFilmeEncontrado, (req, res) => {
    const { text, rating } = req.body;
    const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    const newReview = { id: newId, movieId: req.filme.id, text, rating: parseInt(rating) };
    reviews.push(newReview);
    res.status(201).json(newReview);
});

// PUT
app.put('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    const { title, director, year } = req.body;
    const movieIndex = movies.findIndex(m => m.id == req.filme.id);
    const updatedMovie = { ...movies[movieIndex], title, director, year: parseInt(year) };
    movies[movieIndex] = updatedMovie;
    res.status(200).json(updatedMovie);
});

app.put('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    const { text, rating } = req.body;
    const reviewIndex = reviews.findIndex(r => r.id == req.review.id);
    const updatedReview = { ...reviews[reviewIndex], text, rating: parseInt(rating) };
    reviews[reviewIndex] = updatedReview;
    res.status(200).json(updatedReview);
});

// DELETE
app.delete('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    movies = movies.filter(m => m.id != req.filme.id);
    // Also delete associated reviews
    reviews = reviews.filter(r => r.movieId != req.filme.id);
    res.status(204).end();
});

app.delete('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    reviews = reviews.filter(r => r.id != req.review.id);
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});