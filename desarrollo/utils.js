window.cancelRequestAnimFrame = (() => {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

window.requestAnimFrame = (() => {
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

//Para convertir el color de Hexadecimal a RGB...
let hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

//Para cargar un archivo JSON...
let getJson = (url, callback) =>
{
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function()
    {
        if (request.status >= 200 && request.status < 400)
        {
            callback(false, JSON.parse(request.responseText));
        }
        else
        {
            callback(true);
        }
    };
    request.onerror = function()
    {
        callback(true);
    };
    request.send();
};

//Para mostrar el juego en pantalla completa...
let fullScreen = () =>
{
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement )
    {
        if (document.documentElement.requestFullscreen)
        {
            document.documentElement.requestFullscreen();
        }
        else if (document.documentElement.msRequestFullscreen)
        {
            document.documentElement.msRequestFullscreen();
        }
        else if (document.documentElement.mozRequestFullScreen)
        {
            document.documentElement.mozRequestFullScreen();
        }
        else if (document.documentElement.webkitRequestFullscreen)
        {
            document.documentElement.webkitRequestFullscreen();
        }
    }
};

let accesoDOM = (param) => document.getElementById(param);
let roundToValue = (num, redondea) => +(Math.round(num + "e+" + redondea)  + "e-" + redondea);
let getTanDeg = (deg) => deg * (180/Math.PI);
let randomColor = () => '#'+'0123456789abcdef'.split('').map(function(v,i,a){
  return i>5 ? null : a[Math.floor(Math.random()*16)] }).join('');
module.exports = {
                    hexToRgb, 
                    getJson, 
                    accesoDOM, 
                    roundToValue, 
                    getTanDeg, 
                    randomColor, 
                    fullScreen
                };