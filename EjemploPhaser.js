//const Phaser = require('//cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.js')
var script = document.createElement("script");  // create a script DOM node
script.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js";  // set its src to the provided URL
   
document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
  function getSprite(personajeArg){
             console.log("EN GETSPRITE "+ personajeArg)

     //TODO: Dejar mas bonito cuando vea que funciona
     if (personajeArg == "ppWoODcMniqd3xLSOGbq")
        return "/gatoRey.png"

     return "/dude.png"
  }

var personaje = "ayuda"

/*Cambiar nombre Example*/
    class Example extends Phaser.Scene{

        preload (){
            //Saber como acceder a directorio assets- Ver doc notas
            const directAssets = "/assets/ejemploPhaser"

            //Cargar recursos
            this.load.image('sky', directAssets + '/sky.png');
            this.load.image('ground', directAssets + '/platform.png');
            this.load.image('star', directAssets + '/star.png');
            this.load.image('bomb', directAssets + '/bomb.png');

           let person =  getSprite(personaje)
           console.log("tras getSprite"+person)

            //Fotogramas sprite jugador (se usaran para animacion)
            this.load.spritesheet('dude', 
            directAssets +person,//'/dude.png',
                { frameWidth: 45, frameHeight: 38 }
            );
        }

        create (){
            //Mostramos imagen (cielo)
            this.add.image(400, 300, 'sky');

            //Creamos grupo de plataformas (elem estaticos) con fisica
            this.platforms = this.physics.add.staticGroup();

            //Creamos el suelo, escalado * 2 para que ocupe todo el ancho
            this.platforms.create(400,568, 'ground').setScale(2).refreshBody();

            //Creamos varias plataformas
            this.platforms.create(600, 400, 'ground');
            this.platforms.create(50, 250, 'ground');
            this.platforms.create(750, 220, 'ground');

            //Creamos sprite jugador
            this.player = this.physics.add.sprite(100, 450, 'dude')
            this.player.setBounce(0.2);  //Al aterrizar tras saltar
            this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
            this.player.body.setGravityY(300)

            //Creamos las animaciones del jugador:
            this.anims.create({
                key: 'left',    //Al ir a la izquierda
                frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),  //Usa fotogramas 0-3
                frameRate: 10,  //Velocidad en fotogramas/segundo
                repeat: -1  //La animacion debe volver a empezar cuando termine
            });

            this.anims.create({
                key: 'turn',    //Al girar
                frames: [ { key: 'dude', frame: 4 } ],
                frameRate: 20
            });

            this.anims.create({
                key: 'right',   //Al ir a la derecha
                frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });            
            
            //Añadimos colliders para ver si hay colision/superposicion entre jugador y suelo
            //Asi no atraviesa el suelo
            this.physics.add.collider(this.player, this.platforms);

            //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
            this.cursors = this.input.keyboard.createCursorKeys();

            //Añadimos que se pueda con wasd tambien
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

            //Creamos estrellas a recoger
            this.stars = this.physics.add.group({
                key: 'star',    //Clave de textura
                repeat: 11,     //Al repetir 11 veces, obtenemos 12 elementos
                setXY: { x: 12, y: 0, stepX: 70 }   //Establecer posicion de los 12 elementos
            });

            this.stars.children.iterate(function (child) {
                //Para que reboten un numero aleatorio entre lo dados
                child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            });

            //Collider para que no se caigan del mundo
            this.physics.add.collider(this.stars, this.platforms);

            //Comprobar si el personaje se superpone con alguna (las recoge)
            //Entonces, ejecuta la funcion collectStar (presente mas abajo)
            this.physics.add.overlap(this.player, this.stars, collectStar, null, this);

            //Añadimos puntuacion
            this.score = 0;
            this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        
            //Añadimos enemigos (bombas)
            this.bombs = this.physics.add.group();
            this.physics.add.collider(this.bombs, this.platforms);
            this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);
        

            //Creamos boton de pausa
            this.botonPausa = this.add.text(720, 10, 'PAUSA', { fill: '#000' })
            .setInteractive({ useHandCursor: true })             // UseHandCursor hace que se vea la manita tipica de links y demas
            .on('pointerdown', () => this.pulsarBotonPausa() )   // Al pulsar boton, se llama funcion (definida fuera de create)
            .on('pointerover', () => this.hoverBotonPausa() )    // Al hover sobre boton
            .on('pointerout', () => this.restBotonPausa() )      // Al sacar el raton de encima del boton
            .on('pointerup', () => this.hoverBotonPausa() )      // Al dejar de pulsar boton (al soltar)
        } 

        update (){   
            //Comprueba si esta pulsando la tecla izquierda
            if (this.cursors.left.isDown || this.keyA.isDown){
                //Entonces aplica velocidad horizontal negativa
                this.player.setVelocityX(-160);

                //Ejecuta la animacion de moverse a la izquierda
                this.player.anims.play('left', true);
                //console.log("IZQUIERDA")
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown || this.keyD.isDown){
                this.player.setVelocityX(160);

                this.player.anims.play('right', true);
            }

            //Si no esta pulsando nada
            else{
                this.player.setVelocityX(0);

                this.player.anims.play('turn');
            }

            //Para saltar. Solo puede si esta tocando el suelo
            if ( (this.cursors.up.isDown || this.keyW.isDown ) && this.player.body.touching.down){
                this.player.setVelocityY(-430);
            }        
        }

        //Funciones para boton, segun la interaccion con el usuario (si hover, pulsa, ...)
        pulsarBotonPausa(){
            //console.log("Boton pausa pulsado");
            this.botonPausa.setStyle({ fill: '#BF2707'});
            this.game.isPaused = !this.game.isPaused    //Cambio entre pausado y no pausado

        }

        hoverBotonPausa(){
            //console.log("Hover sobre boton pausa")
            this.botonPausa.setStyle({ fill: '#ff0'});

        }

        restBotonPausa(){
            //console.log("Boton pausa libreee")
            this.botonPausa.setStyle({ fill: '#000'});
        }


        fGameOver(){
            this.gameOver = true;
            //Tras game over: Se emite evento game over
            let gameOverEvento = new CustomEvent("gameOverJuego", {
                detail: {puntuacion: this.score}
            })
            document.dispatchEvent(gameOverEvento)

            //Esta opcion refresca la pagina entera. Tambien sirve, pero lo otro es mejor
            //location.reload();    
            
            //Reiniciamos tras muerte
            this.gameRestart()
        }

        gameRestart(){
            this.scene.restart();
            //console.log(this.gameOver);
            this.gameOver = false

            //Emitimos evento de que se crea una nueva partida para avisar
            let nuevaPartidaEvento = new CustomEvent("nuevaPartidaJuego")
            document.dispatchEvent(nuevaPartidaEvento)
        }
    }

    //Cuando se recoge una estrella, se desactiva y desaparece (se elimina de la pantalla)
    function collectStar (player, star){
        star.disableBody(true, true);

        //Aumentamos puntuacion
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        //Emitimos evento de cambio de puntuacion
        let cambioPuntuacionEvento = new CustomEvent("cambioPuntuacionJuego", {
            detail: {puntuacion: this.score}
        })
        document.dispatchEvent(cambioPuntuacionEvento)
        //*/
        //cambioPuntuacionListener(this.score)

        //Al recoger todas las estrellas
        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                //Se reactivan las estrellas para seguir jugando
                child.enableBody(true, child.x, 0, true, true);
            });

            //Spawn bomba (en lado opuesto del jugador, para darle una oportunidad)
            var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
       
    }

    function hitBomb (player, bomb){
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        //Cuando le da una bomba, ocurre game over
        this.fGameOver();
    };



    const config = {
        /*Cambiar configuracion si fuera necesario */
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        /*Cambiar nombre Example */
        scene: Example,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        parent: "phaser",

    };
    
    export default function createGame(personajeArg) {
        let game =  new Phaser.Game(config);
        console.log("IMPORTANTE: PERSONAJE", personajeArg)
       personaje = personajeArg

        let inicializacionPhaserEvento = new CustomEvent("inicializacionPhaserJuego", {
            detail: {juego: game}
        })
        document.dispatchEvent(inicializacionPhaserEvento)
        return game
    }


    
