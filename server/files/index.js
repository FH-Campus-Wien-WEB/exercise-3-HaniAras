import { ElementBuilder, ParentChildBuilder } from "./builders.js";
//importiert zwei Klassen aus builder.js

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
  // Erstellt einen Builder für <p>-Elemente, dessen Kinder <span>-Elemente sind.
  // super("p", "span") ruft den Konstruktor von ParentChildBuilder auf.
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
 //Gleiche Idee, aber für <ul>-Elemente mit <li>-Kindern.

}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
  //Wandelt Minuten in ein lesbares Format um. z.B. 109 → "1h 49m". Math.trunc
  // schneidet die Nachkommastellen ab, % gibt den Rest der Division zurück.
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
          .append(new ElementBuilder("img").with("src", movie.Poster))
          .append(new ElementBuilder("h1").text(movie.Title))
          .append(new ElementBuilder("p")
              .append(new ElementBuilder("button").text("Edit")
                    .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
          .append(new ParagraphBuilder().items(
              "Runtime " + formatRuntime(movie.Runtime),
              "\u2022",
              "Released on " +
                new Date(movie.Released).toLocaleDateString("en-US")))
          .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
          .append(new ElementBuilder("p").text(movie.Plot))
          .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
          .append(new ListBuilder().items(movie.Directors))
          .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
          .append(new ListBuilder().items(movie.Writers))
          .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
          .append(new ListBuilder().items(movie.Actors))
          .appendTo(element);
  //Baut ein <article>-Element für einen Film und hängt es an element an. Jede .append()-Zeile
  // fügt ein Kind-Element hinzu – Poster, Titel, Buttons, etc.
  // Am Ende .appendTo(element) fügt alles ins DOM ein.
}
function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  //Definiert die Funktion loadMovies.
  // Erstellt ein neues XMLHttpRequest-Objekt für den Server-Request.
  xhr.onload = function () {
    const mainElement = document.querySelector("main");
//Wenn die Antwort vom Server kommt: holt das <main>-Element und löscht alle
// vorhandenen Kinder – damit beim Wechsel des Genres die alten Filme verschwinden.

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
    //Wenn die Antwort vom Server kommt: holt das <main>-Element und löscht alle
    // vorhandenen Kinder – damit beim Wechsel des Genres die alten Filme verschwinden.
  }

  const url = new URL("/movies", location.href)
  /* Task 1.4. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.set("genre", genre);
  }
  xhr.open("GET", url)
  xhr.send()
  //Baut die URL /movies auf Basis der aktuellen Seite. Öffnet den GET-Request
  // und schickt ihn ab. Der Kommentar markiert, wo später der Genre-Parameter ergänzt wird.
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  //Wird ausgeführt, sobald die Seite fertig geladen ist. Erstellt einen neuen XHR für den /genres-Request.

  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
      const genres = JSON.parse(xhr.responseText);


      // "All"-Button als Erstes hinzufügen
      new ElementBuilder("button")
          .text("All")
          .listener("click", () => loadMovies())
          .appendTo(listElement);

      // Für jedes Genre einen Button hinzufügen
      for (const genre of genres) {
        new ElementBuilder("button")
            .text(genre)
            .listener("click", () => loadMovies(genre))
            .appendTo(listElement);
      }

      /* When a first button exists, we click it to load all movies. */
      // Ersten Button (All) automatisch klicken
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }

      //Wenn Genres erfolgreich geladen: parst die JSON-Antwort. Dann wird der erste Button in <nav> gesucht und
      // automatisch geklickt → das löst loadMovies() aus und lädt alle Filme. Hier fehlt noch der Code für Task 1.3
      // – die Buttons werden noch nicht erstellt.

    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
  //Schickt den GET-Request an /genres.

};
