import { initializePlayback} from "./playback.js";

let albumId;
let albumSongs = [];
let playbackControls;
let isMusicLoaded = false;

document.addEventListener("DOMContentLoaded", async function () {
  const albumContainer = document.querySelector(".album-container");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const urlParams = new URLSearchParams(window.location.search);
  albumId = urlParams.get("id");
  const autoplay = urlParams.get("autoplay") === "true";

  if (!albumId) {
    return;
  }

  playbackControls = initializePlayback();
  await fetchAlbumData(albumId);
  const img = document.getElementById("album-cover");
  img.crossOrigin = "Anonymous";
  //adding linear gradient effect for the container
  img.onload = function () {
    const colorThief = new ColorThief();
    const dominantColor = colorThief.getColor(img);
    const [r, g, b] = dominantColor;

    canvas.width = img.width;
    canvas.height = img.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, "black");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    albumContainer.style.backgroundImage = `url(${canvas.toDataURL()})`;
    albumContainer.style.backgroundSize = "cover";
  };
  if (autoplay && albumSongs.length > 0) {
    playbackControls.setMusicIndex(0);
    playbackControls.loadMusic(albumSongs[0]);
    playbackControls.playMusic();
    isMusicLoaded = true;
    updateActiveSong();
  }
});

async function fetchAlbumData(albumId) {
  try {
    const albumApi = `https://api.deezer.com/album/${albumId}`;
    const albumApiUrl = `http://localhost:8080/${albumApi}`;
    const albumResponse = await fetch(albumApiUrl);
    const albumData = await albumResponse.json();
    console.log(albumData);

    document.getElementById("album-cover").src = albumData.cover_medium;
    document.getElementById("album-title").textContent = albumData.title;
    document.getElementById("album-artist").textContent = albumData.artist.name;
    const tracksApi = `https://api.deezer.com/album/${albumId}/tracks`;
    const tracksApiUrl = `http://localhost:8080/${tracksApi}`;
    const tracksResponse = await fetch(tracksApiUrl);
    const tracksData = await tracksResponse.json();
    console.log(tracksData);

    albumSongs = tracksData.data.map((track) => ({
      ...track,
      album: {
        cover_small: albumData.cover_small,
        title: albumData.title,
      },
    }));

    displaySongs(albumSongs);
  } catch (error) {
    console.error("Error fetching album data:", error);
    document.querySelector(".album-container").innerHTML +=
      "<p>Failed to load album. Try again later.</p>";
  }
}

function displaySongs(songs) {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "";

  songs.forEach((song, index) => {
    const songItem = document.createElement("li");
    songItem.dataset.index = index;

    songItem.innerHTML = `
            <span class="song-number">${index + 1}</span>
            <div class="song-info">
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
      if (playbackControls.getCurrentIndex() === index && isMusicLoaded) {
        if (playbackControls.isPlaying()) {
          playbackControls.pauseMusic();
        } else {
          playbackControls.playMusic();
        }
      } else {
        playbackControls.setMusicIndex(index);
        playbackControls.loadMusic(albumSongs[index]);
        playbackControls.playMusic();
        isMusicLoaded = true;
      }

      updateActiveSong();
    });

    songList.appendChild(songItem);
  });
}

export function updateActiveSong() {
  document.querySelectorAll("#song-list li").forEach((li) => {
    li.classList.remove("active");
    li.querySelector(".song-play-button").classList.replace(
      "fa-pause",
      "fa-play"
    );
  });

  const activeSong = document.querySelector(
    `#song-list li[data-index="${playbackControls.getCurrentIndex()}"]`
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
export function getSongsList() {
  return albumSongs;
}
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
