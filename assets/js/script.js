const config = {
  type: Phaser.AUTO,
  //plateau de 800x600 pixels
  width: 800,
  height: 600,
  backgroundColor: "#22222267",
  scene: {
    preload: preload, //pour charger ou créer les ressources.
    create: create, //pour initialiser et afficher les éléments.
    update: update, //pour la boucle de jeu. pour mettre à jour la logique du jeu
  },
};

const game = new Phaser.Game(config);

let boardContainer; //servira à stocker le conteneur qui regroupe le plateau + le joueur.
let cursors; //contiendra les touches fléchées (pour contrôler avec le clavier).
const speed = 300; // vitesse de déplacement du plateau (300 pixels par seconde)
let point; // pour le point

function preload() {
  // crée un objet de dessin “virtuel”
  const g = this.add.graphics();

  // personage
  g.fillStyle(0xF2C05A, 1);
  g.fillRect(0, 0, 30, 30); //dessine un carré 40×40 pixels à la position (0, 0)
  g.generateTexture("player", 30, 30); // crée une texture à partir du dessin

  g.destroy(); // détruit l’objet graphique (plus besoin de l’afficher)
}

function create() {
  // carré joueur centré sur l’écran
  player = this.add
    .image(config.width / 2, config.height / 2, "player")
    .setOrigin(0.5);
  /*.setOrigin(0.5)
Définit le point d’origine de l’image au centre plutôt qu’au coin supérieur gauche.*/

  cursors = this.input.keyboard.createCursorKeys();
  /*Crée un objet cursors contenant les touches fléchées du clavier :
cursors.left → flèche gauche
cursors.right → flèche droite
cursors.up → flèche haut
cursors.down → flèche bas*/

  // texte d'aide
  const style = { font: "14px Arial", fill: "#fff" };
  this.add.text(10, 10, "Déplacer le carré rouge : flèches", style);

  createRandomPoint.call(this); // Crée un point aléatoire au début du jeu
}

function update(time, delta) {
  //delta = temps écoulé depuis la dernière frame, en millisecondes.
  //On le convertit en secondes (dt) pour calculer un déplacement indépendant du FPS
  const dt = delta / 1000;

  // déplacer le carré rouge selon les touches appuyées
  if (cursors.left.isDown) player.x -= speed * dt; //Vérifie si chaque touche fléchée est maintenue enfoncée (isDown).
  if (cursors.right.isDown) player.x += speed * dt;
  if (cursors.up.isDown) player.y -= speed * dt;
  if (cursors.down.isDown) player.y += speed * dt;
  //speed * dt → déplacement proportionnel au temps, ce qui rend le mouvement fluide, même si le FPS change.

  // limiter le carré rouge aux bords de l'écran
  player.x = Phaser.Math.Clamp(player.x, 20, config.width - 20);
  player.y = Phaser.Math.Clamp(player.y, 20, config.height - 20);
  /*Phaser.Math.Clamp(value, min, max) limite une valeur entre un minimum et un maximum.
Ici :
player.x ne peut pas aller en dehors de l’écran horizontalement (20 à config.width - 20).
player.y ne peut pas aller en dehors de l’écran verticalement (20 à config.height - 20).
La valeur 20 correspond à la moitié du carré (40px / 2) pour que le joueur ne dépasse pas visuellement l’écran.*/

  // Vérifier si le joueur touche le point
if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), point.getBounds())) {
    point.destroy(); // Détruire le point
    createRandomPoint.call(this); // Créer un nouveau point aléatoire
  }
}

// Fonction pour créer un point aléatoire
function createRandomPoint() {
  const x = Phaser.Math.Between(20, config.width - 20);
  const y = Phaser.Math.Between(20, config.height - 20);
  point = this.add.rectangle(x, y, 20, 20, 0xff0000); // Créer un rectangle rouge comme point
}
