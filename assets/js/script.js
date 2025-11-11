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

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let snake; // le corps du serpent
let direction;
let nextMove = 0;
let cursors;
let apple;
let score = 0;
let scoreText;

const moveInterval = 150; // temps entre deux mouvements
const tileSize = 15; // taille d’un carré

function preload() {
  const g = this.add.graphics();

  this.load.image("background", "/assets/img/terrain1.jpg");
  this.load.image("apple", "/assets/img/fruit.png");
  this.load.image("head", "/assets/img/tete.png");

  // texture du serpent
  g.fillStyle(0x598842, 1);
  g.fillRoundedRect(0, 0, tileSize, tileSize, 4);
  g.generateTexture("segment", tileSize, tileSize);
  g.destroy();
}

function create() {
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
  for (let i = 1; i < 3; i++) {
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
  const style = { font: "16px Arial", fill: "#fff" };
  scoreText = this.add.text(10, 10, "Score : 0", style);
  this.add.text(10, 30, "Utilise les flèches pour diriger le serpent", {
    font: "14px Arial",
    fill: "#aaa",
  });
}

function update(time) {
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
    score += 10;
    scoreText.setText("Score : " + score);
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

function gameOver(scene) {
  scene.add.text(config.width / 2 - 100, config.height / 2 - 100, "GAME OVER", {
    font: "32px Arial",
    fill: "#ff0000ff",
  });

  scene.scene.pause();
  
  // crée un bouton DOM "Recommencer" si nécessaire et le positionne par rapport au canvas
  let btn = document.getElementById("restart-btn");
  const canvas = scene.sys.game.canvas;
  const rect = canvas.getBoundingClientRect();

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "restart-btn";
    btn.textContent = "Rejouer";
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
      restartGame();
      // suppression du bouton après clic
      const b = document.getElementById("restart-btn");
      if (b) b.remove();
    });
  }

  // positionne le bouton au centre bas du canvas
  btn.style.left = rect.left + rect.width / 2 - 50 + "px";
  btn.style.top = rect.top + rect.height / 2 + 10 + "px";
  btn.style.display = "block";
}

function restartGame() {
  // supprime le bouton si présent
  const b = document.getElementById("restart-btn");
  if (b) b.remove();

  // réinitialise le score et redémarre la scène principale
  score = 0;
  game.scene.scenes[0].scene.restart();
}
