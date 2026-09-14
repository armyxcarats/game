const homeScreen = document.querySelector('#home-screen');
const loginScreen = document.querySelector('#login-screen');
const starterScreen = document.querySelector('#starter-screen');
const torchicScreen = document.querySelector('#torchic-screen');
const startButton = document.querySelector('#start-button');
const homeButton = document.querySelector('#home-button');
const trainerForm = document.querySelector('#trainer-form');
const backButton = document.querySelector('#back-button');
const torchicBackButton = document.querySelector('#torchic-back-button');
const starterCards = [...document.querySelectorAll('.starter-card')];
const confirmButton = document.querySelector('#confirm-button');
const trainerSummary = document.querySelector('#trainer-summary');
const toast = document.querySelector('#toast');
const genderPreview = document.querySelector('#gender-preview');
const previewPlaceholder = document.querySelector('#preview-placeholder');
const genderInputs = [...document.querySelectorAll('input[name="gender"]')];
const berryButtons = [...document.querySelectorAll('.berry-button')];
const feedButton = document.querySelector('#feed-button');
const expFeedButton = document.querySelector('#exp-feed-button');
const expItems = [...document.querySelectorAll('.exp-item')];
const torchicReveal = document.querySelector('#torchic-reveal');
const torchicCharacter = document.querySelector('.torchic-character');
const levelMeterFill = document.querySelector('#level-meter-fill');
const levelPercent = document.querySelector('#level-percent');
const torchicTitle = document.querySelector('#torchic-title');
const megaFolderButton = document.querySelector('#mega-folder-button');
const megaDialog = document.querySelector('#mega-dialog');
const megaYesButton = document.querySelector('#mega-yes-button');
const megaNoButton = document.querySelector('#mega-no-button');
const backgroundMusic = document.querySelector('#background-music');
const audioToggle = document.querySelector('#audio-toggle');
const audioVolume = document.querySelector('#audio-volume');

let profile = null;
let selectedStarter = null;
let toastTimer;
let levelProgress = 0;
let evolutionStage = 0;
let megaStoneOwned = false;
let megaPromptShown = false;
let activePokemonSound = null;
let pokemonSoundTimer;

const pokemonSounds = {
  Torchic: 'torchic snd.mp3',
  Combusken: 'combusken snd.mp3',
  Blaziken: 'blaziken snd.mp3',
};

backgroundMusic.volume = Number(audioVolume.value);

function tryPlayBackgroundMusic() {
  backgroundMusic.play().catch(() => {});
}

backgroundMusic.addEventListener('canplay', tryPlayBackgroundMusic, { once: true });
backgroundMusic.addEventListener('loadeddata', tryPlayBackgroundMusic, { once: true });
tryPlayBackgroundMusic();

function startBackgroundMusic() {
  tryPlayBackgroundMusic();
  document.removeEventListener('pointerdown', startBackgroundMusic);
  document.removeEventListener('keydown', startBackgroundMusic);
}

document.addEventListener('pointerdown', startBackgroundMusic, { once: true });
document.addEventListener('keydown', startBackgroundMusic, { once: true });

audioVolume.addEventListener('input', () => {
  backgroundMusic.volume = Number(audioVolume.value);
  if (backgroundMusic.volume > 0) {
    backgroundMusic.muted = false;
    audioToggle.textContent = '♫';
    audioToggle.setAttribute('aria-label', 'Mute background music');
    audioToggle.setAttribute('aria-pressed', 'false');
  }
});

audioToggle.addEventListener('click', () => {
  backgroundMusic.muted = !backgroundMusic.muted;
  audioToggle.textContent = backgroundMusic.muted ? '×' : '♫';
  audioToggle.setAttribute('aria-label', backgroundMusic.muted ? 'Unmute background music' : 'Mute background music');
  audioToggle.setAttribute('aria-pressed', String(backgroundMusic.muted));
  startBackgroundMusic();
});

genderInputs.forEach((input) => {
  input.addEventListener('change', () => {
    const isGirl = input.value === 'girl';
    genderPreview.src = isGirl ? 'Female.png' : 'Male.png';
    genderPreview.alt = `${isGirl ? 'Female' : 'Male'} trainer preview`;
    genderPreview.hidden = false;
    previewPlaceholder.hidden = true;
  });
});

startButton.addEventListener('click', () => {
  tryPlayBackgroundMusic();
  homeScreen.hidden = true;
  loginScreen.hidden = false;
  document.querySelector('#trainer-name').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

homeButton.addEventListener('click', () => {
  loginScreen.hidden = true;
  homeScreen.hidden = false;
});

trainerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(trainerForm);
  profile = {
    name: formData.get('name').trim(),
    gender: formData.get('gender'),
    birthdate: formData.get('birthdate'),
    age: formData.get('age'),
  };
  trainerSummary.textContent = profile.name.toUpperCase();
  document.querySelector('#torchic-trainer-summary').textContent = profile.name.toUpperCase();
  loginScreen.hidden = true;
  starterScreen.hidden = false;
  starterScreen.classList.add('is-visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

backButton.addEventListener('click', () => {
  starterScreen.hidden = true;
  loginScreen.hidden = false;
  document.querySelector('#trainer-name').focus();
});

starterCards.forEach((card) => {
  card.addEventListener('click', () => {
    selectedStarter = card.dataset.starter;
    starterCards.forEach((item) => item.setAttribute('aria-pressed', String(item === card)));
    confirmButton.disabled = false;
  });
});

confirmButton.addEventListener('click', () => {
  if (!selectedStarter) return;
  if (selectedStarter === 'Torchic') {
    starterScreen.hidden = true;
    torchicScreen.hidden = false;
    torchicScreen.classList.add('is-visible');
    playPokemonSound('Torchic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  showToast('POKÉ BALL CHOSEN! YOUR FIELD GUIDE IS READY.');
});

torchicBackButton.addEventListener('click', () => {
  torchicScreen.hidden = true;
  starterScreen.hidden = false;
});

feedButton.addEventListener('click', () => {
  const nextBerry = berryButtons.find((berryButton) => !berryButton.classList.contains('is-consumed'));
  if (!nextBerry || feedButton.classList.contains('is-feeding')) return;

  feedButton.classList.add('is-feeding');
  feedBerry(nextBerry).then(() => {
    feedButton.classList.remove('is-feeding');
    if (!berryButtons.some((berryButton) => !berryButton.classList.contains('is-consumed'))) {
      berryButtons.forEach((berryButton) => berryButton.classList.remove('is-consumed'));
    }
  });
});

expFeedButton.addEventListener('click', () => {
  if (expFeedButton.classList.contains('is-feeding')) return;

  const nextExp = expItems.find((expItem) => !expItem.classList.contains('is-consumed'));
  if (!nextExp) return;

  expFeedButton.classList.add('is-feeding');
  feedExp(nextExp).then(() => {
    expFeedButton.classList.remove('is-feeding');
    if (!expItems.some((expItem) => !expItem.classList.contains('is-consumed'))) {
      expItems.forEach((expItem) => expItem.classList.remove('is-consumed'));
    }
  });
});

megaFolderButton.addEventListener('click', () => {
  megaDialog.hidden = false;
  megaYesButton.focus();
});

megaYesButton.addEventListener('click', () => {
  megaDialog.hidden = true;
  megaStoneOwned = true;
  evolveToMegaBlaziken();
});

megaNoButton.addEventListener('click', () => {
  megaDialog.hidden = true;
  megaStoneOwned = true;
  showToast('MEGA STONE SAVED FOR FUTURE USE.');
});

function feedBerry(berryButton) {
  return new Promise((resolve) => {
    const berryBounds = berryButton.getBoundingClientRect();
    const targetBounds = torchicCharacter.getBoundingClientRect();
    const flyingBerry = berryButton.cloneNode(true);
    const startX = berryBounds.left;
    const startY = berryBounds.top;
    const targetX = targetBounds.left + targetBounds.width * .5 - berryBounds.width / 2;
    const targetY = targetBounds.top + targetBounds.height * .5 - berryBounds.height / 2;

    flyingBerry.classList.add('is-feeding');
    flyingBerry.style.left = `${startX}px`;
    flyingBerry.style.top = `${startY}px`;
    flyingBerry.style.setProperty('--fly-x', `${targetX - startX}px`);
    flyingBerry.style.setProperty('--fly-y', `${targetY - startY}px`);
    document.body.append(flyingBerry);
    berryButton.classList.add('is-consumed');
    flyingBerry.addEventListener('animationend', () => {
      flyingBerry.remove();
      torchicReveal.classList.remove('is-fed');
      void torchicReveal.offsetWidth;
      torchicReveal.classList.add('is-fed');
      addLevelProgress(evolutionStage === 1 ? 5 : 10);
      playPokemonSound(currentPokemonName());
      resolve();
    }, { once: true });
  });
}

function feedExp(expItem) {
  return new Promise((resolve) => {
    const expBounds = expItem.getBoundingClientRect();
    const targetBounds = torchicCharacter.getBoundingClientRect();
    const flyingExp = expItem.cloneNode(true);
    const startX = expBounds.left;
    const startY = expBounds.top;
    const targetX = targetBounds.left + targetBounds.width * .5 - expBounds.width / 2;
    const targetY = targetBounds.top + targetBounds.height * .5 - expBounds.height / 2;

    flyingExp.classList.add('is-feeding');
    flyingExp.style.left = `${startX}px`;
    flyingExp.style.top = `${startY}px`;
    flyingExp.style.setProperty('--fly-x', `${targetX - startX}px`);
    flyingExp.style.setProperty('--fly-y', `${targetY - startY}px`);
    document.body.append(flyingExp);
    expItem.classList.add('is-consumed');
    flyingExp.addEventListener('animationend', () => {
      flyingExp.remove();
      torchicReveal.classList.remove('is-fed');
      void torchicReveal.offsetWidth;
      torchicReveal.classList.add('is-fed');
      addLevelProgress(evolutionStage === 1 ? 10 : 20);
      playPokemonSound(currentPokemonName());
      resolve();
    }, { once: true });
  });
}

function addLevelProgress(points) {
  levelProgress = Math.min(100, levelProgress + points);
  levelMeterFill.style.width = `${levelProgress}%`;
  levelPercent.textContent = `${levelProgress}%`;
  if (levelProgress === 100 && evolutionStage < 2) evolvePokemon();
  if (levelProgress === 100 && evolutionStage === 2 && !megaPromptShown) {
    megaPromptShown = true;
    megaFolderButton.hidden = false;
  }
}

function evolvePokemon() {
  evolutionStage += 1;
  const nextPokemon = evolutionStage === 1
    ? { name: 'Combusken', image: 'Combusken.png' }
    : { name: 'Blaziken', image: 'blaziken.png' };

  levelProgress = 0;
  levelMeterFill.style.width = '0%';
  levelPercent.textContent = '0%';
  torchicTitle.textContent = nextPokemon.name;
  feedButton.textContent = `FEED ${nextPokemon.name.toUpperCase()}`;
  torchicCharacter.src = nextPokemon.image;
  torchicCharacter.alt = nextPokemon.name;
  torchicReveal.classList.add('is-evolved');
  torchicReveal.classList.toggle('is-blaziken', evolutionStage === 2);
  torchicReveal.classList.remove('is-fed');
  torchicReveal.classList.remove('is-evolving');
  void torchicReveal.offsetWidth;
  torchicReveal.classList.add('is-evolving');
  document.querySelector('.level-meter').setAttribute('aria-label', `${nextPokemon.name} experience level`);
  playPokemonSound(nextPokemon.name);
}

function evolveToMegaBlaziken() {
  evolutionStage = 3;
  torchicTitle.textContent = 'Mega Blaziken';
  feedButton.textContent = 'FEED MEGA BLAZIKEN';
  torchicCharacter.src = 'mega blaziken.png';
  torchicCharacter.alt = 'Mega Blaziken';
  torchicReveal.classList.add('is-evolved', 'is-blaziken', 'is-mega');
  torchicScreen.classList.add('is-mega');
  torchicReveal.classList.remove('is-fed', 'is-evolving');
  void torchicReveal.offsetWidth;
  torchicReveal.classList.add('is-evolving');
  document.querySelector('.level-meter').setAttribute('aria-label', 'Mega Blaziken experience level');
  megaFolderButton.hidden = true;
  playPokemonSound('Blaziken');
}

function currentPokemonName() {
  return evolutionStage === 0 ? 'Torchic' : evolutionStage === 1 ? 'Combusken' : 'Blaziken';
}

function playPokemonSound(pokemonName) {
  const soundSource = pokemonSounds[pokemonName];
  if (!soundSource) return;

  activePokemonSound?.pause();
  clearTimeout(pokemonSoundTimer);
  activePokemonSound = new Audio(soundSource);
  activePokemonSound.volume = .85;
  activePokemonSound.currentTime = 0;
  activePokemonSound.play().catch(() => {});
  pokemonSoundTimer = setTimeout(() => {
    activePokemonSound.pause();
    activePokemonSound.currentTime = 0;
  }, 3000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
}
