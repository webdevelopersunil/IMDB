const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const moviesFavList = document.getElementById('movies-fav-list');
const gridListContainer = document.getElementById('grid-list-container');
const cleanFavListBtn = document.getElementById('clean-fav-list-btn');
const apiKey = "6ebc8537";
let favMoviesList = [];


// Check if the array exists in localStorage
!localStorage.getItem('myFavMoviesArray') ? localStorage.setItem('myFavMoviesArray', JSON.stringify([])) : null;
let myFavMoviesArray = JSON.parse(localStorage.getItem('myFavMoviesArray'));


// load movies from API
async function loadMovies(searchTerm){
    console.log("Load Moviesz");
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=${apiKey}`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    // console.log(data.Search);
    if(data.Response == "True") displayMovieList(data.Search);
}

// Finding the Movie with search Keywords
function findMovies(){
    let searchTerm = (movieSearchBox.value).trim();
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

// For display the movies in a search lists
function displayMovieList(movies){
    searchList.innerHTML = "";
    for(let idx = 0; idx < movies.length; idx++){
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID; // setting movie id in  data-id
        movieListItem.classList.add('search-list-item');
        if(movies[idx].Poster != "N/A")
            moviePoster = movies[idx].Poster;
        else 
            moviePoster = "image_not_found.png";

        movieListItem.innerHTML = `
        <div class = "search-item-thumbnail">
            <img src = "${moviePoster}">
        </div>
        <div class = "search-item-info">
            <h3>${movies[idx].Title}</h3>
            <p>${movies[idx].Year}</p>
        </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

// For choosen movies selection from searches
function loadMovieDetails(){
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    console.log(searchListMovies);
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            // console.log(movie.dataset.id);
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const result = await fetch(`https://omdbapi.com/?i=${movie.dataset.id}&apikey=${apiKey}`);
            const movieDetails = await result.json();
            // console.log(movieDetails);
            displayMovieDetails(movieDetails);
        });
    });
}


// To display the selected movie details
function displayMovieDetails(details,isFav=null){
    gridListContainer.innerHTML = '';
    resultGrid.innerHTML = `
    <div class = "movie-poster">
        <img src = "${(details.Poster != "N/A") ? details.Poster : "image_not_found.png"}" alt = "movie poster">
    </div>
    <div class = "movie-info">
        
    <div class="movie-title-fav-button">
        <h3 class="movie-title">${details.Title}</h3>&nbsp;&nbsp;
        <button id="add-to-fav" onclick="addToFav('${details.imdbID}')" title="Add to favourite">

            <i class="fa fa-heart ${(isFav==1) ? "favorite" : ""} " aria-hidden="true" id="heart-icon-${details.imdbID}"></i>
        </button>
    </div>

        <ul class = "movie-misc-info">
            <li class = "year">Year: ${details.Year}</li>
            <li class = "rated">Ratings: ${details.Rated}</li>
            <li class = "released">Released: ${details.Released}</li>
        </ul>
        <p class = "genre"><b>Genre:</b> ${details.Genre}</p>
        <p class = "writer"><b>Writer:</b> ${details.Writer}</p>
        <p class = "actors"><b>Actors: </b>${details.Actors}</p>
        <p class = "plot"><b>Plot:</b> ${details.Plot}</p>
        <p class = "language"><b>Language:</b> ${details.Language}</p>
        <p class = "awards"><b><i class = "fas fa-award"></i></b> ${details.Awards}</p>
    </div>
    `;
}


window.addEventListener('click', (event) => {
    if(event.target.className != "form-control"){
        searchList.classList.add('hide-search-list');
    }
});



// Adding movie to the favourites list
const addToFav = (imdbID) => {
    
    if (!myFavMoviesArray.includes(imdbID)) {

        myFavMoviesArray.push(imdbID);

        // Update the local Storage with new movie item
        updateLocalStorageArray('myFavMoviesArray',myFavMoviesArray);

        // Add the movie to favorites and change the heart icon color
        const heartIcon = document.getElementById(`heart-icon-${imdbID}`);
        heartIcon.classList.add('favorite');

    }else{

        const indexToRemove = myFavMoviesArray.indexOf(imdbID);
        if (indexToRemove !== -1) {
            myFavMoviesArray.splice(indexToRemove, 1);
        }

        // Update the local Storage with new movie item
        updateLocalStorageArray('myFavMoviesArray',myFavMoviesArray);

        // Remove the movie to favorites and change the heart icon color
        const heartIcon = document.getElementById(`heart-icon-${imdbID}`);
        heartIcon.classList.remove('favorite');
    }
    // console.log(myFavMoviesArray);
};


// Updating the local storage var with updated Array
function updateLocalStorageArray(arrVar,arr){
    localStorage.setItem(arrVar, JSON.stringify(arr));
}


// To fetch movies lists from favourite lists
moviesFavList.addEventListener('click', async () => {

    gridListContainer.innerHTML = '';
    resultGrid.innerHTML = '';

    if(myFavMoviesArray.length != 0){
        myFavMoviesArray.forEach(async (id) => {
            const result = await fetch(`https://omdbapi.com/?i=${id}&apikey=${apiKey}`);
            
            //For Displaying movies poster and title as a Grid style.
            displayFavouritesMoviesList(await result.json());
            
        });
    }else{
        displayEmptyBanner();
        console.log("1");
    }
});

function displayEmptyBanner(){
    console.log("2");
    gridListContainer.insertAdjacentHTML('beforeend', `
        <div class="grid-banner" >
            <h3 class="banner-heading" >No item selected yet.</h3>
        </div>    
    `);
}


// Show the Favourites Movies List in Grid Style
function displayFavouritesMoviesList(details) {
    gridListContainer.insertAdjacentHTML('beforeend', `
        <div class="grid-item" id=${details.imdbID} >
            <img src = "${(details.Poster != "N/A") ? details.Poster : "image_not_found.png"}" class="grid-item-cover" alt="Movie Poster">
            <h3 class="grid-item-title" >${details.Title}</h3>
        </div>    
    `);
}

// Click even on Fav Movies Lists
document.addEventListener('DOMContentLoaded', () => {
    const gridListContainer = document.getElementById('grid-list-container');
  
    gridListContainer.addEventListener('click', async (event) => {
      // Check if the clicked element or its parent has the class 'grid-item'
      const gridItemElement = event.target.closest('.grid-item');
      if (gridItemElement) {
        const result = await fetch(`https://omdbapi.com/?i=${gridItemElement.id}&apikey=${apiKey}`);
        const movieDetails = await result.json();
        gridListContainer.innerHTML = '';

        // For selected Movie Detail Preview.
        displayMovieDetails(movieDetails,1);
      }
    });
  });


cleanFavListBtn.addEventListener('click', async () => {

    localStorage.setItem('myFavMoviesArray', JSON.stringify([]));
    gridListContainer.innerHTML = '';
    resultGrid.innerHTML = '';
    location.reload();
});
