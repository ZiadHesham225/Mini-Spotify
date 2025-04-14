import { getSongsList as getSearchSongsList, updateActiveSong as updateSearchActiveSong } from './songSearch.js';
import { getSongsList as getAlbumSongsList, updateActiveSong as updateAlbumActiveSong } from './albumPage.js';

let music = new Audio();
let musicIndex = 0;
let isPlaying = false;
let currentPage = null;

let playbackBar;
let songTitle;
let songArtist;
let songImage;
let shuffleBtn;
let prevBtn;
let playBtn;
let playicon;
let nextBtn;
let repeatBtn;
let currentTimeElement;
let durationElement;
let progress;
let playerProgress;
let volumeSlider;

export function initializePlayback() {
  detectCurrentPage();
  
  playbackBar = document.querySelector(".playback-bar");
  songTitle = document.querySelector(".song-title");
  songArtist = document.querySelector(".song-artist");
  songImage = document.querySelector(".song-cover");

  shuffleBtn = document.getElementById("shuffle");
  prevBtn = document.getElementById("prev");
  playBtn = document.getElementById("play-pause");
  playicon = playBtn.querySelector(".play");
  nextBtn = document.getElementById("next");
  repeatBtn = document.getElementById("repeat");

  currentTimeElement = document.getElementById("current-time");
  durationElement = document.getElementById("duration");
  progress = document.getElementById("progress");
  playerProgress = document.getElementById("player-progress");
  volumeSlider = document.getElementById("volume");

  music.volume = volumeSlider.value;
  playbackBar.style.display = "none";

  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", () => {
    changeMusic(-1);
    updateActiveSong();
  });
  nextBtn.addEventListener("click", () => {
    changeMusic(1);
    updateActiveSong();
  });
  music.addEventListener("ended", () => {
    if (repeatBtn.classList.contains("active")) {
      music.currentTime = 0;
      playMusic();
    } else {
      changeMusic(1);
    }
    updateActiveSong();
  });
  music.addEventListener("timeupdate", updateProgressBar);
  playerProgress.addEventListener("click", setProgressBar);
  shuffleBtn.addEventListener("click", () => {
    if (shuffleBtn.classList.contains("active")) {
      shuffleBtn.classList.remove("active");
    } else {
      shuffleBtn.classList.add("active");
      repeatBtn.classList.remove("active");
    }
  });
  
  repeatBtn.addEventListener("click", () => {
    if (repeatBtn.classList.contains("active")) {
      repeatBtn.classList.remove("active");
    } else {
      repeatBtn.classList.add("active");
      shuffleBtn.classList.remove("active");
    }
  });

  volumeSlider.addEventListener("input", (event) => {
    music.volume = event.target.value;
  });

  return {
    playMusic,
    pauseMusic,
    loadMusic,
    togglePlay,
    isPlaying: () => isPlaying,
    getCurrentIndex: () => musicIndex,
    setMusicIndex: (index) => { musicIndex = index; }
  };
}

function detectCurrentPage() {
  if (window.location.pathname.includes('album.html')) {
    currentPage = 'album';
  } 
  else if (document.querySelector('.album-container')) {
    currentPage = 'album';
  } 
  else {
    currentPage = 'search';
  }
  console.log('Current page detected:', currentPage);
}

function togglePlay() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

export function playMusic() {
  isPlaying = true;
  playicon.classList.replace("fa-play", "fa-pause");
  music.play();
  updateActiveSong();
}

export function pauseMusic() {
  isPlaying = false;
  playicon.classList.replace("fa-pause", "fa-play");
  music.pause();
  updateActiveSong();
}

export function loadMusic(song) {
  music.src = song.preview;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist.name;
  songImage.src = song.album.cover_small;

  playbackBar.style.display = "flex";
}

function changeMusic(direction) {
  const songs = getSongsList();
  if (!songs || !songs.length) return;

  if (shuffleBtn.classList.contains("active")) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === musicIndex);
    musicIndex = randomIndex;
  } else {
    musicIndex = (musicIndex + direction + songs.length) % songs.length;
  }
  
  loadMusic(songs[musicIndex]);
  playMusic();
}

function getSongsList() {
  return currentPage === 'album' ? getAlbumSongsList() : getSearchSongsList();
}

function updateActiveSong() {
  if (currentPage === 'album') {
    updateAlbumActiveSong();
  } else {
    updateSearchActiveSong();
  }
}

function updateProgressBar() {
  const { duration, currentTime } = music;
  if (duration) {
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");
    durationElement.textContent = `${formatTime(duration / 60)}:${formatTime(
      duration % 60
    )}`;
    currentTimeElement.textContent = `${formatTime(
      currentTime / 60
    )}:${formatTime(currentTime % 60)}`;
  }
}

function setProgressBar(e) {
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  music.currentTime = (clickX / width) * music.duration;
}