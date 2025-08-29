
const express = require('express');

const { movies, reviews } = require('./database.js');


const app = express();

app.use(express.json());

// Define a porta em que o servidor vai rodar
const port = 3000;



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

app.get('/movies/:id', (req, res) => {
  const id = req.params.id;
  const filmeEncontrado = movies.find(filme => filme.id === parseInt(id));

  if(!filmeEncontrado){
    res.status(404).send("Filme não encontrado");
  }else{
    res.status(200).json(filmeEncontrado);
  }
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
    const todosOsIds = movies.map(filme => filme.id);
    const maiorId = Math.max(...todosOsIds);
    
    let newMovieId;

    if(movies.length < 1){
      newMovieId.id = 1;
    }else{
      newMovieId.id = maiorId + 1;
    }
    
    const newMovie = {
      id: newMovieId,
      title: newMovieData.title,
      director: newMovieData.director,
      year: newMovieData.year
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
      
    let newReviewId;
    if (reviews.length === 0) {
        newReviewId = 1;
    } else {
        const todosOsIds = reviews.map(review => review.id);
        const maiorId = Math.max(...todosOsIds);
        newReviewId = maiorId + 1;
    }

    const newReview = {
        id: newReviewId,
        movieId: movieId,
        text: newReviewData.text,
        rating: newReviewData.rating
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

app.delete('/movies/:id', (req, res) =>{
  const id = req.params.id;
  const indiceFilme = movies.findIndex(filme => filme.id === parseInt(id));

  if(indiceFilme == -1){
    res.status(404).send("Filme não encontrado");
  }else{
    movies.splice(indiceFilme, 1);

    res.status(204).end();
  }
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