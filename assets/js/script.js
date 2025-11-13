// const config = {
//   type: Phaser.AUTO,
//   //plateau de 800x600 pixels
//   width: 800,
//   height: 600,
//   backgroundColor: "#22222267",
//   scene: {
//     preload: preload, //pour charger ou créer les ressources.
//     create: create, //pour initialiser et afficher les éléments.
//     update: update, //pour la boucle de jeu. pour mettre à jour la logique du jeu
//   },
// };

// const game = new Phaser.Game(config);

// let boardContainer; //servira à stocker le conteneur qui regroupe le plateau + le joueur.
// let cursors; //contiendra les touches fléchées (pour contrôler avec le clavier).
// const speed = 300; // vitesse de déplacement du plateau (300 pixels par seconde)
// let point; // pour le point

// function preload() {
//   // crée un objet de dessin “virtuel”
//   const g = this.add.graphics();

//   // personage
//   g.fillStyle(0xF2C05A, 1);
//   g.fillRect(0, 0, 30, 30); //dessine un carré 40×40 pixels à la position (0, 0)
//   g.generateTexture("player", 30, 30); // crée une texture à partir du dessin

//   g.destroy(); // détruit l’objet graphique (plus besoin de l’afficher)
// }

// function create() {
//   // carré joueur centré sur l’écran
//   player = this.add
//     .image(config.width / 2, config.height / 2, "player")
//     .setOrigin(0.5);
//   /*.setOrigin(0.5)
// Définit le point d’origine de l’image au centre plutôt qu’au coin supérieur gauche.*/

//   cursors = this.input.keyboard.createCursorKeys();
//   /*Crée un objet cursors contenant les touches fléchées du clavier :
// cursors.left → flèche gauche
// cursors.right → flèche droite
// cursors.up → flèche haut
// cursors.down → flèche bas*/

//   // texte d'aide
//   const style = { font: "14px Arial", fill: "#fff" };
//   this.add.text(10, 10, "Déplacer le carré rouge : flèches", style);

//   createRandomPoint.call(this); // Crée un point aléatoire au début du jeu
// }

// function update(time, delta) {
//   //delta = temps écoulé depuis la dernière frame, en millisecondes.
//   //On le convertit en secondes (dt) pour calculer un déplacement indépendant du FPS
//   const dt = delta / 1000;

//   // déplacer le carré rouge selon les touches appuyées
//   if (cursors.left.isDown) player.x -= speed * dt; //Vérifie si chaque touche fléchée est maintenue enfoncée (isDown).
//   if (cursors.right.isDown) player.x += speed * dt;
//   if (cursors.up.isDown) player.y -= speed * dt;
//   if (cursors.down.isDown) player.y += speed * dt;
//   //speed * dt → déplacement proportionnel au temps, ce qui rend le mouvement fluide, même si le FPS change.

//   // limiter le carré rouge aux bords de l'écran
//   player.x = Phaser.Math.Clamp(player.x, 20, config.width - 20);
//   player.y = Phaser.Math.Clamp(player.y, 20, config.height - 20);
//   /*Phaser.Math.Clamp(value, min, max) limite une valeur entre un minimum et un maximum.
// Ici :
// player.x ne peut pas aller en dehors de l’écran horizontalement (20 à config.width - 20).
// player.y ne peut pas aller en dehors de l’écran verticalement (20 à config.height - 20).
// La valeur 20 correspond à la moitié du carré (40px / 2) pour que le joueur ne dépasse pas visuellement l’écran.*/

//   // Vérifier si le joueur touche le point
// if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), point.getBounds())) {
//     point.destroy(); // Détruire le point
//     createRandomPoint.call(this); // Créer un nouveau point aléatoire
//   }
// }

// // Fonction pour créer un point aléatoire
// function createRandomPoint() {
//   const x = Phaser.Math.Between(20, config.width - 20);
//   const y = Phaser.Math.Between(20, config.height - 20);
//   point = this.add.rectangle(x, y, 20, 20, 0xff0000); // Créer un rectangle rouge comme point
// }

class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  preload() {
    this.load.image("first", "/assets/img/fond.png");
  }

  create() {

    // place le background en 0,0 et l'ajuste à la taille du canvas
    const bg = this.add.image(0, 0, "first").setOrigin(0);
    bg.setDisplaySize(config.width, config.height);


    // Bouton "Commencer" en texte
    const startButton = this.add.text(400, 300, 'Commencer', {
      font: '32px Arial',
      fill: '#ffff',
      backgroundColor: '#000000ff',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.scene.start('GameScene'); // Démarre la scène du jeu
    })
    .on('pointerover', function() {
      this.setFill('#ff0000ff');
    })
    .on('pointerout', function() {
      this.setFill('#ffffffff');
    });
  }
}


let snake; // le corps du serpent
let direction;
let nextMove = 0;
let cursors;
let apple;
let score = 0;
let scoreText;
let lastDifficultyLevel = 0; // <-- AJOUTER : pour tracker le dernier niveau de difficulté


let moveInterval = 150;            // valeur actuelle (modifiable lors du bonus)
const normalMoveInterval = 150;    // valeur de base pour revenir après le bonus
const boostFactor = 0.5;           // vitesse pendant le bonus = normalMoveInterval * boostFactor
const boostDuration = 5000;        // durée du bonus en ms (ex : 5000 = 5s)
const bonusRespawnDelay = 8000;    // délai avant réapparition du bonus si mangé (ms)

const tileSize = 15; // taille d’un carré

class GameScene extends Phaser.Scene {  
  constructor() {
    super({ key: "GameScene" });
  }

preload() {
  const g = this.add.graphics();

  this.load.image("background", "/assets/img/terrain1.jpg");
  this.load.image("apple", "/assets/img/fruit.png");
  this.load.image("head", "/assets/img/tete.png");

  this.load.image("boost", "/assets/img/star.png");

  this.load.image("pacmanferme", "/assets/img/pac_ferme.png");
  this.load.image("pacmanouvert", "/assets/img/pac_ouvert.png");
  
  this.load.image("rock", "/assets/img/buisson.png");

  // son
  this.load.audio("eat", "/assets/audio/eat.mp3");
  this.load.audio("gameover", "/assets/audio/game_over.mp3");

  // texture du serpent
  g.fillStyle(0x598842, 1);
  g.fillRoundedRect(0, 0, tileSize, tileSize, 4);
  g.generateTexture("segment", tileSize, tileSize);
  g.destroy();

}

create() {
  // place le background en 0,0 et l'ajuste à la taille du canvas
  const bg = this.add.image(0, 0, "background").setOrigin(0);
  bg.setDisplaySize(config.width, config.height);
  bg.setDepth(0); // place le background derrière tous les autres éléments

  snake = [];

  // crée la tête du serpent avec la texture "head"
  const head = this.add.image(400, 300, "head").setOrigin(0.5);
  head.setDisplaySize(tileSize * 4, tileSize * 4); // taille cohérente avec les segments
  head.setDepth(2); // tête au-dessus du corps
  snake.push(head);

  // créer les segments du corps (1 segment initial ici)
  for (let i = 1; i < 4; i++) {
    const segment = this.add.image(400 - i * tileSize, 300, "segment").setOrigin(0.5);
    segment.setDisplaySize(tileSize, tileSize);
    segment.setDepth(1); // place les segments derrière la tête
    snake.push(segment);
  }

  direction = "RIGHT";
  cursors = this.input.keyboard.createCursorKeys();

  // crée la pomme (une seule fois) avec la texture "apple"
  const maxCols = Math.floor(config.width / tileSize) - 1;
  const maxRows = Math.floor(config.height / tileSize) - 1;
  apple = this.add.image(
    Phaser.Math.Between(0, maxCols) * tileSize + tileSize / 2,
    Phaser.Math.Between(0, maxRows) * tileSize + tileSize / 2,
    "apple"
  ).setOrigin(0.5);
  apple.setDisplaySize(tileSize * 2, tileSize * 2); // ajuster la taille si besoin

  // texte du score
  const style = { font: "32px Arial", fill: "#fff" };
  scoreText = this.add.text(10, 10, "Score : 0", style);

  // Bonus speed (sera créé via la méthode spawnBonus)
  this.bonus = null;
  this.spawnBonus(); // apparait au début

  // Obstacle et NPCs
    this.npcs = [];        // tableau des NPCs
    this.npcDirs = [];     // directions courantes des NPCs
    this.obstacle = [];  // obstacle

    this.spawnObstacle(1);
    this.spawnNPCs(1); // crée 2 personnages
}


// Nouvelle méthode pour créer / réapparaître le bonus (déjà existante)
  spawnBonus() {
    if (this.bonus && this.bonus.active) return;
    const maxCols = Math.floor(config.width / tileSize) - 1;
    const maxRows = Math.floor(config.height / tileSize) - 1;
    const x = Phaser.Math.Between(0, maxCols) * tileSize + tileSize / 2;
    const y = Phaser.Math.Between(0, maxRows) * tileSize + tileSize / 2;

    if (this.textures.exists('boost')) {
      this.bonus = this.add.image(x, y, 'boost').setOrigin(0.5);
      this.bonus.setDisplaySize(tileSize * 2, tileSize * 2);
    } else {
      // fallback graphique si pas d'image
      this.bonus = this.add.rectangle(x, y, tileSize, tileSize, 0xffff00).setOrigin(0.5);
    }
    this.bonus.setDepth(1);
  }

  // SPAWN Obstacle
  spawnObstacle(count = 1) {
    const maxCols = Math.floor(config.width / tileSize) - 1;
    const maxRows = Math.floor(config.height / tileSize) - 1;

    if (!this.obstacles) this.obstacles = [];

    for (let i = 0; i < count; i++) {
      let x, y;
      let tries = 0;
      let ok = false;

      // essaie d'éviter d'apparaitre sur la pomme / le serpent / un autre obstacle
      do {
        x = Phaser.Math.Between(1, maxCols - 1) * tileSize + tileSize / 2;
        y = Phaser.Math.Between(1, maxRows - 1) * tileSize + tileSize / 2;
        tries++;

        let collide = false;
        if (apple && Phaser.Math.Distance.Between(x, y, apple.x, apple.y) < tileSize * 2) collide = true;
        for (const ob of this.obstacles) {
          if (Phaser.Math.Distance.Between(x, y, ob.x, ob.y) < tileSize * 4) { collide = true; break; }
        }
        for (const s of snake) {
          if (Phaser.Math.Distance.Between(x, y, s.x, s.y) < tileSize * 2) { collide = true; break; }
        }

        if (!collide) ok = true;
      } while (!ok && tries < 30);

      const bush = this.add.image(x, y, 'rock').setOrigin(0.5);
      bush.setDisplaySize(tileSize * 4, tileSize * 4);
      bush.setDepth(1);
      this.obstacles.push(bush);
    }
  }

  spawnNPCs(count) {
    const maxCols = Math.floor(config.width / tileSize) - 1;
    const maxRows = Math.floor(config.height / tileSize) - 1;
    const dirs = ["LEFT", "RIGHT", "UP", "DOWN"];

    // tableau pour garder les timers d'animation (facultatif)
    this.npcTimers = this.npcTimers || [];

    const hasPacman = this.textures.exists('pacmanferme') && this.textures.exists('pacmanouvert');

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, maxCols) * tileSize + tileSize / 2;
      const y = Phaser.Math.Between(0, maxRows) * tileSize + tileSize / 2;

      let npc;
      if (hasPacman) {
        // sprite Pacman animé en alternant deux textures
        npc = this.add.sprite(x, y, 'pacmanferme').setOrigin(0.5);
        npc.setDisplaySize(tileSize * 2, tileSize * 2);

        // toggle texture pour simuler l'animation (bouche ouverte/fermée)
        const toggleDelay = 200; // ms, ajuste la vitesse de mastication
        const t = this.time.addEvent({
          delay: toggleDelay,
          loop: true,
          callback: () => {
            // alterne entre les deux clés
            const nextKey = (npc.texture.key === 'pacmanferme') ? 'pacmanouvert' : 'pacmanferme';
            npc.setTexture(nextKey);
          }
        });
        this.npcTimers.push(t);
      } else {
        // fallback : carré rouge
        npc = this.add.image(x, y, 'npc').setOrigin(0.5);
        npc.setDisplaySize(tileSize * 2, tileSize * 2);
      }

      npc.setDepth(1);
      this.npcs.push(npc);
      this.npcDirs.push(Phaser.Utils.Array.GetRandom(dirs));
    }
  }

update(time) {
  if (time < nextMove) return;
  nextMove = time + moveInterval;

  // changement de direction
  if (cursors.left.isDown && direction !== "RIGHT") direction = "LEFT";
  else if (cursors.right.isDown && direction !== "LEFT") direction = "RIGHT";
  else if (cursors.up.isDown && direction !== "DOWN") direction = "UP";
  else if (cursors.down.isDown && direction !== "UP") direction = "DOWN";

  const headX = snake[0].x;
  const headY = snake[0].y;

  let newX = headX;
  let newY = headY;

  // déplacement de la tête
  if (direction === "LEFT") {
    newX -= tileSize;
    snake[0].angle = 180; // tourner à gauche
  } else if (direction === "RIGHT") {
    newX += tileSize;
    snake[0].angle = 0; // tourner à droite
  } else if (direction === "UP") {
    newY -= tileSize;
    snake[0].angle = -90; // tourner vers le haut
  } else if (direction === "DOWN") {
    newY += tileSize;
    snake[0].angle = 90; // tourner vers le bas
  }

  // déplace le corps
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i].x = snake[i - 1].x;
    snake[i].y = snake[i - 1].y;
  }

  // déplace la tête
  snake[0].x = newX;
  snake[0].y = newY;

  // vérifier si le serpent mange la pomme
  if (Phaser.Math.Distance.Between(snake[0].x, snake[0].y, apple.x, apple.y) < tileSize) {

    // 🔊 joue le son de croque
  this.sound.play("eat", { volume: 0.5 });

    // repositionner la pomme
    const maxCols = Math.floor(config.width / tileSize) - 1;
    const maxRows = Math.floor(config.height / tileSize) - 1;
    apple.x = Phaser.Math.Between(0, maxCols) * tileSize + tileSize / 2;
    apple.y = Phaser.Math.Between(0, maxRows) * tileSize + tileSize / 2;

    // ajouter un nouveau segment à la fin
    const last = snake[snake.length - 1];
    const newSegment = this.add.image(last.x, last.y, "segment").setOrigin(0.5);
    newSegment.setDisplaySize(tileSize, tileSize);
    newSegment.setDepth(1); // place les segments derrière la tête
    snake.push(newSegment);

    // mise à jour du score
    score += 1;
    scoreText.setText("Score : " + score);

    // ---- AUGMENTER LA DIFFICULTÉ TOUS LES 3 POINTS ----
    const currentLevel = Math.floor(score / 3);
    if (currentLevel > lastDifficultyLevel) {
      lastDifficultyLevel = currentLevel;
      console.log("🎮 Niveau " + currentLevel + " atteint ! +1 obstacle, +1 ennemi");
      
      // Ajouter 1 obstacle
      this.spawnObstacle(1);
      
      // Ajouter 1 NPC
      this.spawnNPCs(1);
    }
  }

  // vérifier si le serpent touche le bonus speed
  if (this.bonus && Phaser.Math.Distance.Between(snake[0].x, snake[0].y, this.bonus.x, this.bonus.y) < tileSize) {
    // applique le boost : réduit moveInterval (mouvement plus fréquent => plus rapide)
    moveInterval = Math.max(30, Math.floor(normalMoveInterval * boostFactor));

    // détruit le bonus pour le faire réapparaître plus tard
    this.bonus.destroy();
    this.bonus = null;

    // planifier la fin du boost (retour à la vitesse normale)
    this.time.delayedCall(boostDuration, () => {
      moveInterval = normalMoveInterval;
    }, [], this);

    // planifier la réapparition du bonus
    this.time.delayedCall(bonusRespawnDelay, () => {
      this.spawnBonus();
    }, [], this);
  }

// Déplacer les NPCs à chaque tick (mouvement sur la grille)
    const maxCols = Math.floor(config.width / tileSize) - 1;
    const maxRows = Math.floor(config.height / tileSize) - 1;
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      let dir = this.npcDirs[i];

      // 20% chance de changer de direction aléatoirement
      if (Phaser.Math.Between(0, 100) < 20) {
        dir = Phaser.Utils.Array.GetRandom(["LEFT", "RIGHT", "UP", "DOWN"]);
        this.npcDirs[i] = dir;
      }

      let nx = npc.x;
      let ny = npc.y;
      if (dir === "LEFT") nx -= tileSize;
      else if (dir === "RIGHT") nx += tileSize;
      else if (dir === "UP") ny -= tileSize;
      else if (dir === "DOWN") ny += tileSize;

      // si hors limites, choisis une nouvelle direction au hasard
      if (nx < 0 || ny < 0 || nx >= config.width || ny >= config.height) {
        dir = Phaser.Utils.Array.GetRandom(["LEFT", "RIGHT", "UP", "DOWN"]);
        this.npcDirs[i] = dir;
        continue;
      }

      // appliquer le mouvement
      npc.x = nx;
      npc.y = ny;

      // si c'est un sprite animé, ajuste l'orientation visuelle
        if (npc.setFlipX !== undefined) {
          npc.setFlipX(dir === "LEFT");
        }

      // collision NPC <-> tête du serpent => game over
      if (Phaser.Math.Distance.Between(snake[0].x, snake[0].y, npc.x, npc.y) < tileSize) {
        gameOver(this);
        return;
      }
    }

    // vérifier collision obstacle(s) <-> tête du serpent
    if (this.obstacles && this.obstacles.length) {
      for (let ob of this.obstacles) {
        if (Phaser.Math.Distance.Between(snake[0].x, snake[0].y, ob.x, ob.y) < tileSize) {
          gameOver(this);
          return;
        }
      }
    }

  // vérifier collision avec soi-même
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      gameOver(this);
      break;
    }
  }

  // vérifier collision avec les murs
  if (newX < 0 || newY < 0 || newX >= config.width || newY >= config.height) {
    gameOver(this);
  }
}
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  scene: [MainMenu, GameScene], // Utilisation de scènes pour mieux organiser le code
};

const game = new Phaser.Game(config);


function gameOver(scene) {
  scene.sound.play("gameover", { volume: 0.5 });
  
  scene.add.text(config.width / 2 - 100, config.height / 2 - 100, "GAME OVER", {
    font: "32px Arial",
    fill: "#ff0000ff",
  });

  scene.scene.pause();

  const canvas = scene.sys.game.canvas;
  const rect = canvas.getBoundingClientRect();

  // --- BOUTON REJOUER ---
  let restartBtn = document.getElementById("restart-btn");
  if (!restartBtn) {
    restartBtn = document.createElement("button");
    restartBtn.id = "restart-btn";
    restartBtn.textContent = "Rejouer";
    document.body.appendChild(restartBtn);

    restartBtn.addEventListener("click", () => {
      restartGame();
      cleanButtons();
    });
  }

  restartBtn.style.left = rect.left + rect.width / 2 - 120 + "px";
  restartBtn.style.top = rect.top + rect.height / 2 + 10 + "px";
  restartBtn.style.display = "block";

  // --- BOUTON QUITTER ---
  let quitBtn = document.getElementById("quit-btn");
  if (!quitBtn) {
    quitBtn = document.createElement("button");
    quitBtn.id = "quit-btn";
    quitBtn.textContent = "Quitter";
    document.body.appendChild(quitBtn);

    quitBtn.addEventListener("click", () => {
      quitGame(scene);
      cleanButtons();
    });
  }

  quitBtn.style.left = rect.left + rect.width / 2 + 20 + "px";
  quitBtn.style.top = rect.top + rect.height / 2 + 10 + "px";
  quitBtn.style.display = "block";
}

// 🔹 Fonction pour supprimer les boutons
function cleanButtons() {
  const restart = document.getElementById("restart-btn");
  const quit = document.getElementById("quit-btn");
  if (restart) restart.remove();
  if (quit) quit.remove();
}

// 🔹 Fonction rejouer (inchangée, mais propre)
function restartGame() {
  score = 0;
  game.scene.stop("GameScene");
  game.scene.start("GameScene");
}

// 🔹 Fonction quitter → retour au menu principal
function quitGame(scene) {
  score = 0;
  game.scene.stop("GameScene");
  game.scene.start("MainMenu");
}

