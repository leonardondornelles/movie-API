const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');

const app = express();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'lecolecoPetelecoFernando1411?',
    database: 'api_filmes'
}).promise();

app.use(express.json());
app.use(cors());

// Define a porta em que o servidor vai rodar
const port = 3000;

// MIDDLEWARES --------------------

// Middleware Filmes
async function middlewareFilmeEncontrado(req, res, next) {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);
        if (rows.length > 0) {
            req.filme = rows[0];
            next();
        } else {
            res.status(404).send('Filme não encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no servidor ao buscar filme');
    }
};

// Middleware Reviews 
async function middlewareReviewEncontrada(req, res, next) {
    try {
        const { reviewId } = req.params;
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
        if (rows.length > 0) {
            req.review = rows[0];
            next();
        } else {
            res.status(404).send("Review não encontrada");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no servidor ao buscar a review.');
    }
};

// GETS ----------------------

// Rota principal - Apenas uma mensagem de boas-vindas
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Filmes e Reviews!');
});

// MOVIES ID --------------------------

// Nova rota GET para '/movies' em geral
app.get('/movies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM movies');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar os filmes');
    }
});

app.get('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
    res.status(200).json(req.filme);
});

app.get('/movies/:id/reviews', middlewareFilmeEncontrado, async (req, res) => {
    try {
        const movieId = req.filme.id;
        const [rows] = await pool.query('SELECT * FROM reviews WHERE movieId = ?', [movieId]);
        if (rows.length === 0) {
            res.status(200).send("Nenhuma review encontrada para este filme");
        } else {
            res.status(200).json(rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar as reviews');
    }
});

app.get('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    res.status(200).json(req.review);
});

// POSTS --------------
app.post('/movies', async (req, res) => {
    try {
        const { title, director, year } = req.body;
        const [result] = await pool.query(
            'INSERT INTO movies (title, director, year) VALUES (?, ?, ?)',
            [title, director, year]
        );
        const newMovie = { id: result.insertId, title, director, year };
        res.status(201).json(newMovie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar o filme.');
    }
});

app.post('/movies/:id/reviews', middlewareFilmeEncontrado, async (req, res) => {
    try {
        const { text, rating } = req.body;
        const movieId = req.filme.id;
        const [result] = await pool.query(
            'INSERT INTO reviews (movieId, text, rating) VALUES (?, ?, ?)',
            [movieId, text, rating]
        );
        const newReview = { id: result.insertId, movieId, text, rating };
        res.status(201).json(newReview);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar a review.');
    }
});

// PUT ------------------

app.put('/movies/:id', middlewareFilmeEncontrado, async (req, res) => {
    try {
        const { title, director, year } = req.body;
        const { id } = req.params;
        await pool.query(
            'UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?',
            [title, director, year, id]
        );
        const updatedMovie = { id: parseInt(id), title, director, year };
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar o filme.');
    }
});

app.put('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, async (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    try {
        const { text, rating } = req.body;
        const { reviewId } = req.params;
        await pool.query(
            'UPDATE reviews SET text = ?, rating = ? WHERE id = ?',
            [text, rating, reviewId]
        );
        const updatedReview = { ...req.review, text, rating };
        res.status(200).json(updatedReview);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar a review.');
    }
});

// DELETE --------------------

app.delete('/movies/:id', middlewareFilmeEncontrado, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM movies WHERE id = ?', [id]);
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao deletar o filme.');
    }
});

app.delete('/movies/:id/reviews/:reviewId', middlewareFilmeEncontrado, middlewareReviewEncontrada, async (req, res) => {
    if (req.filme.id !== req.review.movieId) {
        return res.status(400).send("Essa review não pertence a este filme");
    }
    try {
        const { reviewId } = req.params;
        await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao deletar a review.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});