let dino;
let dinoGraphics;
let obstacles;
let ground;
let score = 0;
let scoreText;
let gameOver = false;
let cursors;
let gameSpeed = 5;
let isJumping = false;
let gameStarted = false;
let obstacleTimer;
let scoreTimer;
let fondMusic;

const groundY = 365; // position du sol invisible

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.audio("jump", "/assets/audio/jump.mp3");
  this.load.audio("game_over", "/assets/audio/game_over_dino.mp3");
  this.load.audio("fond", "/assets/audio/fond_dino.mp3");
}

function create() {
  const scene = this;

  // Créer les textures dans create()
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });

  // Texture du dinosaure
  graphics.clear();
  graphics.fillStyle(0x6b8e23, 1);
  graphics.fillRect(0, 10, 40, 50);
  graphics.fillRect(20, 0, 30, 30);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 10, 4);
  graphics.fillStyle(0x6b8e23, 1);
  graphics.fillRect(5, 60, 8, 15);
  graphics.fillRect(25, 60, 8, 15);
  graphics.generateTexture("dino", 50, 75);

  // Texture oiseau
  graphics.clear();
  graphics.fillStyle(0x8b4513, 1);
  graphics.fillRect(5, 8, 25, 12);
  graphics.fillRect(0, 10, 10, 3);
  graphics.fillRect(25, 10, 10, 3);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(25, 12, 2);
  graphics.generateTexture("bird", 35, 20);

  graphics.destroy();

  // Fond
  this.add.rectangle(0, 0, 800, 400, 0xf7f7f7).setOrigin(0);

  // Sol - ligne visible
  for (let i = 0; i < 800; i += 20) {
    this.add.rectangle(i, 350, 20, 2, 0x535353).setOrigin(0);
  }

  // Créer le dinosaure avec la texture
  dino = this.physics.add.sprite(100, 285, "dino");
  dino.setOrigin(0.5, 1);
  dino.body.setSize(40, 65);
  dino.body.setOffset(5, 10);
  dino.setCollideWorldBounds(true);
  dino.body.setGravityY(300);

  // Créer un sol invisible pour la collision
  ground = this.add.rectangle(400, 365, 800, 30, 0xffffff, 0);
  this.physics.add.existing(ground, true);

  // Collision dino et sol
  this.physics.add.collider(dino, ground, function () {
    isJumping = false;
  });

  // Groupe d'obstacles
  obstacles = this.physics.add.group();

  // Collision dino et obstacles
  this.physics.add.overlap(dino, obstacles, hitObstacle, null, this);

  // Contrôles
  cursors = this.input.keyboard.createCursorKeys();

  this.input.keyboard.on("keydown-SPACE", function () {
    jump(scene);
  });

  this.input.keyboard.on("keydown-UP", function () {
    jump(scene);
  });

  this.input.on("pointerdown", function () {
    if (gameStarted) {
      jump(scene);
    }
  });

  // Score
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "24px",
    fill: "#535353",
    fontFamily: "Courier New",
  });
  scoreText.setVisible(false);

  // Interface d'accueil
  const titleBg = this.add.rectangle(400, 150, 600, 120, 0x6b8e23, 0.9);
  titleBg.setStrokeStyle(4, 0x4a6b1a);
  
  const title = this.add.text(400, 130, '🦕 DINO JUMP 🦕', {
    fontSize: '56px',
    fill: '#ffffff',
    fontFamily: 'Courier New',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  const subtitle = this.add.text(400, 180, 'Le jeu du dinosaure', {
    fontSize: '24px',
    fill: '#f0f0f0',
    fontFamily: 'Courier New'
  }).setOrigin(0.5);

  // Bouton Start
  const startButton = this.add.rectangle(400, 280, 200, 60, 0x228b22);
  startButton.setStrokeStyle(4, 0x1a6b1a);
  startButton.setInteractive({ useHandCursor: true });
  
  const startText = this.add.text(400, 280, 'START', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Courier New',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // Instructions
  const instructions = this.add.text(400, 350, 'Utilisez ESPACE ou cliquez pour sauter', {
    fontSize: '18px',
    fill: '#535353',
    fontFamily: 'Courier New'
  }).setOrigin(0.5);

  // Effet hover sur le bouton
  startButton.on('pointerover', () => {
    startButton.setFillStyle(0x2db82d);
    startButton.setScale(1.05);
    startText.setScale(1.05);
  });

  startButton.on('pointerout', () => {
    startButton.setFillStyle(0x228b22);
    startButton.setScale(1);
    startText.setScale(1);
  });

  // Démarrer le jeu
  startButton.on('pointerdown', () => {
    gameStarted = true;
    scoreText.setVisible(true);
    
    // Faire disparaître l'interface d'accueil
    this.tweens.add({
      targets: [titleBg, title, subtitle, startButton, startText, instructions],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        titleBg.destroy();
        title.destroy();
        subtitle.destroy();
        startButton.destroy();
        startText.destroy();
        instructions.destroy();
        
        // Démarrer le jeu
        startGame(scene);
      }
    });
  });

  // Cacher le dino au début
  dino.setVisible(false);
}

function startGame(scene) {
  // Montrer le dino
  scene.tweens.add({
    targets: dino,
    alpha: { from: 0, to: 1 },
    duration: 500,
    onStart: () => {
      dino.setVisible(true);
    }
  });

  // Musique de fond
  fondMusic = scene.sound.add("fond", { volume: 1, loop: true });
  fondMusic.play();

  // Générer des obstacles régulièrement
  obstacleTimer = scene.time.addEvent({
    delay: 1800,
    callback: function () {
      spawnObstacle(scene);
    },
    callbackScope: scene,
    loop: true,
  });

  // Premier obstacle après 2 secondes
  scene.time.delayedCall(2000, () => {
    spawnObstacle(scene);
  });

  // Augmenter le score
  scoreTimer = scene.time.addEvent({
    delay: 100,
    callback: () => {
      if (!gameOver && gameStarted) {
        score += 1;
        scoreText.setText("Score: " + score);

        // Augmenter la difficulté
        if (score % 300 === 0 && gameSpeed < 10) {
          gameSpeed += 0.5;
        }
      }
    },
    callbackScope: scene,
    loop: true,
  });
}

function update() {
  if (gameOver || !gameStarted) {
    return;
  }

  // Vérifier si le dino est au sol
  if (dino.body.touching.down || dino.body.blocked.down) {
    isJumping = false;
  }

  // Déplacer les obstacles
  obstacles.children.entries.forEach((obstacle) => {
    obstacle.x -= gameSpeed;

    // Supprimer les obstacles hors écran
    if (obstacle.x < -100) {
      obstacle.destroy();
    }
  });
}

function jump(scene) {
  if (!gameStarted) return;

  // Jouer le son de saut
  scene.sound.play("jump", { volume: 0.5 });

  if (
    !gameOver &&
    !isJumping &&
    (dino.body.touching.down || dino.body.blocked.down)
  ) {
    dino.setVelocityY(-550);
    isJumping = true;
  }
}

function spawnObstacle(scene) {
  if (gameOver) return;

  const type = Phaser.Math.Between(0, 2);
  let obstacle;

  const groundY = 365; // Position verticale du sol invisible

  // Oiseau
  const birdY = Phaser.Math.Between(240, 280);
  obstacle = scene.physics.add.sprite(800, birdY, "bird");
  obstacle.setOrigin(0.5, 0.5);
  obstacle.body.setSize(30, 15);
  obstacle.body.setAllowGravity(false);
  obstacle.body.setImmovable(true);

  // Animation de vol pour l'oiseau
  scene.tweens.add({
    targets: obstacle,
    y: obstacle.y - 10,
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  obstacles.add(obstacle);
}

function hitObstacle(dino, obstacle) {
  if (gameOver) return;

  gameOver = true;
  // Jouer le son de game over
  this.sound.play("game_over", { volume: 0.5 });
  
  // Arrêter la musique de fond
  if (fondMusic) {
    fondMusic.stop();
  }
  
  this.physics.pause();

  // Teinter le dino en rouge
  dino.setTint(0xff0000);

  // Message Game Over
  const gameOverText = this.add
    .text(400, 150, "GAME OVER", {
      fontSize: "64px",
      fill: "#ff0000",
      fontFamily: "Courier New",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  const finalScore = this.add
    .text(400, 220, "Score Final: " + score, {
      fontSize: "32px",
      fill: "#535353",
      fontFamily: "Courier New",
    })
    .setOrigin(0.5);

  const restartText = this.add
    .text(400, 280, "Cliquez pour recommencer", {
      fontSize: "24px",
      fill: "#535353",
      fontFamily: "Courier New",
    })
    .setOrigin(0.5);

  // Animation clignotante
  this.tweens.add({
    targets: restartText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1,
  });

  // Redémarrer le jeu
  this.input.once("pointerdown", () => {
    score = 0;
    gameOver = false;
    gameSpeed = 5;
    isJumping = false;
    gameStarted = false;
    this.scene.restart();
  });
}