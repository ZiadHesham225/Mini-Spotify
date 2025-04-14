import { initializeAlbumSearch } from './albumSearch.js';
import { initializeSongSearch, getSongsList } from './songSearch.js';
import { initializePlayback } from './playback.js';

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-box input");
  const searchButton = document.querySelector(".search-box button");
  const albumRadio = document.getElementById("album");
  const songRadio = document.getElementById("song");

  const playbackControls = initializePlayback();
  initializeAlbumSearch();
  initializeSongSearch(playbackControls);

  searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (query === "") return;

    if (albumRadio.checked) {
      await searchAlbums(query);
    } else if (songRadio.checked) {
      await searchSongs(query);
    }
  });

  async function searchAlbums(query) {
    const { searchAlbums } = await import('./albumSearch.js');
    await searchAlbums(query);
  }

  async function searchSongs(query) {
    const { searchSongs } = await import('./songSearch.js');
    await searchSongs(query);
  }
});