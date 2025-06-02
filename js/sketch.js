// Global variables
let bgTileImage;
let wordsData = [];
let revealedPosters = [];

let experienceStarted = false; // Set to false initially, true after preload and setup

// Increased for a larger "infinite" word spawning area
const INFINITE_CANVAS_WIDTH = 10000; 
const INFINITE_CANVAS_HEIGHT = 10000;

let offsetX = 0;
let offsetY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let dragging = false;

const WORD_OPACITY_ALPHA = 255 * 0.60; 
const MIN_PITCH_RATE = 0.5;
const PITCH_CHANGE_RATE = 0.005; // DISTORTION FASTER NOW

// New variables for functionality
let currentMode = 'pan'; // 'pan' (Comunicar), 'design) (Intervenir), 'sticker' (Marcar), 'text) (Expresarse)
let lapizImage; // Image for the design mode cursor

let paintBuffer; // Offscreen buffer for paint strokes
let currentPaintStroke = null; // Stores { color, weight } for the *active* brush

let stickerBuffer; // Offscreen buffer for stickers
let stickerImagePaths = []; 
let loadedStickerImages = []; 
let placedStickers = []; 
const MAX_STICKERS = 50; // Increased sticker limit

let textBuffer; // Offscreen buffer for submitted texts
let inputElement;
let submitButton;
let submittedTexts = []; 
let lastWordCount = 0; // Words currently in the input box (for vibration calculation)
let submittedWordCount = 0; // Number of times user has clicked 'Enviar' in text mode (for Expresarse limit)
let inputVibrationIntensity = 0; 
let graffitiFont = 'Bangers'; // Assign the new graffiti font by name here for use in draw()

// Specific interaction counters for each mode's end condition
const COMUNICAR_LIMIT = 10; // Number of word clicks in Comunicar to trigger End
let comunicarClicks = 0; 

const INTERVENIR_LIMIT = 16; // Number of paint strokes in Intervenir to trigger End
let intervenirStrokes = 0; 

const MARCAR_LIMIT = 20; // Number of stickers in Marcar to trigger End
let marcarStickers = 0; 

const EXPRESARSE_LIMIT = 6; // Number of submitted texts in Expresarse to trigger End

let sirenSound;
let spraySound; 
let sprayPaintSound;
let ruidoMurmulloSound; 
let murmulloPitchRate = 1.0; 

let finalMessageDisplayed = false;
let finalActionPhase = false; // New state to control button visibility at the end

// UI elements (p5.dom buttons)
let btnComunicar; 
let btnIntervenir; 
let btnMarcar;    
let btnExpresarse;   
let btnRebobinarConciencia; 
let btnSaveWork;
let showManifestate = false; // Controls visibility of the manifestate text and dimming overlay

// --- NUEVO: Control de visibilidad de botones ---
let buttonsVisible = false; 
// --- FIN NUEVO ---

// Variables for random positioning of text input box
let textInputBaseX;
let textInputBaseY;

// --- NUEVAS VARIABLES PARA PANCARTAS ---
let loadedPancartaImages = [];
let placedPancartas = [];
const MAX_PANCARTA_SPAWN_ATTEMPTS = 50; // Max attempts to find a non-overlapping spot for each pancarta
const MIN_OVERLAP_PADDING = 100; // Minimum distance between pancartas
// --- FIN NUEVAS VARIABLES ---

// --- NUEVAS VARIABLES PARA GENERACIÓN PROCEDURAL DE PALABRAS ---
const CHUNK_SIZE = 1000; // Define el tamaño de cada "trozo" del lienzo (1000x1000px)
const WORDS_PER_CHUNK = 10; // Cantidad de palabras a generar por cada trozo (REDUCIDO para mayor dispersión)
let populatedChunks = new Set(); // Almacena las coordenadas de los trozos ya poblados (ej. "0,0", "1,0" para chunks 0-9)
// --- FIN NUEVAS VARIABLES PARA GENERACIÓN PROCEDURAL ---

// --- NUEVA VARIABLE PARA EL FONDO PRE-RENDERIZADO ---
let backgroundWorldBuffer; // Buffer para el fondo de 10000x10000px
// --- FIN NUEVA VARIABLE ---

// The content with posterPaths and audioPath
const contentData = [
  {
    id: 'maternidad_lie',
    triggerWords: ["Mentiras", "Falsedad", "Engaño", "Desinformación", "Maternidad"],
    posterPaths: ['img/poster_maternidad.png', 'img/maternidad4.jpg'], 
    audioPath: 'audios/audio_mentira_maternidad.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  {
    id: 'afuera', 
    triggerWords: ["Odio", "Perturbar", "Interponer", "Rechazo", "Opresión", "Silencio", "Afuera", "No"],
    posterPaths: ['img/poster_afuera.png', 'img/Afiche4.png', 'img/Afiche5.png'], 
    audioPath: 'audios/audio_antipatriotismo_rechazo.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  {
    id: 'ganando_fraude',
    triggerWords: ["Fraude", "Antipatriotismo", "Negación", "Manipulación", "Impostura", "Ganando"],
    posterPaths: ['img/poster_ganando.png'],
    audioPath: 'audios/audio_fraude_ganando.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'galtieri_rendicion',
    triggerWords: ["Rendición", "Derrota", "Guerra", "Dictadura", "Militar", "Malvinas"],
    posterPaths: ['img/Afiche1.png', 'img/Afiche6.png', 'img/Afiche7.png'],
    audioPath: 'audios/audio_galtieri_rendicion.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'jfk_secret_societies',
    triggerWords: ["Secreto", "Conspiración", "Sociedad", "Libertad", "Amenaza", "Control"],
    posterPaths: ['img/Afiche2.png'],
    audioPath: 'audios/audio_jfkennedy_antiaociedadessecretas.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'macri_educacion',
    triggerWords: ["Educación", "Pública", "Recorte", "Futuro", "Austeridad", "Derecho"],
    posterPaths: ['img/Afiche9.png', 'img/Mural3.png'],
    audioPath: 'audios/audio_macri_educacion_publica.mp3', 
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'macri_pobreza',
    triggerWords: ["Pobreza", "Promesa", "Cero", "Hambre", "Desigualdad", "Falsa"],
    posterPaths: ['img/Afiche8.png'],
    audioPath: 'audios/audio_macri_pobreza_cero.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'mlk_derechos_humanos',
    triggerWords: ["Derechos", "Humanos", "Justicia", "Igualdad", "Libertad", "Sueño"],
    posterPaths: ['img/Afiche3.png'],
    audioPath: 'audios/audio_mlutherking_derechos_humanos.mp3', 
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  },
  { 
    id: 'muro_mexico',
    triggerWords: ["Muro", "Frontera", "División", "Migración", "Separatismo", "Discriminación"],
    posterPaths: ['img/Mural1.png'],
    audioPath: 'audios/audio_muro_mexico.mp3',
    loadedAudio: null,
    loadedPosters: [],
    isPlaying: false,
    isTriggered: false,
    currentPitchRate: 1,
    audioStartTime: 0,
    distortionStartDelayMs: 5000 
  }
];

function preload() {
  console.log('Preloading assets...');
  bgTileImage = loadImage('img/fondo.jpg', () => console.log('Loaded: img/fondo.jpg'));

  lapizImage = loadImage('simbolos/lapiz.png', 
    () => console.log('Loaded: simbolos/lapiz.png'), 
    (e) => console.error('Failed to load simbolos/lapiz.png:', e)); 

  sirenSound = loadSound('audios/siren.mp3', 
    () => console.log('Loaded: audios/siren.mp3'),
    (e) => console.error('Failed to load audios/siren.mp3:', e)); 

  spraySound = loadSound('audios/spray_sound.mp3', 
    () => console.log('Loaded: audios/spray_sound.mp3'),
    (e) => console.error('Failed to load audios/spray_sound.mp3:', e));

  sprayPaintSound = loadSound('audios/spray_paint.mp3', 
    () => console.log('Loaded: audios/spray_paint.mp3'),
    (e) => console.error('Failed to load audios/spray_paint.mp3:', e));

  ruidoMurmulloSound = loadSound('audios/ruido_murmullo.mp3', 
    () => console.log('Loaded: audios/ruido_murmullo.mp3'),
    (e) => console.error('Failed to load audios/ruido_murmullo.mp3:', e));

  stickerImagePaths = [
    'simbolos/sticker_peligro.png',
    'simbolos/sticker_prohibido.png',
    'simbolos/sticker_signos.png',
    'simbolos/sticker_megafono.png',
    'simbolos/sticker_x.png'
  ];
  for (let path of stickerImagePaths) {
    loadedStickerImages.push(loadImage(path, 
      () => console.log(`Loaded sticker: ${path}`),
      (e) => console.error(`Failed to load sticker ${path}:`, e)));
  }

  const pancartaImagePaths = [
    'img/pancartas/pancarta_burguerking1.png',
    'img/pancartas/pancarta_burguerking2.png',
    'img/pancartas/pancarta_coca1.png',
    'img/pancartas/pancarta_coca2.png',
    'img/pancartas/pancarta_kfc1.png',
    'img/pancartas/pancarta_kfc2.png',
    'img/pancartas/pancarta_mcdonalds1.png',
    'img/pancartas/pancarta_mcdonalds2.png',
    'img/pancartas/pancarta_mercadolibre1.png',
    'img/pancartas/pancarta_mercadolibre2.png',
    'img/pancartas/pancarta_netflix.png',
    'img/pancartas/pancarta_pepsi1.png',
    'img/pancartas/pancarta_pepsi2.png',
    'img/pancartas/pancarta_uber.png'
  ];
  for (let path of pancartaImagePaths) {
    loadedPancartaImages.push(loadImage(path, 
      () => console.log(`Loaded pancarta: ${path}`),
      (e) => console.error(`Failed to load pancarta ${path}:`, e)));
  }

  for (let segment of contentData) {
    segment.loadedAudio = loadSound(segment.audioPath, 
      () => console.log(`Loaded audio: ${segment.audioPath}`),
      (e) => console.error(`Failed to load audio ${segment.audioPath}:`, e));
    segment.loadedPosters = segment.posterPaths.map(path => loadImage(path, 
      () => console.log(`Loaded poster: ${path}`),
      (e) => console.error(`Failed to load poster ${path}:`, e)));
  }
  console.log('All preload calls initiated.');
}

function createModeButtons() {
  btnComunicar = createButton('Comunicar'); 
  btnIntervenir = createButton('Intervenir'); 
  btnMarcar = createButton('Marcar');    
  btnExpresarse = createButton('Expresarse');   
  btnRebobinarConciencia = createButton('Rebobinar conciencia'); 
  btnSaveWork = createButton('Guardar Obra');

  [btnComunicar, btnIntervenir, btnMarcar, btnExpresarse, btnRebobinarConciencia, btnSaveWork].forEach(btn => {
    btn.class('mode-button'); 
    btn.style('font-family', 'Alfa Slab One', 'sans-serif'); 
    btn.style('font-size', '30px');
    btn.style('padding', '15px 30px');
    btn.style('border', '3px solid black');
    btn.style('background', 'white');
    btn.style('color', 'black');
    btn.style('border-radius', '10px');
    btn.style('cursor', 'pointer');
    btn.style('position', 'absolute'); 
    btn.style('z-index', '100'); 
    btn.mouseOver(() => btn.style('background', '#ddd'));
    btn.mouseOut(() => btn.style('background', 'white'));
    btn.parent('canvas-container'); 
    // --- NUEVO: Ocultar botones al inicio ---
    btn.hide(); 
    // --- FIN NUEVO ---
  });

  btnComunicar.mousePressed(() => {
    currentMode = 'pan'; 
    select('#text-input-container').hide(); 
    showManifestate = false; 
  });

  btnIntervenir.mousePressed(() => {
    currentMode = 'design';
    select('#text-input-container').hide(); 
    showManifestate = false; 
  });

  btnMarcar.mousePressed(() => {
    currentMode = 'sticker';
    select('#text-input-container').hide(); 
    showManifestate = false; 
  });

  btnExpresarse.mousePressed(() => {
    currentMode = 'text';
    select('#user-text-input').value(''); 
    lastWordCount = 0; 
    select('#text-input-container').style('left', textInputBaseX + 'px');
    select('#text-input-container').style('top', textInputBaseY + 'px');
    select('#text-input-container').style('transform', 'translate(-50%, -50%) rotate(0deg)'); 
    select('#text-input-container').show(); // Show text input
    showManifestate = false; 
  });

  btnRebobinarConciencia.mousePressed(() => resetExperience()); 
  btnSaveWork.mousePressed(() => saveCanvasTemporarilyHiddenUI()); 
}


function setup() {
  console.log('Setup function started.');
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');

  window.oncontextmenu = (e) => e.preventDefault();

  textFont('Alfa Slab One'); 

  rectMode(CENTER); 
  imageMode(CENTER); 
  textAlign(CENTER, CENTER); 

  paintBuffer = createGraphics(INFINITE_CANVAS_WIDTH, INFINITE_CANVAS_HEIGHT);
  textBuffer = createGraphics(INFINITE_CANVAS_WIDTH, INFINITE_CANVAS_HEIGHT);
  stickerBuffer = createGraphics(INFINITE_CANVAS_WIDTH, INFINITE_CANVAS_HEIGHT);
  
  paintBuffer.noStroke(); 
  paintBuffer.strokeCap(ROUND); 
  paintBuffer.strokeJoin(ROUND); 

  textBuffer.textFont(graffitiFont); 
  textBuffer.textAlign(CENTER, CENTER); 

  stickerBuffer.imageMode(CENTER); 
  
  // --- Inicializar y pre-renderizar el fondo del mundo ---
  backgroundWorldBuffer = createGraphics(INFINITE_CANVAS_WIDTH, INFINITE_CANVAS_HEIGHT);
  backgroundWorldBuffer.imageMode(CORNER); 
  let tileW = bgTileImage.width;
  let tileH = bgTileImage.height;
  for (let x = 0; x < INFINITE_CANVAS_WIDTH; x += tileW) {
    for (let y = 0; y < INFINITE_CANVAS_HEIGHT; y += tileH) {
      backgroundWorldBuffer.image(bgTileImage, x, y, tileW, tileH);
    }
  }
  // --- FIN Inicializar ---

  // Centrar el offset inicial para que el centro del mundo 10000x10000 coincida con el centro de la ventana
  offsetX = width / 2 - INFINITE_CANVAS_WIDTH / 2; 
  offsetY = height / 2 - INFINITE_CANVAS_HEIGHT / 2; 
  
  checkAndPopulateVisibleChunks(); // Llama a la función para poblar los trozos visibles al inicio

  inputElement = select('#user-text-input');
  submitButton = select('#submit-text-button');

  inputElement.input(handleTextInputChange);
  submitButton.mousePressed(handleSubmitText);

  inputElement.elt.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
    }
  });


  select('#text-input-container').hide();

  createModeButtons(); // Crea los botones, ahora ocultos por defecto

  select('#loading-screen').hide();
  select('#canvas-container').show();
  experienceStarted = true; 
  console.log('Setup function finished. Experience started.');
}

function draw() {
  if (!experienceStarted) {
    return;
  }

  background(0); // Dibuja el fondo negro, que será cubierto por el mundo o visible en los bordes si la ventana es más grande

  // --- Dibuja el fondo pre-renderizado del mundo ---
  push();
  imageMode(CORNER); // Necesario para que image() dibuje desde la esquina del buffer
  image(backgroundWorldBuffer, offsetX, offsetY);
  pop();
  // --- FIN CAMBIO ---

  checkAndPopulateVisibleChunks(); // Comprueba y puebla chunks a medida que el usuario se mueve

  // Draw revealed posters
  for (let poster of revealedPosters) {
    if (poster.alpha < poster.targetAlpha) {
      poster.alpha = min(poster.alpha + 15, poster.targetAlpha);
    }
    tint(255, poster.alpha);
    image(poster.image, poster.x + offsetX, poster.y + offsetY, poster.width, poster.height);
    noTint();
  }

  // Draw active words (only visible ones for performance)
  for (let word of wordsData) {
    if (!word.active) continue;

    let wordScreenX = word.x + offsetX;
    let wordScreenY = word.y + offsetY;

    const margin = 50; 
    // Solo dibuja palabras si están dentro de la vista con un margen
    if (wordScreenX > -margin && wordScreenX < width + margin &&
        wordScreenY > -margin && wordScreenY < height + margin) {
        
        textSize(word.size);
        textFont('Alfa Slab One'); 

        stroke(0);
        strokeWeight(3);
        fill(255);
        text(word.text, wordScreenX, wordScreenY);

        let textW = textWidth(word.text);
        let textH = word.size * 0.8;
        const wordPadding = 12;
        let rectW = textW + wordPadding * 2;
        let rectH = textH + wordPadding;

        word.rectBounds = getCenteredRectBounds(wordScreenX, wordScreenY, rectW, rectH);
    }
  }

  // Dibuja las pancartas aquí, después de palabras/posters ---
  push();
  imageMode(CORNER); 
  for (let pancarta of placedPancartas) {
      image(pancarta.buffer, pancarta.x + offsetX, pancarta.y + offsetY);
  }
  pop();

  // --- Orden de dibujo: Buffers (pinceladas, stickers, texto expresado) después de palabras, posters Y PANCARTAS ---
  push(); 
  imageMode(CORNER); 
  
  image(paintBuffer, offsetX, offsetY); 
  image(stickerBuffer, offsetX, offsetY); 
  image(textBuffer, offsetX, offsetY);  
  
  pop(); 

  for (let segment of contentData) {
    if (segment.isPlaying) {
      let elapsedTime = millis() - segment.audioStartTime;
      if (elapsedTime > segment.distortionStartDelayMs && segment.currentPitchRate > MIN_PITCH_RATE) {
        segment.currentPitchRate -= PITCH_CHANGE_RATE;
        segment.loadedAudio.rate(max(segment.currentPitchRate, MIN_PITCH_RATE));
      }
    }
  }

  // "manifestate" overlay
  if (showManifestate && !finalMessageDisplayed) {
    fill(0, 150); 
    rect(width / 2, height / 2, width, height); 

    textFont('Alfa Slab One');
    stroke(0);
    strokeWeight(4);
    fill(255);
    textSize(60);
    text('manifestate', width / 2, height / 2 - 150); 
  }

  // Handle constant text input vibration and movement for Expresarse mode
  if (currentMode === 'text' && !finalMessageDisplayed) {
    positionTextInput(inputVibrationIntensity); 
    select('#text-input-container').show(); 
  } else {
      select('#text-input-container').hide(); 
  }

  let buttonAreaY = height - 100; 
  let buttonSpacing = 250; 

  if (finalActionPhase) {
      if (btnComunicar) btnComunicar.hide();
      if (btnIntervenir) btnIntervenir.hide();
      if (btnMarcar) btnMarcar.hide();
      if (btnExpresarse) btnExpresarse.hide();
      
      if (btnRebobinarConciencia) {
          btnRebobinarConciencia.show();
          btnRebobinarConciencia.position(width / 2 - (btnRebobinarConciencia.elt.offsetWidth / 2) + offsetXCanvasToHTML(), height / 2 - 40 + offsetYCanvasToHTML()); 
      }
      if (btnSaveWork) {
          btnSaveWork.show();
          btnSaveWork.position(width / 2 - (btnSaveWork.elt.offsetWidth / 2) + offsetXCanvasToHTML(), height / 2 + 40 + offsetYCanvasToHTML()); 
      }

  } else {
      // Solo muestra los botones si buttonsVisible es true (es decir, después del primer clic en Comunicar)
      if (buttonsVisible) { 
          if (btnComunicar) btnComunicar.show();
          if (btnIntervenir) btnIntervenir.show();
          if (btnMarcar) btnMarcar.show();
          if (btnExpresarse) btnExpresarse.show();
      } else { 
          if (btnComunicar) btnComunicar.hide();
          if (btnIntervenir) btnIntervenir.hide();
          if (btnMarcar) btnMarcar.hide();
          if (btnExpresarse) btnExpresarse.hide();
      }

      if (btnRebobinarConciencia) btnRebobinarConciencia.hide();
      if (btnSaveWork) btnSaveWork.hide();

      if (btnComunicar) btnComunicar.position(width / 2 - buttonSpacing * 1.5 - (btnComunicar.elt.offsetWidth / 2) + offsetXCanvasToHTML(), buttonAreaY + offsetYCanvasToHTML());
      if (btnIntervenir) btnIntervenir.position(width / 2 - buttonSpacing * 0.5 - (btnIntervenir.elt.offsetWidth / 2) + offsetXCanvasToHTML(), buttonAreaY + offsetYCanvasToHTML());
      if (btnMarcar) btnMarcar.position(width / 2 + buttonSpacing * 0.5 - (btnMarcar.elt.offsetWidth / 2) + offsetXCanvasToHTML(), buttonAreaY + offsetYCanvasToHTML());
      if (btnExpresarse) btnExpresarse.position(width / 2 + buttonSpacing * 1.5 - (btnExpresarse.elt.offsetWidth / 2) + offsetXCanvasToHTML(), buttonAreaY + offsetYCanvasToHTML());
  }

  if (currentMode === 'design') {
    noCursor();
    image(lapizImage, mouseX, mouseY, 50, 50);
  } else {
    cursor(ARROW);
  }
  
  // --- DEBUGGING: Mostrar contadores en consola para verificar persistencia ---
  // console.log(`C: ${comunicarClicks}, I: ${intervenirStrokes}, M: ${marcarStickers}, E-submits: ${submittedWordCount}, Input-words: ${lastWordCount}, Vib-Int: ${inputVibrationIntensity}`);
  // --- FIN DEBUGGING ---
}

// --- Helper function for rectangle overlap check ---
function checkRectOverlap(rect1, rect2, padding) {
  return rect1.x < rect2.x + rect2.width + padding &&
         rect1.x + rect1.width + padding > rect2.x &&
         rect1.y < rect2.y + rect2.height + padding &&
         rect1.y + rect1.height + padding > rect2.y;
}
// --- Fin Helper ---

// --- NUEVAS FUNCIONES PARA GENERACIÓN PROCEDURAL DE PALABRAS ---
function populateChunk(chunkX, chunkY) {
  const chunkKey = `${chunkX},${chunkY}`;
  if (populatedChunks.has(chunkKey)) {
    return; 
  }

  populatedChunks.add(chunkKey);

  const worldXStart = chunkX * CHUNK_SIZE; 
  const worldYStart = chunkY * CHUNK_SIZE;
  const worldXEnd = worldXStart + CHUNK_SIZE;
  const worldYEnd = worldYStart + CHUNK_SIZE;

  for (let i = 0; i < WORDS_PER_CHUNK; i++) {
    let chosenSegment = random(contentData);
    let wordText = random(chosenSegment.triggerWords);

    let newWord = {
      text: wordText,
      x: random(worldXStart + 20, worldXEnd - 20), 
      y: random(worldYStart + 20, worldYEnd - 20), 
      size: random(22, 38), 
      segmentId: chosenSegment.id,
      active: true,
      rectBounds: null
    };
    wordsData.push(newWord);
  }
}

function checkAndPopulateVisibleChunks() {
  const worldViewLeft = -offsetX; 
  const worldViewTop = -offsetY; 
  const worldViewRight = worldViewLeft + width;
  const worldViewBottom = worldViewTop + height;

  const marginChunks = 3; 
  
  const startChunkX = floor(worldViewLeft / CHUNK_SIZE) - marginChunks;
  const endChunkX = floor(worldViewRight / CHUNK_SIZE) + marginChunks;
  const startChunkY = floor(worldViewTop / CHUNK_SIZE) - marginChunks;
  const endChunkY = floor(worldViewBottom / CHUNK_SIZE) + marginChunks;

  const minChunkIndexX = 0;
  const maxChunkIndexX = INFINITE_CANVAS_WIDTH / CHUNK_SIZE - 1; 
  const minChunkIndexY = 0;
  const maxChunkIndexY = INFINITE_CANVAS_HEIGHT / CHUNK_SIZE - 1; 

  for (let y = startChunkY; y <= endChunkY; y++) {
    for (let x = startChunkX; x <= endChunkX; x++) {
        if (x >= minChunkIndexX && x <= maxChunkIndexX && y >= minChunkIndexY && y <= maxChunkIndexY) {
            const chunkKey = `${x},${y}`;
            if (!populatedChunks.has(chunkKey)) {
                populateChunk(x, y);
            }
        }
    }
  }
}

function spawnNewWord() {
  let chosenSegment = random(contentData);
  let wordText = random(chosenSegment.triggerWords);

  let worldMouseX = -offsetX + mouseX;
  let worldMouseY = -offsetY + mouseY;

  let newWord = {
    text: wordText,
    x: random(worldMouseX - 200, worldMouseX + 200),
    y: random(worldMouseY - 200, worldMouseY + 200),
    size: random(22, 38), 
    segmentId: chosenSegment.id,
    active: true,
    rectBounds: null
  };
  newWord.x = constrain(newWord.x, 50, INFINITE_CANVAS_WIDTH - 50);
  newWord.y = constrain(newWord.y, 50, INFINITE_CANVAS_HEIGHT - 50);

  wordsData.push(newWord);
}
// --- FIN NUEVAS FUNCIONES PARA GENERACIÓN PROCEDURAL ---

function mousePressed(event) { 
  if (!experienceStarted || finalMessageDisplayed) return; 

  // --- Generar pancartas si el clic no es en un botón HTML o input ---
  if (mouseButton === LEFT && !finalActionPhase) {
      if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'INPUT') {
          if (loadedPancartaImages.length > 0) {
              const newlyGeneratedThisClick = []; 
              for (let i = 0; i < 5; i++) { // Generar 5 pancartas por clic
                  let img = random(loadedPancartaImages);
                  let pWidth = random(550, 850); 
                  let pHeight = pWidth * img.height / img.width; 

                  let foundSpot = false;
                  for (let attempt = 0; attempt < MAX_PANCARTA_SPAWN_ATTEMPTS; attempt++) {
                      let pWorldX = random(100, INFINITE_CANVAS_WIDTH - 100 - pWidth);
                      let pWorldY = random(100, INFINITE_CANVAS_HEIGHT - 100 - pHeight);
                      
                      const newPancartaRect = {
                          x: pWorldX,
                          y: pWorldY,
                          width: pWidth,
                          height: pHeight
                      };

                      let overlaps = false;
                      for (let existingPancarta of placedPancartas) {
                          if (checkRectOverlap(newPancartaRect, existingPancarta, MIN_OVERLAP_PADDING)) {
                              overlaps = true;
                              break;
                          }
                      }
                      if (!overlaps) {
                          for (let generatedInClickPancarta of newlyGeneratedThisClick) {
                              if (checkRectOverlap(newPancartaRect, generatedInClickPancarta, MIN_OVERLAP_PADDING)) {
                                  overlaps = true;
                                  break;
                              }
                          }
                      }

                      if (!overlaps) {
                          foundSpot = true;
                          let pancartaBuffer = createGraphics(pWidth, pHeight);
                          pancartaBuffer.imageMode(CORNER); 
                          pancartaBuffer.image(img, 0, 0, pWidth, pHeight); 

                          placedPancartas.push({
                              x: pWorldX,
                              y: pWorldY,
                              width: pWidth,
                              height: pHeight,
                              buffer: pancartaBuffer 
                          });
                          newlyGeneratedThisClick.push({ x: pWorldX, y: pWorldY, width: pWidth, height: pHeight });
                          break; 
                      }
                  }
                  if (!foundSpot) {
                      console.warn(`Could not place pancarta ${i + 1} after ${MAX_PANCARTA_SPAWN_ATTEMPTS} attempts.`);
                  }
              }
          }
      }
  }

  if (mouseButton === RIGHT) { 
    if (currentMode === 'design' || currentMode === 'sticker' || currentMode === 'pan' || currentMode === 'text') { 
      dragging = true;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
    event.preventDefault(); 
    return false; 
  }

  if (mouseButton === LEFT) {
    if (finalActionPhase) {
      return; 
    }

    if (currentMode === 'pan') {
      for (let poster of revealedPosters) {
        let px = poster.x + offsetX;
        let py = poster.y + offsetY;
        let w = poster.width;
        let h = poster.height;
        if (mouseX > px - w / 2 && mouseX < px + w / 2 &&
          mouseY > py - h / 2 && mouseY < py + h / 2) {
          return; 
        }
      }

      for (let word of wordsData) {
        if (!word.active || !word.rectBounds) continue;
        let r = word.rectBounds;
        if (mouseX >= r.left && mouseX <= r.right &&
          mouseY >= r.top && mouseY <= r.bottom) {
          word.active = false;

          let segment = contentData.find(s => s.id === word.segmentId);

          if (segment && !segment.isTriggered) {
            segment.isTriggered = true; 
            if (segment.loadedAudio && !segment.loadedAudio.isPlaying()) {
              segment.loadedAudio.play();
              segment.isPlaying = true;
              segment.audioStartTime = millis();
              segment.currentPitchRate = 1;
              segment.loadedAudio.rate(1);
            }
          }

          if (segment && segment.loadedPosters.length > 0) {
              let availablePosters = segment.loadedPosters.filter(p => p && p.width > 0 && p.height > 0);
              if (availablePosters.length > 0) {
                  let img = random(availablePosters); 
                  let posterWidth = width * 0.15;
                  let posterHeight = posterWidth * img.height / img.width;
                  
                  let posterWorldX = -offsetX + mouseX; 
                  let posterWorldY = -offsetY + mouseY; 

                  revealedPosters.push({
                    image: img,
                    width: posterWidth,
                    height: posterHeight,
                    x: posterWorldX, 
                    y: posterWorldY, 
                    alpha: 0,
                    targetAlpha: 255
                  });
              } else {
                console.warn(`No valid posters loaded for segment '${segment.id}' associated with word '${word.text}'. Cannot display poster.`);
              }
          } else if (segment) { 
              console.warn(`No posterPaths defined or loaded for segment '${segment.id}'. Skipping poster display.`);
          }
          
          incrementSpecificInteractionCount('pan'); 
          
          // --- NUEVO: Mostrar botones después del primer clic en Comunicar ---
          if (comunicarClicks === 1 && !buttonsVisible) {
              buttonsVisible = true;
              btnComunicar.show();
              btnIntervenir.show();
              btnMarcar.show();
              btnExpresarse.show();
              // Los botones "Rebobinar conciencia" y "Guardar Obra" se controlan por finalActionPhase, por lo que permanecen ocultos hasta el final del juego.
          }
          // --- FIN NUEVO ---
          
          spawnNewWord(); 
          return; 
        }
      }
    } else if (currentMode === 'design') {
      currentPaintStroke = {
        color: color(random(255), random(255), random(255), 150), 
        weight: random(25, 50) 
      };
      incrementSpecificInteractionCount('design'); 

      if (spraySound && !spraySound.isPlaying()) {
        spraySound.loop(); 
      }

    } else if (currentMode === 'sticker') {
      if (placedStickers.length < MAX_STICKERS) {
        let randomStickerImage = random(loadedStickerImages);
        let randomSize = random(150, 450); 
        let randomRotation = random(-PI / 8, PI / 8); 

        stickerBuffer.push();
        stickerBuffer.translate(mouseX - offsetX, mouseY - offsetY); 
        stickerBuffer.rotate(randomRotation);
        stickerBuffer.image(randomStickerImage, 0, 0, randomSize, randomSize * randomStickerImage.height / randomStickerImage.width);
        stickerBuffer.pop();

        placedStickers.push({ 
            image: randomStickerImage, 
            x: mouseX - offsetX, 
            y: mouseY - offsetY, 
            size: randomSize,
            rotation: randomRotation
        });
        
        incrementSpecificInteractionCount('sticker'); 

        if (sprayPaintSound && !sprayPaintSound.isPlaying()) {
          sprayPaintSound.play(); 
        }

      } else {
        console.log('Max stickers placed. Cannot add more.'); 
      }
    }
  }
}

function mouseDragged() {
  if (!experienceStarted || finalMessageDisplayed) return;

  if (mouseButton === RIGHT) { 
    if (currentMode === 'design' || currentMode === 'sticker' || currentMode === 'pan' || currentMode === 'text') {
      let dx = mouseX - lastMouseX;
      let dy = mouseY - lastMouseY;
      offsetX += dx;
      offsetY += dy;

      const minOffsetX = width - INFINITE_CANVAS_WIDTH;
      const maxOffsetX = 0;
      const minOffsetY = height - INFINITE_CANVAS_HEIGHT;
      const maxOffsetY = 0;

      offsetX = constrain(offsetX, minOffsetX, maxOffsetX);
      offsetY = constrain(offsetY, minOffsetY, maxOffsetY);

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  } else if (mouseButton === LEFT) { 
    if (currentMode === 'design' && currentPaintStroke) {
      paintBuffer.push();
      paintBuffer.noStroke(); 
      paintBuffer.fill(currentPaintStroke.color);
      let numDots = 3; 
      let dotSpread = currentPaintStroke.weight * 0.3; 
      for (let i = 0; i < numDots; i++) {
        let randX = mouseX - offsetX + random(-dotSpread, dotSpread);
        let randY = mouseY - offsetY + random(-dotSpread, dotSpread);
        paintBuffer.ellipse(randX, randY, currentPaintStroke.weight * random(0.8, 1.2), currentPaintStroke.weight * random(0.8, 1.2));
      }
      paintBuffer.pop();

      for (let pancarta of placedPancartas) {
          let localMouseX = mouseX - (pancarta.x + offsetX);
          let localMouseY = mouseY - (pancarta.y + offsetY);

          if (localMouseX >= 0 && localMouseX <= pancarta.width &&
              localMouseY >= 0 && localMouseY <= pancarta.height) {
              
              pancarta.buffer.push();
              pancarta.buffer.blendMode(DIFFERENCE); 
              pancarta.buffer.noStroke();
              pancarta.buffer.fill(0, 0, 0, currentPaintStroke.color.levels[3]); 
              
              let numEffectDots = 2; 
              let effectSpread = currentPaintStroke.weight * 0.2; 
              for (let i = 0; i < numEffectDots; i++) {
                  let randLocalX = localMouseX + random(-effectSpread, effectSpread);
                  let randLocalY = localMouseY + random(-effectSpread, effectSpread);
                  pancarta.buffer.ellipse(randLocalX, randLocalY, currentPaintStroke.weight * random(0.5, 0.8), currentPaintStroke.weight * random(0.5, 0.8));
              }
              pancarta.buffer.pop(); 
          }
      }
    }
  }
}

function mouseReleased() {
  if (mouseButton === RIGHT) {
      dragging = false;
  }
  
  if (currentMode === 'design' && currentPaintStroke) {
    currentPaintStroke = null; 
    if (spraySound && spraySound.isPlaying()) {
      spraySound.stop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const minOffsetX = width - INFINITE_CANVAS_WIDTH;
  const maxOffsetX = 0;
  const minOffsetY = height - INFINITE_CANVAS_HEIGHT;
  const maxOffsetY = 0;

  offsetX = constrain(offsetX, minOffsetX, maxOffsetX);
  offsetY = constrain(offsetY, minOffsetY, maxOffsetY);

  checkAndPopulateVisibleChunks();

  if (currentMode === 'text' && !finalMessageDisplayed) { 
    positionTextInput(inputVibrationIntensity); 
  }
}

function getCenteredRectBounds(x, y, w, h) {
  return {
    left: x - w / 2,
    right: x + w / 2,
    top: y - h / 2,
    bottom: y + h / 2,
    width: w,
    height: h
  };
}

function offsetXCanvasToHTML() {
  return select('#canvas-container').elt.offsetLeft;
}

function offsetYCanvasToHTML() {
  return select('#canvas-container').elt.offsetTop;
}

function handleTextInputChange() {
  let currentText = inputElement.value();
  lastWordCount = currentText.split(/\s+/).filter(w => w.length > 0).length; 
  console.log(`Words typed (for check on submit): ${lastWordCount}`);
}

function positionTextInput(intensity = 0) {
  let textInputContainer = select('#text-input-container');

  let dx = random(-intensity * 3, intensity * 3); 
  let dy = random(-intensity * 3, intensity * 3);
  let dRot = random(-intensity * 0.8, intensity * 0.8); 

  let newCenterX = textInputBaseX + dx; 
  let newCenterY = textInputBaseY + dy;

  let marginX = windowWidth * 0.05; 
  let marginY = windowHeight * 0.05;
  let inputWidth = textInputContainer.elt.offsetWidth;
  let inputHeight = textInputContainer.elt.offsetHeight;

  newCenterX = constrain(newCenterX, marginX + inputWidth / 2, windowWidth - inputWidth / 2 - marginX);
  newCenterY = constrain(newCenterY, marginY + inputHeight / 2, windowHeight - inputHeight / 2 - marginY);
  
  textInputContainer.style('left', newCenterX + 'px');
  textInputContainer.style('top', newCenterY + 'px');
  textInputContainer.style('transform', `translate(-50%, -50%) rotate(${dRot}deg)`); 
}

function handleSubmitText() {
  let fullText = inputElement.value();
  if (fullText.trim() === '') return;
  
  let words = fullText.split(/\s+/).filter(w => w.length > 0);
  let coloredWords = [];
  const textColors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE', '#FFC0CB', '#000000', '#FFFFFF']; 

  for (let word of words) { 
    coloredWords.push({
      text: word,
      color: random(textColors)
    });
  }

  let textCanvasX = mouseX - offsetX; 
  let textCanvasY = mouseY - offsetY; 

  submittedTexts.push({
    fullText: fullText, 
    words: coloredWords,
    finalX: textCanvasX, 
    finalY: textCanvasY,
  });

  textBuffer.push();
  textBuffer.translate(textCanvasX, textCanvasY);
  let currentTextWidth = 0;
  let totalTextWidth = 0;
  for (let i = 0; i < coloredWords.length; i++) {
      textBuffer.textSize(80); 
      textBuffer.textFont(graffitiFont); 
      totalTextWidth += textBuffer.textWidth(coloredWords[i].text) + (i < coloredWords.length - 1 ? textBuffer.textWidth(' ') : 0);
  }
  for (let i = 0; i < coloredWords.length; i++) {
    let wordObj = coloredWords[i];
    textBuffer.textSize(80); 
    textBuffer.textFont(graffitiFont); 
    textBuffer.fill(wordObj.color); 
    textBuffer.stroke(0);
    textBuffer.strokeWeight(2);
    let wordWidth = textBuffer.textWidth(wordObj.text);
    textBuffer.text(wordObj.text, currentTextWidth + wordWidth / 2 - totalTextWidth / 2, 0); 
    currentTextWidth += wordWidth + textBuffer.textWidth(' '); 
  }
  textBuffer.pop();


  inputElement.value(''); // Clear input for next typing attempt
  lastWordCount = 0; // Reset words in current input for next typing (will be 0 because input is empty)

  submittedWordCount++; // Increment count of submitted texts
  console.log('Submitted text count: ' + submittedWordCount);

  // --- Lógica de reproducción y pitch del ruido de murmullo ---
  if (submittedWordCount === 1) { // Primer mensaje enviado
    if (ruidoMurmulloSound && !ruidoMurmulloSound.isPlaying()) {
      ruidoMurmulloSound.loop();
      ruidoMurmulloSound.rate(1.0); // Empieza normal
      murmulloPitchRate = 1.0;
      console.log("Murmullo started at 1.0x pitch.");
    }
  } else if (submittedWordCount >= 3) { // A partir del tercer envío
      if (submittedWordCount === 3) {
          murmulloPitchRate = 1.2;
      } else if (submittedWordCount === 4) {
          murmulloPitchRate = 1.5;
      } else if (submittedWordCount === 5) {
          murmulloPitchRate = 1.8;
      } else if (submittedWordCount === 6) {
          murmulloPitchRate = 2.0; 
      } else if (submittedWordCount === 7) { 
          murmulloPitchRate = 2.3;
      } else if (submittedWordCount >= 8) { 
          murmulloPitchRate = 2.5;
      }
      if (ruidoMurmulloSound && ruidoMurmulloSound.isPlaying()) {
          ruidoMurmulloSound.rate(murmulloPitchRate);
          console.log(`Murmullo pitch set to: ${murmulloPitchRate}`);
      }
  }
  // --- FIN Lógica de sonido ---

  // --- Lógica de vibración basada en submittedWordCount con progresión gradual ---
  if (submittedWordCount === 1) { 
      inputVibrationIntensity = 0; // Se ajustó a 0 para el primer envío
  } else if (submittedWordCount === 2) { 
      inputVibrationIntensity = 2; 
  } else if (submittedWordCount === 3) { 
      inputVibrationIntensity = 6; // Ligeramente más suave
  } else if (submittedWordCount === 4) { 
      inputVibrationIntensity = 10; // Ligeramente más suave
  } else if (submittedWordCount === 5) { 
      inputVibrationIntensity = 20; // Ligeramente más suave
  } else if (submittedWordCount === 6) { 
      inputVibrationIntensity = 40; // Ligeramente más suave
  } else { 
      inputVibrationIntensity = 70; // El máximo se mantiene pero se alcanza más tarde
  }
  console.log(`Vibration Intensity set for next input: ${inputVibrationIntensity}`);
  // --- FIN CAMBIO ---

  // --- Disparar endExperience si se envía con 7+ palabras (en el *mensaje actual*) O si se alcanza el nuevo límite de submits (6) ---
  if (words.length >= 7 || submittedWordCount >= EXPRESARSE_LIMIT) { 
      endExperience();
  } else {
      textInputBaseX = random(width * 0.2, width * 0.8); 
      textInputBaseY = random(height * 0.2, height * 0.8); 
      select('#text-input-container').style('left', textInputBaseX + 'px'); 
      select('#text-input-container').style('top', textInputBaseY + 'px'); 
      select('#text-input-container').style('transform', `translate(-50%, -50%) rotate(0deg)`); 
      positionTextInput(inputVibrationIntensity); 
  }
  
  dragging = false; 
}

// This function now handles specific interaction counts for each mode
function incrementSpecificInteractionCount(mode) {
  let triggerLimitReached = false;

  if (mode === 'pan') {
      comunicarClicks++;
      console.log('Comunicar Clicks: ' + comunicarClicks);
      if (comunicarClicks >= COMUNICAR_LIMIT) { 
          triggerLimitReached = true;
      }
  } else if (mode === 'design') {
      intervenirStrokes++;
      console.log('Intervenir Strokes: ' + intervenirStrokes);
      if (intervenirStrokes >= INTERVENIR_LIMIT) { 
          triggerLimitReached = true;
      }
  } else if (mode === 'sticker') {
      marcarStickers++;
      console.log('Marcar Stickers: ' + marcarStickers);
      if (marcarStickers >= MARCAR_LIMIT) { 
          triggerLimitReached = true;
      }
  }
  
  if (triggerLimitReached && !finalMessageDisplayed) {
      endExperience();
  }
}

function endExperience(fromRebobinar = false) {
  if (finalMessageDisplayed) return; 
  finalMessageDisplayed = true;
  finalActionPhase = true; 

  for (let segment of contentData) {
    if (segment.loadedAudio && segment.loadedAudio.isPlaying()) {
      segment.loadedAudio.stop();
      segment.isPlaying = false;
    }
  }
  if (spraySound && spraySound.isPlaying()) {
    spraySound.stop();
  }
  if (sprayPaintSound && sprayPaintSound.isPlaying()) {
    sprayPaintSound.stop();
  }
  // --- DETENER RUIDO MURMULLO AL FINAL ---
  if (ruidoMurmulloSound && ruidoMurmulloSound.isPlaying()) {
    ruidoMurmulloSound.stop();
  }
  // --- FIN DETENER ---

  if (sirenSound && !sirenSound.isPlaying()) {
    sirenSound.play();
  }

  let messages = [
    "No hay vuelta atrás.",
    "Lo hecho, hecho está.",
    "Cuidá lo que decís.",
    "Las palabras tienen peso.",
    "Tu mensaje, tu legado."
  ];

  setTimeout(() => {
    alert(random(messages));
    if (sirenSound && sirenSound.isPlaying()) {
        sirenSound.stop();
    }
  }, 1500); 

  showManifestate = false; 
  select('#text-input-container').hide(); 
}

function resetExperience() {
  paintBuffer.clear();
  textBuffer.clear();
  stickerBuffer.clear();

  wordsData = [];
  revealedPosters = [];
  placedStickers = [];
  submittedTexts = [];

  for (let pancarta of placedPancartas) {
      if (pancarta.buffer) { 
          pancarta.buffer.remove(); 
      }
  }
  placedPancartas = [];

  // --- Resetear los trozos poblados ---
  populatedChunks = new Set();
  // --- FIN NUEVO ---

  // Centrar el offset inicial nuevamente después del reset
  offsetX = width / 2 - INFINITE_CANVAS_WIDTH / 2; 
  offsetY = height / 2 - INFINITE_CANVAS_HEIGHT / 2;
  currentMode = 'pan'; 
  dragging = false;
  
  // Reset ALL specific interaction counters
  comunicarClicks = 0;
  intervenirStrokes = 0;
  marcarStickers = 0;
  submittedWordCount = 0; 

  finalMessageDisplayed = false;
  finalActionPhase = false; 
  inputVibrationIntensity = 0; 
  lastWordCount = 0; 
  
  // --- RESETEAR PROPIEDADES DE MURMULLO ---
  murmulloPitchRate = 1.0; 
  if (ruidoMurmulloSound && ruidoMurmulloSound.isPlaying()) {
    ruidoMurmulloSound.stop();
  }
  // --- FIN RESETEO ---

  textInputBaseX = width / 2;
  textInputBaseY = height / 2;

  for (let segment of contentData) {
    segment.isTriggered = false;
    segment.isPlaying = false;
    if (segment.loadedAudio) {
      segment.loadedAudio.stop();
      segment.loadedAudio.rate(1); 
    }
  }
  if (spraySound && spraySound.isPlaying()) {
    spraySound.stop();
  }
  if (sprayPaintSound && sprayPaintSound.isPlaying()) {
    sprayPaintSound.stop();
  }

  // --- Volver a poblar la vista inicial después del reset ---
  checkAndPopulateVisibleChunks(); 
  // --- FIN NUEVO ---
  select('#text-input-container').style('transform', 'translate(-50%, -50%) rotate(0deg)');
  positionTextInput(0); 
}

function hideUIForSave() {
    if (btnComunicar) btnComunicar.hide();
    if (btnIntervenir) btnIntervenir.hide();
    if (btnMarcar) btnMarcar.hide();
    if (btnExpresarse) btnExpresarse.hide();
    if (btnRebobinarConciencia) btnRebobinarConciencia.hide();
    if (btnSaveWork) btnSaveWork.hide();

    select('#text-input-container').hide();
    return showManifestate; 
}

function showUIAfterSave(wasManifestateShown) {
    if (currentMode === 'text' && !finalMessageDisplayed && lastWordCount < 7) { 
        select('#text-input-container').show();
    }
    showManifestate = wasManifestateShown; 
}

function saveCanvasTemporarilyHiddenUI() {
    let originalManifestateState = showManifestate; 
    let originalMode = currentMode;
    currentMode = 'pan'; 

    showManifestate = false; 
    hideUIForSave(); 

    setTimeout(() => {
        saveCanvas('mi_obra', 'png');
        currentMode = originalMode; 
        showUIAfterSave(originalManifestateState); 
    }, 10); 
}