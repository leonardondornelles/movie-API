let movies = [
    {
        id: 1,
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010
    },
    {
        id: 2,
        title: "The Matrix",
        director: "Wachowski Sisters",
        year: 1999
    }
];

let reviews =[
  {
    "id": 1,
    "movieId": 1,
    "text": "Fiquei maluco vendo sério",
    "rating": 5
  },
  {
    "id": 2,
    "movieId": 2,
    "text": "Doideira a simulação e tals",
    "rating": 5
  },
  {
    "id": 3,
    "movieId": 1,
    "text": "O roteiro é um pouco confuso, mas os efeitos especiais são incríveis.",
    "rating": 4
  },
  {
    "id": 4,
    "movieId": 3,
    "text": "Uma obra-prima do cinema! Atuações impecáveis e uma história emocionante.",
    "rating": 5
  },
  {
    "id": 5,
    "movieId": 2,
    "text": "Não gostei muito do final, achei que poderia ter sido melhor desenvolvido.",
    "rating": 3
  },
  {
    "id": 6,
    "movieId": 4,
    "text": "Filme perfeito para ver com a família, muito divertido e leve.",
    "rating": 4
  },
  {
    "id": 7,
    "movieId": 3,
    "text": "Esperava mais, a história não me prendeu.",
    "rating": 2
  },
  {
    "id": 8,
    "movieId": 5,
    "text": "Que fotografia espetacular! Cada cena é uma pintura.",
    "rating": 5
  },
  {
    "id": 9,
    "movieId": 1,
    "text": "Achei bem mediano, não entendi todo o hype em cima desse filme.",
    "rating": 3
  },
  {
    "id": 10,
    "movieId": 5,
    "text": "A trilha sonora é o ponto alto do filme, simplesmente fantástica.",
    "rating": 4
  }
];

module.exports = {
    movies,
    reviews
};