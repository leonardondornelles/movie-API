
const express = require('express');

const { movies, reviews } = require('./database.js');


const app = express();

app.use(express.json());

// Define a porta em que o servidor vai rodar
const port = 3000;

// MIDDLEWARES --------------------

// Middleware Filmes

function middlewareFilmeEncontrado(req, res, next){
  id = req.params.id;
  filmeEncontrado = movies.find(filme => filme.id === parseInt(id));

  if(filmeEncontrado){
    req.filme = filmeEncontrado;
    req.indiceFilme = movies.findIndex(filme => filme.id === parseInt(id));
    next();
  }else{
    res.status(404).send("Filme não encontrado");
  }
};

// Middleware Reviews 

function middlewareReviewEncontrada(req, res, next){
  reviewId = req.params.reviewId;
  reviewEncontrada = reviews.find(review => review.id === parseInt(reviewId));

  if(reviewEncontrada){
    req.review = reviewEncontrada;
    req.indiceReview = reviews.findIndex(review => review.id === parseInt(reviewId));
    req.idFilmeAvaliado = reviewEncontrada.movieId;
    next();
  }else{
    res.status(404).send("Review Não Encontrada")
  }
};

// GETS ----------------------

// Rota principal - Apenas uma mensagem de boas-vindas
app.get('/', (req, res) => {
  console.log("http://localhost:3000/")
  res.send('Bem-vindo à API de Filmes e Reviews!');
});

// MOVIES ID --------------------------

// Nova rota GET para '/movies' em geral
app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/movies/:id', middlewareFilmeEncontrado, (req, res) => {
  res.status(202).json(req.filme);
});

app.get('/movies/:id/reviews', (req, res) => {
  const id = req.params.id;
  const reviewEncontrada = reviews.filter(review => review.movieId === parseInt(id));
  const filmeEncontrado = movies.find(filme => filme.id === parseInt(id));

  if(!filmeEncontrado){
    res.status(404).send("Filme não encontrado");
  }else{
    if(reviewEncontrada.length === 0){
      res.status(200).send("Review não encontrado");
    }else{
      res.status(200).json(reviewEncontrada);
    }
  }
});

app.get('/movies/:id/reviews/:reviewId', (req, res) => {
  const movieId = req.params.id;
  const reviewId = req.params.reviewId;

  const filmeEncontrado = movies.find(filme => filme.id === parseInt(movieId));

  if(!filmeEncontrado){
    return res.status(404).send("Filme não encontrado");
  }

  const reviewEncontrada = reviews.find(review => review.id === parseInt(reviewId));

  if(!reviewEncontrada){
    return res.status(404).send("Review não encontrada");
  }

  if(filmeEncontrado.id !== reviewEncontrada.movieId)
  {
    res.status(400).send("Essa review não pertence a este filme");
  }else{
    res.status(200).json(reviewEncontrada);
  }
})

// POSTS --------------
app.post('/movies', (req, res) => {
    let newId = 1;
    if (movies.length > 0) {
        const maxId = Math.max(...movies.map(filme => filme.id));
        newId = maxId + 1;
    }
    
    const newMovie = {
        id: newId,
        title: req.body.title,
        director: req.body.director,
        year: req.body.year
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
});

app.post('/movies/:id/reviews', (req, res) => {
  const id = req.params.id;
  const filmeEncontrado = movies.find(filme => filme.id === parseInt(id));
    
  const todosOsIds = reviews.map(review => review.id);
  const maiorId = Math.max(...todosOsIds);
    

    if(!filmeEncontrado){
      return res.status(404).send("Filme não encontrado");
    }
      
    let newReviewId = 1;
    if (reviews.length > 0) {
        newReviewId = maiorId + 1;
    }

    const newReview = {
        id: newReviewId,
        movieId: id,
        text: req.body.text,
        rating: req.body.rating
    };

    reviews.push(newReview);
    res.status(201).json(newReview);
});


// PUT ------------------

app.put('/movies/:id', (req, res) =>{
    const id = req.params.id;
    const filmeEncontrado = movies.find(filme => filme.id === parseInt(id));

    if(!filmeEncontrado){
      res.status(404).send("Filme não encontrado");
    }else{
      filmeEncontrado.title = req.body.title;
      filmeEncontrado.director = req.body.director;
      filmeEncontrado.year = req.body.year;

      res.status(200).json(filmeEncontrado);
    }
});

app.put('/movies/:id/reviews/:reviewId', (req, res) => {
  const id = req.params.id;
  const reviewId = req.params.reviewId;

  const filmeEncontrado = movies.find(filme => filme.id === parseInt(id));

    if(!filmeEncontrado){
      return res.status(404).send("Filme não encontrado");
    }
  
    const reviewEncontrada = reviews.find(review => review.id === parseInt(reviewId));

  if(!reviewEncontrada){
    return res.status(404).send("Review não encontrada");
  }

  if(filmeEncontrado.id !== reviewEncontrada.movieId)
  {
    return res.status(400).send("Essa review não pertence a este filme");
  }else{
    reviewEncontrada.text = req.body.text;
    reviewEncontrada.rating = req.body.rating;

    res.status(200).json(reviewEncontrada);
  }
});

// DELETE --------------------

app.delete('/movies/:id', middlewareFilmeEncontrado, (req, res) =>{
  const indiceFilme = req.indiceFilme;
  
  movies.splice(indiceFilme, 1);

  res.status(204).end();
});

app.delete('/movies/:id/reviews/:reviewId', (req, res) =>{
  const movieId = req.params.id;
  const reviewId = req.params.reviewId;

  const filmeEncontrado = movies.find(filme => filme.id === parseInt(movieId));

  if(!filmeEncontrado){
    return res.status(404).send("Filme não encontrado");
  }

  const indiceDaReview = reviews.findIndex(r => r.id === parseInt(reviewId));

  if(indiceDaReview === -1){
    return res.status(404).send("Review não encontrada");
  }

  if(filmeEncontrado.id !== reviews.at(indiceDaReview).movieId)
  {
    return res.status(400).send("Essa review não pertence a este filme");
  }else{
    reviews.splice(indiceDaReview, 1);
    res.status(204).end();
  }
});


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});