const express = require('express'); //Framework- fertige Bibliothek wird importiert
const path = require('path'); //eingebautes Node.jsTool
const bodyParser = require('body-parser'); //wandelt Text in Js um, wenn Client (z.B.PUT) Daten schickt
const movieModel = require('./movie-model.js'); //Filmdaten werden aus der anderen Datei (movie-model.js) geladen

const app = express();  // Erstellung der Server-app

// Parse urlencoded bodies (wenn ANfrage reinkommt, wandle es in Jason um zumB. bei Put Endpoint
app.use(bodyParser.json()); 

// Serve static content in directory 'files', aktueller Order ist __dirname
app.use(express.static(path.join(__dirname, 'files')));

/* Task 1.2: Add a GET /genres endpoint:
   This endpoint returns a sorted array of all the genres of the movies
   that are currently in the movie model.
*/
app.get('/genres', function (req, res) {
  const movies = Object.values(movieModel);
  // Genres ist bereits ein Array, daher flatMap direkt
  const allGenres = movies.flatMap(movie => movie.Genres);

  // Duplikate entfernen und alphabetisch sortieren
  const uniqueSortedGenres = [...new Set(allGenres)].sort();

  res.send(uniqueSortedGenres);
});

/* Task 1.4: Extend the GET /movies endpoint:
   When a query parameter for a specific genre is given, 
   return only movies that have the given genre
 */
app.get('/movies', function (req, res) { //GET /movies Endpoint, Aufrufen der Liste
  let movies = Object.values(movieModel) //holt alle Filme aus dem Objekt als Array

  // Wenn ein Genre als Query-Parameter mitgeschickt wurde, filtern wir die Filme
  const genre = req.query.genre;
  if (genre) {
    movies = movies.filter(movie => movie.Genres.includes(genre));
  }

  res.send(movies); //schickt die Filme als Antwort zurück
})

//Daten holen
// Configure a 'get' endpoint for a specific movie
app.get('/movies/:imdbID', function (req, res) { //holt einen bestimmten Film. die id ist der Platzhalter
  const id = req.params.imdbID // hier wird der Wert aus der URL gelesen
  const exists = id in movieModel   // prüfung ob der Film existiert
 
  if (exists) {
    res.send(movieModel[id])
  } else {
    res.sendStatus(404)    
  }
})

//Daten speichern
app.put('/movies/:imdbID', function(req, res) {  //PUT /moovies Entpoint aktualiesiert oder erstellt neuen Film

  const id = req.params.imdbID
  const exists = id in movieModel

  movieModel[req.params.imdbID] = req.body;
  
  if (!exists) {
    res.status(201)
    res.send(req.body)
  } else {
    res.sendStatus(200)
  }
  
})

app.listen(3000)

console.log("Server now listening on http://localhost:3000/")
