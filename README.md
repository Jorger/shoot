# Shoot

Inspirado en juego [Neutrino], desarrollado por [Wil Alvarez], este juego tiene como objetivo enseñar [Canvas] , 
API proporcionada por la actual versión de HTML5, por ser nativa es posible su funcionamiento en cualquier navegador, 
tanto móvil como de escritorio.

**Shoot** ha sido desarrollado haciendo uso de la última versión de Javascript conocida como [ES6/ES2015], 
aplicando algunas de sus funcionalidades como son:

* Uso de nuevas formas de declarar variables: 
  * ``let`` 
  * ``const``
* [Funciones Arrow]
* [Template Literals]
* [Módulos]
* Entre otras.

Es posible ver un listado de las nuevas funcionalidades que nos trae ES6, en el repositorio denominado 
[ECMAScript 6 equivalents in ES5] realizado por [Addy Osmani]

### Demo

![SHOOT](https://dl.dropboxusercontent.com/u/181689/imgshoot/shoot.gif)

Es posible acceder al juego a través de la dirección: https://jorger.github.io/shoot/

Para dispositivos móviles es posible escanear el siguiente código QR.

![QR](https://dl.dropboxusercontent.com/u/181689/imgshoot/qr.png)

En dispositivos móviles basados en Android con navegador Google Chrome, es posible agregar la aplicación a la [pantalla principal], 
esn este caso se hará uso de [manifest.json] para controlar la orientación del dispositivo.

### Funcionalidades.

El objetivo del juego es destruir un elemento que está rodeado por una serie de obstáculos que giran alrededor de él, 
una descripción del juego escrita por el desarrollador del mismo puede ser vista en la [página] del juego.

Los obstáculos son ubicados de forma aleatoria en diferentes órbitas del objeto principal, 
la diferencia entre cada órbita es de 45º 

![DOTS](https://dl.dropboxusercontent.com/u/181689/imgshoot/circle.gif)

Esto con el fin de garantizar que exista una posibilidad de acertar en el objetivo, la cantidad máxima de elementos por órbita es de 4.

### Stack

Debido a que todos los navegadores aún no soportan algunas de las nuevas funcionalidades de ES6, se hace necesario realizar una "traducción" 
de éste a la versión estable como es ES5, para tal fin se ha hecho uso de [BabelJS] además de [Browserify] para el manejo de módulos.

Además de otras librerías que se encuentran específicadas en el archivo **package.json**

Para la instación de estas se debe hacer uso del comando:

```
npm install
```

Para realizar la conversión/empaquetamiento, se deberá ejecutar el comando:

```
npm run watch
```

El cual a su vez ejecuta el comando:

```
watchify desarrollo/main.js -o js/build.js -t [ babelify --presets [ es2015 ] ]
```

Para realizar la compresión de los archivos (js/css), se hace uso de los paquetes **uglifyjs** y **clean-css**.

A través del comando:

```
npm run start
```

### Service Worker

Otras de las características asociadas al juego, ha sido la posibilidad de ser jugado offline, para lo cual se ha hecho uso de 
[Service Worker], se ha tomado como ejemplo la aplicación [airhorn].


### Otras fuentes.

Para la realización del presente actividad se han consultado varias fuentes, tanto vídeos como Blogs/artículos.

* [Javascript ES6 Cheatsheet #2 - the best of JS ES6]
* [Essential ES6 / ES2015 JavaScript]
* [ES6 In Depth: Arrow functions]
* [ARROW FUNCTIONS AND THEIR SCOPE]
* [Learn ES2015]
* [Getting started with Progressive Web Apps]


### Autor
Jorge Rubaino [@ostjh]
License
----
MIT
[@ostjh]:https://twitter.com/ostjh
[Neutrino]:http://satanas.io/games/neutrino/
[Wil Alvarez]:http://satanas.io/
[página]:http://satanas.io/games/neutrino/
[ES6/ES2015]:http://www.ecma-international.org/ecma-262/6.0/index.html
[Funciones Arrow]:https://googlechrome.github.io/samples/arrows-es6/
[Template Literals]:https://developers.google.com/web/updates/2015/01/ES6-Template-Strings
[Módulos]:https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Sentencias/import
[ECMAScript 6 equivalents in ES5]:https://github.com/addyosmani/es6-equivalents-in-es5#default-parameters
[Addy Osmani]:https://github.com/addyosmani
[BabelJS]:https://babeljs.io/
[Browserify]:http://browserify.org/
[howler]:https://github.com/goldfire/howler.js
[Service Worker]:http://www.html5rocks.com/en/tutorials/service-worker/introduction/?redirect_from_locale=es
[airhorn]:https://github.com/GoogleChrome/airhorn
[pantalla principal]:https://developer.chrome.com/multidevice/images/home_add.png
[manifest.json]:https://developers.google.com/web/updates/2014/11/Support-for-installable-web-apps-with-webapp-manifest-in-chrome-38-for-Android
[Canvas]:https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[Javascript ES6 Cheatsheet #2 - the best of JS ES6]: https://www.youtube.com/watch?v=LmL0Gh193M0
[Essential ES6 / ES2015 JavaScript]:https://www.youtube.com/watch?v=CozSF5abcTA
[ES6 In Depth: Arrow functions]: https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/
[ARROW FUNCTIONS AND THEIR SCOPE]:http://jsrocks.org/2014/10/arrow-functions-and-their-scope/
[Learn ES2015]:https://babeljs.io/docs/learn-es2015/
[Getting started with Progressive Web Apps]:https://addyosmani.com/blog/getting-started-with-progressive-web-apps/


