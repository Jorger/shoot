"use strict";
import howler from "./howler.min"; //Para el manejo del sonido...
import utils from "./utils";
let dimensiones     = {ancho : 320, alto : 480},
    ratio           = dimensiones.ancho / dimensiones.alto,
    currentHeight   = window.innerHeight,
    currentWidth    = (currentHeight * ratio) - 50,
    worlds          = [], //Carga los mundos...
    world           = 0, //El número del mundo que se está jugando...
    level           = 0, //El nivel del mundo que está jugando...
    animacion       = 0, //Gurda el valor de la animación del requesAnimationFrame
    estela          = [],
    shoot           = {x: 0, y : 0, shotUp : false, move : 0},
    levelUse        = [], //Guarda el mundo actual...
    playing         = false, //Para saber si ya se está jugando...
    logo            = new Image(),
    score           = 0, //Guardará la puntuación del nivel...
    best            = Number(localStorage.getItem("shoot")) || 0, //Guarda el valor máximo obtenido...
    buttonPlay      = {
                        position : {x : 145, y : 390, r : 35},
                        click    : {x : 0, y: 0}
                    }, //Para el botón que hace la acción de inicia el juego...
    typeExplodes    = 0, //0, normal, 1, explota el personaje, 2, explota el objetivo...
    explosion       = {x : 0, y : 0, radio : 0, cont : 0, color : "", ratio : 0, finish : true}, //Para la explosión del elemento...
    particles       = [], //Para las partículas de la explosión...
    gravity         = 0;

const PI       = Math.PI,
      objetive = {x : 145, y : 135, r : 28},
      canvas   = utils.accesoDOM("canvas"),
      ctx      = canvas.getContext("2d"), 
      explosionObjective = new Howl({urls: ['sound/objective.mp3']}),
      explosionBall = new Howl({urls: ['sound/ball.mp3']});

//Para dimensionar el canvas...
canvas.style.width = (currentWidth) + 'px';
canvas.style.height = (currentHeight) + 'px';
buttonPlay.click.x = (currentWidth * (buttonPlay.position.x - buttonPlay.position.r)) / canvas.width;
buttonPlay.click.y = (currentHeight * (buttonPlay.position.y - buttonPlay.position.r)) / canvas.height;

//Para cargar el archivo de mundos...
utils.getJson('js/worlds.min.json', (err, data) =>
{
    if (!err)
    {
        worlds = data;
        logo.onload = () =>
        {
            startGame();
        };
        logo.src = 'img/iconmin.png';
    }
    else
    {
        alert("Error al cargar el archivo .json");
    }
});

//Función que inicia el juego...
let startGame = () =>
{
    typeExplodes = 0;
    canvas.style.cursor = "pointer";
    shoot.shotUp = playing = false;
    utils.accesoDOM("forkme").style.display = "block";
    world = level = 0;
    canvas.style.background = `repeating-linear-gradient(
                               130deg,
                               #212121,
                               #212121 10px,
                               #424242 10px,
                               #424242 20px)`;

    ctx.clearRect(0, 0, dimensiones.ancho, dimensiones.alto);
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 7;
    ctx.font = "bold oblique 30px Arial";
    ctx.textBaseline = 'alphabetic';
    ctx.scale(1,1);
    ctx.fillStyle = "#FF1744";
    ctx.fillText("SHOTS JS", 70, 120);
    ctx.font = "oblique 18px Arial";
    ctx.fillText("By @ostjh", 100, 145);
    ctx.drawImage(logo, 110, 10, 70, 70);
    //Realizar el botón de play del Juego...
    ctx.fillStyle = "#FF1744";
    ctx.beginPath();
    ctx.arc(buttonPlay.position.x, buttonPlay.position.y, buttonPlay.position.r, 0, PI * 2, true);
    ctx.closePath();
    ctx.fill();
    //Dibujar el Play...
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(buttonPlay.position.x - 10, buttonPlay.position.y + 20);
    ctx.lineTo(buttonPlay.position.x - 10, buttonPlay.position.y - 20);
    ctx.lineTo(buttonPlay.position.x + 20, buttonPlay.position.y);
    ctx.lineTo(buttonPlay.position.x - 10, buttonPlay.position.y + 20);
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white"; //#212121
    ctx.fill();
    ctx.stroke();
    //Fin del Play...
    ctx.fillStyle = "#76FF03";
    ctx.font = "normal 11px Arial";
    ctx.fillText(`Game inspired by "neutrino"`, 80, 450);
    ctx.fillText(`developed by Wil Alvarez (@satanas82)`, 48, 465);
    //Para poner la puntuación...
    ctx.fillStyle = "white";
    ctx.font = "normal 26px Arial";
    ctx.fillText("SCORE", 100, 190);
    ctx.font = "bold 80px Arial";
    ctx.fillText((score <= 9 ? `0${score}` : score), 100, 270);
    ctx.font = "normal 20px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("BEST " + (best <= 9 ? `0${best}` : best), 105, 300);
    //Para el texto del PLAY...
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText("START", 120, 345);
};

//Para dibujar los objetos que giran al rededor del núcleo...
let drawObject = ({radius = 10, x, y, color}) =>
{
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI * 2, true);
    ctx.closePath();
    ctx.fill();
};

//Determinar si hay colisión entre el elemento, el objetivoo los obstáculos...
let collisionBall = () => {
    //Primero saber si ha chocado contra un obstáculo...
    let colisiona = {choca : false, type : 0};
    for(let i = 0; i < levelUse.length; i++)
    {
        //console.log(levelUse[i].position.x, levelUse[i].position.y, shoot.x);
        let collision = {
                            x : (shoot.x - 10 >= levelUse[i].position.x - 10 && shoot.x - 10 <= levelUse[i].position.x + 10) ||
                                (shoot.x + 10 >= levelUse[i].position.x - 10 && shoot.x + 10 <= levelUse[i].position.x + 10),
                            y : (shoot.y - 10 >= levelUse[i].position.y - 10 && shoot.y - 10 <= levelUse[i].position.y + 10) ||
                                (shoot.y + 10 >= levelUse[i].position.y - 10 && shoot.y + 10 <= levelUse[i].position.y + 10)
                        };
        if(collision.x && collision.y)
        {
            //debugger;
            //alert("Colisiona");
            colisiona.choca = true;
            colisiona.type = 1;
            break;
        }
    }
    if(!colisiona.choca)
    {
        //Para saber si colisiona contra el objetivo...
        let collision = {
                            x : (shoot.x - 10 >= objetive.x - 10 && shoot.x - 10 <= objetive.x + 10) ||
                                (shoot.x + 10 >= objetive.x - 10 && shoot.x + 10 <= objetive.x + 10),
                            y : (shoot.y - 10 >= objetive.y - 10 && shoot.y - 10 <= objetive.y + 10) ||
                                (shoot.y + 10 >= objetive.y - 10 && shoot.y + 10 <= objetive.y + 10)
                        };
        if(collision.x && collision.y)
        {
            //debugger;
            //alert("Colisiona");
            colisiona.choca = true;
            colisiona.type = 2;
        }
    }
    return colisiona;
};

//Generar la cola de los elementos que se mueven...
let ballTrail = () =>
{
    //Podría ser en una nueva función...
    let eliminar = [];
    for(let i = 0; i < estela.length; i++)
    {
        ctx.beginPath();
        ctx.rect(estela[i].x, estela[i].y, 5, 5);
        let rgb =  utils.hexToRgb(estela[i].c);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${estela[i].a})`;
        ctx.fill();
        estela[i].a -= estela[i].s;
        if(estela[i].a <= 0)
        {
            eliminar.push(i);
        }
    }
    //Para eliminar...
    for(let i = 0; i < eliminar.length; i++)
    {
        estela.splice(eliminar[i], 1);
    }
};

//Para generar las partículas resultantes de la explosión...
let generatesParticles = () =>
{
    explosion.x = typeExplodes === 1 ? shoot.x : objetive.x;
    explosion.y = typeExplodes === 1 ? shoot.y : objetive.y;
    explosion.radio = typeExplodes === 1 ? 10 : objetive.r;
    explosion.color = typeExplodes === 1 ? worlds[world].ball : worlds[world].objective;
    explosion.ratio = typeExplodes === 1 ? 4 : 1;
    explosion.cont = 0;
    explosion.finish = false;
    //Se generán las particulas "cuadrados", en función del elemento que se destruye...
    const cantidad = 5;
    let base = {
                    x : explosion.x - explosion.radio,
                    y : explosion.y - explosion.radio,
                    r : (explosion.radio * 2) / cantidad
    };

    for(let i = 0; i < cantidad; i++)
    {
        for(let c = 0; c < cantidad; c++)
        {
            //utils.randomColor(),
            particles.push(
                            {
                                x : base.x + (base.r * c),
                                y : base.y + (base.r * i),
                                r : base.r,
                                color : explosion.color,
                                cont : 0,
                                aumenta : (Math.floor(Math.random() * 50) + 1) / 10,
                                direction : {
                                                x : Math.floor(Math.random() * 2) === 0 ? -1 : 1,
                                                y : Math.floor(Math.random() * 2) === 0 ? -1 : 1
                                }
                            }
            );
        }
    }
};

//Para mover las "partículas"...
let particlesExplosion = () =>
{
    if(!explosion.finish)
    {
        let alpha = 1 - ((explosion.cont / explosion.ratio) / 10);
        let radio = explosion.radio + (explosion.radio * ((explosion.cont / 10) * 2));
        let rgb =  utils.hexToRgb(explosion.color);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radio, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        explosion.cont++;
        if(alpha <= 0)
        {
            explosion.finish = true;
            //Si explotó el objetivo, se llama el siguiente escenario...
            if(typeExplodes === 2)
            {
                cargaMundo();
            }
        }
    }
    if(particles.length !== 0)
    {
        let eliminar = [];
        for(let i = 0; i < particles.length; i++)
        {
            let alpha = 1 - ((particles[i].cont / 4) / 10);
            let rgb =  utils.hexToRgb(particles[i].color);
            ctx.beginPath();
            ctx.rect(particles[i].x, particles[i].y, particles[i].r, particles[i].r);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            ctx.fill();
            particles[i].x += (particles[i].aumenta * particles[i].direction.x);
            particles[i].y += (particles[i].aumenta * particles[i].direction.y);
            particles[i].cont++;
            if(alpha <= 0)
            {
                eliminar.push(i);
            }
        }
        for(let i = 0; i < eliminar.length; i++)
        {
            particles.splice(eliminar[i], 1);
        }
    }
    else
    {
        if(typeExplodes === 1)
        {
            cancelRequestAnimFrame(animacion);
            if(score > best)
            {
                best = score;
                localStorage.setItem("shoot", score);
            }
            startGame();
        }
    }
}

//Para renderizar los elementos del Canvas...
let draw = () =>
{
    ctx.clearRect(0, 0, dimensiones.ancho, dimensiones.alto);
    //Para dibujar la puntuación...
    ctx.font = "bold 70px Arial";
    ctx.fillStyle =  "rgba(255, 255, 255, 0.4)";
    ctx.fillText(score <= 9 ? `0${score}` : score, objetive.x - 35, 65);
    //Dibujar las "estalactitas"...
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(0, dimensiones.alto);
    for(let i = 1, base = 10; i <= 15; i++, base += 20)
    {
        ctx.lineTo(base, dimensiones.alto - 25);
        ctx.lineTo(base + 10, dimensiones.alto);
    }
    ctx.strokeStyle = "#212121";
    ctx.fillStyle = "rgba(0, 0, 0, 0.64)"; //#212121
    ctx.stroke();
    ctx.fill();
    //Fin de dibujar las "estalactitas"...
    if(typeExplodes != 2)
    {
        //Dibujar el objetivo...
        ctx.fillStyle = worlds[world].objective;
        ctx.beginPath();
        ctx.arc(objetive.x, objetive.y, objetive.r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        //Para ver el número del mundo...
        ctx.font = "bold 25px Arial";
        ctx.fillStyle =  "white";
        ctx.fillText(world + 1 <= 9 ? `0${world + 1}` : world + 1, objetive.x - 13, objetive.y + 10);
        //Fin de dibujar el objetivo...
        ballTrail(); //Para dibujar el rastro de los obstáculos...
        //Dibujar los obstáculos que existen...
        for(let i = 0; i < levelUse.length; i++)
        {
            let obstacle = levelUse[i];
            let position = {
                                x : objetive.x + obstacle.orbit * Math.cos(obstacle.angle),
                                y : objetive.y + Math.sin(obstacle.angle) * obstacle.orbit
                           };
            drawObject({
                            x : position.x,
                            y : position.y,
                            color : obstacle.color
                      });


            levelUse[i].position.x = position.x;
            levelUse[i].position.y = position.y;
            let anguloEs = utils.roundToValue(utils.getTanDeg(Math.abs(obstacle.angle)) - (360 * obstacle.turn), 2);
            if(anguloEs % 6 === 0)
            {
                estela.push({
                                x : (objetive.x + obstacle.orbit * Math.cos(obstacle.angle)) - 5,
                                y : (objetive.y + Math.sin(obstacle.angle) * obstacle.orbit) - 5,
                                a : 1,
                                s : 1 / obstacle.speed,
                                c : obstacle.color
                });
            }
            if(anguloEs >= 360)
            {
                levelUse[i].turn++;
            }
            levelUse[i].angle += obstacle.move;
        }
    }
    if(typeExplodes != 1)
    {
        //Para dibujar el elemento que se dipara...
        ctx.fillStyle = worlds[world].ball;
        ctx.beginPath();
        ctx.arc(shoot.x, shoot.y, 10, 0, PI * 2, true);
        ctx.closePath();
        ctx.fill();
        //Para realizar el movimiento del elemento disparado...
        let colisiono = false;
        if(!shoot.shotUp && typeExplodes === 0)
        {
            shoot.move++;
            if(shoot.y >= dimensiones.alto - 35)
            {
                colisiono = true;
            }
            else
            {
                //No se ha realizado el disparo, por lo que se deberá caer el elemento...
                shoot.y += gravity;
            }
        }
        else
        {
            //Se realiza el dipsaro...
            if(typeExplodes === 0)
            {
                shoot.y -= 15;
            }
            else
            {
                //Para ubicarlo en su posición original...
                shoot.y += 15;
            }
        }
        if(typeExplodes === 0 && !colisiono)
        {
            let colisiona = collisionBall();
            if(colisiona.choca)
            {
                //Choca contra un onstáculo...
                if(colisiona.type === 1)
                {
                    colisiono = true;
                }
                else
                {
                    //Colisionó contra el objetivo, por lo que se debe crear la aimación de la explosión...
                    explosionObjective.play();
                    typeExplodes = 2;
                    generatesParticles();
                    //Fin de la creación de la explosión...
                    //Si realiza un disparo rápido, podría tener mayor puntuación...
                    if(shoot.move / 60 <= 0.5)
                    {
                        score += 2;
                    }
                    else
                    {
                        //Normal...
                        score++;
                    }
                    //Se debe llevar a la parte cuando finaliza la animación de explosión...
                    if(level + 1 < worlds[world].levels)
                    {
                        level++;
                    }
                    else
                    {
                        if(world + 1 < worlds.length)
                        {
                            world++;
                        }
                        else
                        {
                            world = 0;
                        }
                        level = 0;
                    }
                }
            }
        }
        if(colisiono)
        {
            //Crear la explosion del peronaje...
            explosionBall.play();
            typeExplodes = 1;
            generatesParticles();
            if ("vibrate" in navigator)
            {
                navigator.vibrate(200);
            }            
        }
    }
    //Llamaría a la función de partículas...
    animacion = requestAnimationFrame(draw);
    particlesExplosion();
};

//Para determinar si un elemento está en la misma posición que otro en la misma órbita...
let mismaPosicionOrbita = (orbita, location) =>
{
    let diferenteOrbita = true;
    for(let i = 0; i < levelUse.length; i++)
    {
        if(levelUse[i].orbit === orbita)
        {
            let angle = (location.numerator * PI / location.denominator) * location.quadrant;
            let validaPosicion = location.numerator === 1 && location.denominator === 2 ?
                                 angle === levelUse[i].angle :
                                 Math.abs(angle) === Math.abs(levelUse[i].angle);
            if(validaPosicion)
            {
                diferenteOrbita = false;
                break;
            }
        }
    }
    return diferenteOrbita;
};

//Para obtener la ubicación de un elemento...
let cargaMundo = () =>
{
    //Para establecer el color de fondo...
    typeExplodes = 0; //El estado de la explosión...
    estela = []; //Para guardar al estela que deja...
    canvas.style.background = `repeating-linear-gradient(
                               130deg,
                               ${worlds[world].pattern.one},
                               ${worlds[world].pattern.one} 10px,
                               ${worlds[world].pattern.two} 10px,
                               ${worlds[world].pattern.two} 20px)`;
    gravity = 0.5 / (worlds.length - world);
    levelUse = [];
    for(let i = 0; i < world + 1; i++)
    {
        //Primero obtener las órbita del elemento...
        do
        {
            //Para indicar si el elemento creado es válido, y se debe asociar...
            let elementoValido = false;
            let aleatorios = {
                                orbit : 50 + (30 * Math.floor(Math.random() * (worlds[world].maxorbita))),
                                numerator : Math.floor(Math.random() * 2),
                                denominator : Math.floor(Math.random() * 2) + 1,
                                quadrant : Math.floor(Math.random() * 2)
                            };
            let elemento = {
                            orbit       : aleatorios.orbit,
                            direction   : 0,
                            speed       : 0,
                            angle       : 0,
                            move        : 0,
                            turn        : 0,
                            position    : {x : 0, y : 0},
                            color       : utils.randomColor(),
                            location    : {
                                                numerator    : aleatorios.numerator,
                                                denominator  : aleatorios.denominator,
                                                quadrant     : aleatorios.quadrant === 0 ? -1 : 1
                                          }
                            };
            //Buscar si existe ya esa órbita...
            let mismaOrbita = false;
            for(let c = 0; c < levelUse.length; c++)
            {
                if(levelUse[c].orbit === elemento.orbit)
                {
                    //Se debe buscar que el elemento no esté en la misma posición...
                    elemento.direction = levelUse[c].direction;
                    elemento.speed = levelUse[c].speed;
                    elementoValido = mismaPosicionOrbita(elemento.orbit, elemento.location);
                    mismaOrbita = true;
                    break;
                }
            }
            if(!mismaOrbita)
            {
                //No está en la misma órbita,
                //por lo que se debe hallar la velocidad y la dirección...
                elemento.direction = Math.floor(Math.random() * 2) === 0 ? -1 : 1
                elemento.speed = worlds[world].velocity[Math.floor(Math.random() * worlds[world].velocity.length)];
                elementoValido = true;
            }
            if(elementoValido)
            {
                elemento.angle = (elemento.location.numerator * PI / elemento.location.denominator) * elemento.location.quadrant;
                elemento.move = (PI / elemento.speed) * elemento.direction;
                levelUse.push(elemento);
                break;
            }
        }while(1);
    }
    //Para establecer la posición de la bala que se dispara...
    shoot.x = canvas.width / 2;
    shoot.y = dimensiones.alto - 120;
    shoot.move = 0; //Para controlar si el usuario ha disparado rápido...
    shoot.shotUp = false; //Para indicar que el elemento no se ha disparado...
};

//Detectar los eventos touch y del mouse en el canvas...
let eventoCanvas = (e) =>
{
    utils.fullScreen();
    if(!shoot.shotUp)
    {
        e.stopPropagation();
        e.preventDefault();
        let evento = e;
        if(e.type === "touchstart")
        {
            evento = e.touches[0] || e.changedTouches[0];
        }
        const x = Math.floor(evento.pageX) - canvas.offsetLeft;
        const y = Math.floor(evento.pageY) - canvas.offsetTop;
        if(e.type === "mousedown" || e.type === "touchstart")
        {

            if(playing)
            {
                shoot.shotUp = true;
            }
            else
            {
                //Daber si se ha presionado el Play...
                let presionaPlay = (x >= buttonPlay.click.x && x <= buttonPlay.click.x + 100) &&
                                   (y >= buttonPlay.click.y && y <= buttonPlay.click.y + 100);
                if(presionaPlay)
                {
                    utils.accesoDOM("forkme").style.display = "none";
                    canvas.style.cursor = "auto";
                    playing = true;
                    score = 0;
                    cargaMundo();
                    draw();
                }
            }

        }
    }
};

//Para los eventos de Mouse y Touch..
let addListenerMulti = (el, fn, ...evts) =>
{
    for(let i = 0; i < evts.length; i++)
    {
        el.addEventListener(evts[i], fn, false);
    }
};

addListenerMulti(canvas, eventoCanvas, 'mousedown', 'touchstart');
//Para bloquear el click derecho del mouse...
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    shoot.shotUp = true;
}, false);

//Para escalar el canvas...
window.onresize = (event) =>
{
    currentHeight = window.innerHeight;
    currentWidth  = (currentHeight * ratio) - 50;
    canvas.style.width = (currentWidth) + 'px';
    canvas.style.height = (currentHeight) + 'px';
    //Para la coordenadas del botón
    buttonPlay.click.x = (currentWidth * (buttonPlay.position.x - buttonPlay.position.r)) / canvas.width;
    buttonPlay.click.y = (currentHeight * (buttonPlay.position.y - buttonPlay.position.r)) / canvas.height;
};
//Créditos...
console.log('%c Desarrollado por Jorge Rubiano - @ostjh', 'background: blue; color: white; font-size: x-large');
console.log('%c https://twitter.com/ostjh', 'background: green; color: white; font-size: x-large');
console.log('%c http://jorger.github.io/page/es/', 'background: red; color: white; font-size: x-large');
