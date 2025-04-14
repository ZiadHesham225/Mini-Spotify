let songListContainer;
let albumsContainer;
let songs = [];
let playbackControls;
let isMusicLoaded = false;
export function initializeSongSearch(playbackCtrl) {
  songListContainer = document.querySelector(".song-list");
  albumsContainer = document.querySelector(".album-cards");
  playbackControls = playbackCtrl;
}

export function getSongsList() {
  return songs;
}

export async function searchSongs(query) {
  const api = `https://api.deezer.com/search/track?q=${query}`;
  const apiUrl = `http://localhost:8080/${api}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.data.length) {
      songListContainer.innerHTML = "<p>No songs found.</p>";
      return;
    }
    
    songs = data.data;
    isMusicLoaded = false;
    displaySongResults(data.data);
  } catch (error) {
    console.error("Error fetching song data:", error);
    songListContainer.innerHTML = "<p>Failed to load songs. Try again later.</p>";
  }
}

function displaySongResults(songs) {
  songListContainer.innerHTML = "";
  albumsContainer.innerHTML = "";
  songListContainer.style.display = "block";

  const songList = document.createElement("ul");

  songs.forEach((song, index) => {
    const songItem = document.createElement("li");
    songItem.dataset.index = index;

    songItem.innerHTML = `
      <span class="song-number">${index + 1}</span>
      <div class="song-info">
        <img class="song-cover" src="${song.album.cover_small}" alt="${song.album.title}" />
        <div>
          <span class="song-title">${song.title}</span>
          <span class="song-artist">${song.artist.name}</span>
        </div>
      </div>
      <span class="song-duration">${formatDuration(song.duration)}</span>
      <i class="fa-solid fa-play song-play-button"></i>
    `;

    const playButton = songItem.querySelector(".song-play-button");

    playButton.addEventListener("click", () => {
      console.log("Play button clicked for:", song.title);

      if (playbackControls.getCurrentIndex() === index && isMusicLoaded) {
        if (playbackControls.isPlaying()) {
          playbackControls.pauseMusic();
        } else {
          playbackControls.playMusic();
        }
      } else {
        playbackControls.setMusicIndex(index);
        playbackControls.loadMusic(songs[index]);
        playbackControls.playMusic();
        isMusicLoaded = true;
      }

      updateActiveSong();
    });

    songList.appendChild(songItem);
  });

  songListContainer.appendChild(songList);
}

export function updateActiveSong() {
  document.querySelectorAll(".song-list li").forEach((li) => {
    li.classList.remove("active");
    li.querySelector(".song-play-button").classList.replace("fa-pause", "fa-play");
  });

  const activeSong = document.querySelector(
    `.song-list li[data-index="${playbackControls.getCurrentIndex()}"]`
  );
  
  if (activeSong) {
    activeSong.classList.add("active");

    const playButton = activeSong.querySelector(".song-play-button");
    if (playbackControls.isPlaying()) {
      playButton.classList.replace("fa-play", "fa-pause");
    } else {
      playButton.classList.replace("fa-pause", "fa-play");
    }
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}