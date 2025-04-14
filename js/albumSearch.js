let albumsContainer;
let songListContainer;

export function initializeAlbumSearch() {
  albumsContainer = document.querySelector(".album-cards");
  songListContainer = document.querySelector(".song-list");
}

export async function searchAlbums(query) {
  const api = `https://api.deezer.com/search/album?q=${query}`;
  const apiUrl = `http://localhost:8080/${api}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.data.length) {
      albumsContainer.innerHTML = "<p>No albums found.</p>";
      return;
    }

    displayAlbumResults(data.data);
  } catch (error) {
    console.error("Error fetching album data:", error);
    albumsContainer.innerHTML = "<p>Failed to load albums. Try again later.</p>";
  }
}

function displayAlbumResults(albums) {
  albumsContainer.innerHTML = "";
  albumsContainer.style.display = "flex";
  songListContainer.innerHTML = "";
  
  albums.forEach((album) => {
    const albumDiv = document.createElement("div");
    albumDiv.classList.add("album");

    albumDiv.innerHTML = `
      <img class="album-cover" src="${album.cover_medium}" alt="${album.title}">
      <h3 class="album-name">${album.title}</h3>
      <p class="artist-name">${album.artist.name}</p>
      <span class="icon"><i class="fa-solid fa-play play-button"></i></span>
    `;

    albumDiv.addEventListener('click', (e) => {
      if (!e.target.closest('.icon')) {
        window.location.href = `albumPage.html?id=${album.id}`;
      }
    });

    const playButton = albumDiv.querySelector('.icon');
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `albumPage.html?id=${album.id}&autoplay=true`;
    });

    albumsContainer.appendChild(albumDiv);
  });
}