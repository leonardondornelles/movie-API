
const express = require('express');

const { movies, reviews } = require('./database.js');


const app = express();

app.use(express.json());

// Define a porta em que o servidor vai rodar
const port = 3000;

// GETS ----------------------

// MOVIES ID --------------------------
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
    if(reviewEncontrada.length < 0){
      res.status(404).send("Review não encontrado");
    }else{
      res.status(200).json(reviewEncontrada);
    }
  }
});

// Rota principal - Apenas uma mensagem de boas-vindas
app.get('/', (req, res) => {
  console.log("http://localhost:3000/")
  res.send('Bem-vindo à API de Filmes e Reviews!');
});

// Nova rota GET para '/movies' em geral
app.get('/movies', (req, res) => {
  res.json(movies);
});

// POSTS --------------

app.post('/movies', (req, res) => {
    const newMovie = req.body;
    
    movies.push(newMovie);

    res.status(201).json(newMovie);
})

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

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});