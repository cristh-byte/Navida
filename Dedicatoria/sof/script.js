// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    setupStarsCanvas();
    setupSimpsonSilhouette();
    setupPlayer();
    startShootingStars();
});

let canvas, ctx, stars = [];
let animationFrameId;
let canvasWidth, canvasHeight;

function setupStarsCanvas() {
    // Crear elemento canvas
    canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    
    // Estilo del canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-2';
    
    // Reemplazar el contenedor de estrellas con el canvas
    const starsContainer = document.getElementById('stars-container');
    if (starsContainer) {
        starsContainer.parentNode.replaceChild(canvas, starsContainer);
    } else {
        document.body.appendChild(canvas);
    }
    
    // Obtener contexto 2D para dibujar
    ctx = canvas.getContext('2d');
    
    // Configurar tamaño del canvas para que coincida con la ventana
    resizeCanvas();
    
    // Escuchar eventos de cambio de tamaño
    window.addEventListener('resize', function() {
        resizeCanvas();
        createStars(); // Recrear estrellas al cambiar el tamaño
    });
    
    // Crear estrellas y empezar la animación
    createStars();
    animate();
    
    // Crear nebulosas (efectos de fondo)
    createNebulas();
}

// Ajustar el tamaño del canvas al tamaño de la ventana
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    
    // Configurar el tamaño real del canvas (importante para evitar pixelado)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Crear estrellas con propiedades aleatorias - con aspecto más realista
function createStars() {
    stars = []; // Limpiar estrellas existentes
    
    // Densidad reducida para un aspecto más realista
    const starCount = Math.floor(canvasWidth * canvasHeight / 1800 * 2);
    
    // Crear estrellas normales
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        
        // Tamaños más variados - mayoría pequeñas, pocas grandes
        let size;
        const sizeRand = Math.random();
        if (sizeRand < 0.7) {
            // 70% son estrellas pequeñas
            size = Math.random() * 1.0 + 0.3;
        } else if (sizeRand < 0.95) {
            // 25% son estrellas medianas
            size = Math.random() * 1.5 + 1.0;
        } else {
            // 5% son estrellas grandes
            size = Math.random() * 2.0 + 1.5;
        }
        
        // Colores más variados y realistas para las estrellas
        let color;
        const colorRand = Math.random();
        
        if (colorRand < 0.65) {
            // Estrellas blancas/azuladas (más comunes)
            const blue = 220 + Math.floor(Math.random() * 35);
            const green = blue - Math.floor(Math.random() * 20);
            const red = green - Math.floor(Math.random() * 20);
            color = `rgb(${red}, ${green}, ${blue})`;
        } else if (colorRand < 0.85) {
            // Estrellas amarillentas
            const red = 220 + Math.floor(Math.random() * 35);
            const green = red - Math.floor(Math.random() * 20);
            const blue = green - Math.floor(Math.random() * 40);
            color = `rgb(${red}, ${green}, ${blue})`;
        } else if (colorRand < 0.95) {
            // Estrellas rojizas
            const red = 220 + Math.floor(Math.random() * 35);
            const green = 130 + Math.floor(Math.random() * 40);
            const blue = 100 + Math.floor(Math.random() * 30);
            color = `rgb(${red}, ${green}, ${blue})`;
        } else {
            // Algunas muy brillantes (casi blancas)
            color = `rgb(255, 255, 255)`;
        }
        
        // Propiedades para la animación de parpadeo - más sutil
        const minOpacity = 0.3 + Math.random() * 0.3;
        const maxOpacity = minOpacity + Math.random() * 0.4;
        const minScale = 0.85 + Math.random() * 0.1;
        const maxScale = minScale + Math.random() * 0.2;
        
        // Velocidad de parpadeo - variada pero lenta
        const twinkleSpeed = Math.random() * 0.02 + 0.005;
        
        // Offset para que no todas las estrellas parpadeen al mismo tiempo
        const offset = Math.random() * Math.PI * 2;
        
        // Brillo (glow) - proporcional al tamaño
        const glow = size * (Math.random() * 2 + 1);
        
        stars.push({
            x,
            y,
            size,
            color,
            minOpacity,
            maxOpacity,
            minScale,
            maxScale,
            twinkleSpeed,
            offset,
            twinkleValue: offset, // Iniciar en diferentes posiciones del ciclo
            glow,
            isBright: false
        });
    }
    
    // Crear algunas estrellas brillantes - pocas pero destacadas
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = Math.random() * 2 + 2;
        
        // Colores variados para estrellas brillantes
        let color;
        const colorType = Math.random();
        
        if (colorType < 0.5) {
            // Blanco brillante
            color = '#ffffff';
        } else if (colorType < 0.8) {
            // Azul brillante
            color = 'rgb(200, 220, 255)';
        } else {
            // Algunas amarillentas
            color = 'rgb(255, 250, 220)';
        }
        
        stars.push({
            x,
            y,
            size,
            color: color,
            minOpacity: 0.7,
            maxOpacity: 1,
            minScale: 0.9,
            maxScale: 1.2,
            twinkleSpeed: Math.random() * 0.01 + 0.003, // Parpadeo más lento
            offset: Math.random() * Math.PI * 2,
            twinkleValue: Math.random() * Math.PI * 2,
            glow: Math.random() * 6 + 4,
            isBright: true
        });
    }
}

// Crear efecto de nebulosas en el fondo
function createNebulas() {
    const nebulaContainer = document.getElementById('galaxy');
    
    if (!nebulaContainer) return;
    
    // Limpiar cualquier nebulosa existente
    while (nebulaContainer.firstChild) {
        nebulaContainer.removeChild(nebulaContainer.firstChild);
    }
    
    // Crear varias nebulosas con diferentes características
    const nebulaCount = 8;
    
    for (let i = 0; i < nebulaCount; i++) {
        const nebula = document.createElement('div');
        nebula.className = 'nebula';
        nebula.style.position = 'absolute';
        
        // Tamaños variados para las nebulosas
        const width = Math.random() * 400 + 200;
        const height = Math.random() * 300 + 150;
        nebula.style.width = `${width}px`;
        nebula.style.height = `${height}px`;
        
        // Distribuir por toda la pantalla
        nebula.style.top = `${Math.random() * 80}%`;
        nebula.style.left = `${Math.random() * 80}%`;
        
        // Colores variados para las nebulosas
        let r, g, b, opacity;
        const nebulaType = Math.random();
        
        if (nebulaType < 0.4) {
            // Nebulosas azuladas
            r = Math.floor(Math.random() * 60 + 20);
            g = Math.floor(Math.random() * 80 + 40);
            b = Math.floor(Math.random() * 120 + 100);
            opacity = 0.05;
        } else if (nebulaType < 0.7) {
            // Nebulosas rojizas/púrpura
            r = Math.floor(Math.random() * 100 + 80);
            g = Math.floor(Math.random() * 40 + 20);
            b = Math.floor(Math.random() * 100 + 80);
            opacity = 0.04;
        } else {
            // Nebulosas verdosas/turquesa
            r = Math.floor(Math.random() * 40 + 20);
            g = Math.floor(Math.random() * 100 + 60);
            b = Math.floor(Math.random() * 90 + 70);
            opacity = 0.03;
        }
        
        // Gradiente radial para un aspecto realista
        nebula.style.background = `radial-gradient(ellipse at center, 
            rgba(${r}, ${g}, ${b}, 0) 0%, 
            rgba(${r}, ${g}, ${b}, ${opacity}) 50%, 
            rgba(${r}, ${g}, ${b}, ${opacity * 0.8}) 70%, 
            rgba(${r}, ${g}, ${b}, 0) 100%)`;
        
        nebula.style.borderRadius = '50%';
        nebula.style.transform = `rotate(${Math.random() * 360}deg)`;
        nebula.style.opacity = '1';
        nebula.style.filter = 'blur(40px)';
        nebula.style.zIndex = '-1';
        
        nebulaContainer.appendChild(nebula);
    }
}

// Función principal de animación
function animate() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Actualizar y dibujar cada estrella
    stars.forEach(star => {
        // Actualizar valor de parpadeo (función seno para suavidad)
        star.twinkleValue += star.twinkleSpeed;
        
        // Calcular opacidad y escala actuales basadas en la función seno
        const sinValue = Math.sin(star.twinkleValue + star.offset);
        const normalizedSin = (sinValue + 1) / 2; // Convertir de -1,1 a 0,1
        
        const currentOpacity = star.minOpacity + normalizedSin * (star.maxOpacity - star.minOpacity);
        const currentScale = star.minScale + normalizedSin * (star.maxScale - star.minScale);
        
        // Guardar estado actual
        ctx.save();
        
        // Configurar transparencia
        ctx.globalAlpha = currentOpacity;
        
        // Diferentes estilos de dibujo según el tamaño de la estrella
        if (star.size < 1.5) {
            // Estrellas pequeñas - simplemente dibujar un punto
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * currentScale, 0, Math.PI * 2);
            ctx.fill();
            
            // Pequeño resplandor para estrellas pequeñas
            if (Math.random() > 0.8) {
                ctx.globalAlpha = currentOpacity * 0.3;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * currentScale * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Estrellas medianas y grandes - añadir resplandor
            // Dibujar el resplandor (glow)
            const glow = star.isBright ? star.glow * 0.4 : star.glow;
            
            // Gradiente para el resplandor
            const gradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, glow * currentScale
            );
            
            // Diferentes colores para el resplandor según el color de la estrella
            const baseColor = star.color;
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, baseColor.replace('rgb', 'rgba').replace(')', ', 0.3)'));
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, glow * currentScale, 0, Math.PI * 2);
            ctx.fill();
            
            
            // Para estrellas muy brillantes, añadir brillo adicional
            if (star.isBright) {
                // Crear efecto de rayos para algunas estrellas brillantes
                if (Math.random() > 0.7) {
                    ctx.globalAlpha = currentOpacity * 0.4;
                    
                    // Dibujar rayos
                    const numRays = 4;
                    const rayLength = star.size * 5 * currentScale;
                    
                    ctx.strokeStyle = star.color;
                    ctx.lineWidth = 0.5;
                    
                    for (let i = 0; i < numRays; i++) {
                        const angle = (i / numRays) * Math.PI * 2;
                        ctx.beginPath();
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(
                            star.x + Math.cos(angle) * rayLength,
                            star.y + Math.sin(angle) * rayLength
                        );
                        ctx.stroke();
                    }
                }
            }
        }
        
        ctx.restore();
    });
    
    animationFrameId = requestAnimationFrame(animate);
}

// Crear una estrella fugaz
function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    
    // Posición inicial (parte superior de la pantalla)
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight / 3);
    
    shootingStar.style.left = `${startX}px`;
    shootingStar.style.top = `${startY}px`;
    
    // Calcular posición final (en diagonal hacia abajo)
    const angle = 30;
    const distance = Math.random() * 300 + 200;
    const endX = startX + distance * Math.sin(angle * Math.PI / 180);
    const endY = startY + distance * Math.cos(angle * Math.PI / 180);
    
    // Estilo
    shootingStar.style.width = '2px';
    shootingStar.style.height = '2px';
    shootingStar.style.backgroundColor = 'white';
    shootingStar.style.borderRadius = '50%';
    shootingStar.style.boxShadow = '0 0 20px 1px white';
    shootingStar.style.opacity = '0';
    shootingStar.style.zIndex = '1';
    shootingStar.style.position = 'absolute';
    
    document.body.appendChild(shootingStar);
    
    // Animación
    const keyframes = [
        { left: `${startX}px`, top: `${startY}px`, opacity: 0, boxShadow: '0 0 1px 1px white', offset: 0 },
        { opacity: 1, boxShadow: '0 0 2px 1px white, 0 0 40px 7px rgba(255, 255, 255, 0.7)', offset: 0.1 },
        { left: `${endX}px`, top: `${endY}px`, opacity: 0, boxShadow: '0 0 1px 1px white', offset: 1 }
    ];
    
    const timing = {
        duration: Math.random() * 1000 + 1000,
        iterations: 1,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
    };
    
    shootingStar.animate(keyframes, timing);
    
    // Eliminar después de la animación
    setTimeout(() => {
        if (document.body.contains(shootingStar)) {
            document.body.removeChild(shootingStar);
        }
    }, timing.duration);
}

let audioPlayer;
let isPlaying = false;

document.addEventListener("click", function () {
    if (!isPlaying) {
        audioPlayer.play();
        isPlaying = true;
    }
}, { once:true });

// Iniciar las estrellas fugaces
function startShootingStars() {
    // Crear estrellas fugaces aleatorias - menos frecuentes
    setInterval(() => {
        if (Math.random() > 0.7) {
            createShootingStar();
        }
    }, 200);
}

// Configurar la silueta
function setupSimpsonSilhouette() {
    const silhouette = document.querySelector('.simpson-silhouette');
    if (silhouette) {
        silhouette.style.backgroundSize = "contain";
        silhouette.style.backgroundPosition = "center bottom";
        silhouette.style.backgroundRepeat = "no-repeat";
        silhouette.style.backgroundImage = "url(part.png)";
    }
}

// Configurar el reproductor
function setupPlayer() {
    audioPlayer = new Audio('Que Es_El Extraño Mundo De Jack.mp3');
    audioPlayer.loop = true;
}

// MENSAJE NAVIDAD
document.addEventListener("DOMContentLoaded", function () {
    const xmas = document.querySelector(".xmas-message");

    // aparece a los 0 segundos
    setTimeout(() => {
        xmas.classList.add("show-xmas");

        // se va a los 16 segundos
        setTimeout(() => {
            xmas.classList.remove("show-xmas");
        }, 6000);

    }, 50000);
});

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = '❄'; // Puedes usar '•' para nieve circular
    
    // Posición inicial aleatoria
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    // Tamaño aleatorio
    const size = Math.random() * 10 + 10 + 'px';
    snowflake.style.fontSize = size;
    
    // Duración de caída aleatoria (entre 3 y 8 segundos)
    const duration = Math.random() * 5 + 3;
    snowflake.style.animationDuration = duration + 's';
    
    // Opacidad inicial aleatoria
    snowflake.style.opacity = Math.random();

    document.body.appendChild(snowflake);

    // Eliminar el copo después de que termine la animación
    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
}

// Generar un copo cada 200 milisegundos
setInterval(createSnowflake, 200);

