const frames = [
  "cubo/3D/1.png",
  "cubo/3D/2.png",
  "cubo/3D/3.png",
  "cubo/3D/4.png",
  "cubo/3D/5.png",
];

const preloaderImg = document.getElementById("preloader-img");
const content = document.getElementById("content");
const preloader = document.getElementById("preloader");

if (!preloaderImg || !content || !preloader) {
  // Si no se encuentran los elementos, asegurar que el contenido quede visible
  if (content) content.style.visibility = "visible";
  console.warn("Elementos del preloader no encontrados. Mostrando contenido directamente.");
} else {
  // Crear la secuencia: 1..6 + 6..1
  const sequence = frames.reverse();
  let index = 0;
  const intervalMs = 200; // velocidad entre frames en ms

  // Pre-cargar todas las imágenes de la secuencia para evitar parpadeos
  let loadedCount = 0;
  const imgs = [];
  sequence.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedCount++;
      // Si todas cargaron, iniciar la animación
      if (loadedCount === sequence.length) {
        startAnimation();
      }
    };
    img.onerror = () => {
      // Si falla una carga, igual continuar cuando haya pasado un tiempo prudente
      loadedCount++;
      if (loadedCount === sequence.length) startAnimation();
    };
    imgs.push(img);
  });

  // Fallback: si no cargaron en 2s, iniciar la animación de todos modos
  setTimeout(() => {
    if (loadedCount < sequence.length) startAnimation();
  }, 2000);

  function startAnimation() {
    const timer = setInterval(() => {
      preloaderImg.src = sequence[index];
      index++;
      if (index >= sequence.length) {
        clearInterval(timer);
        // Desvanecer el preloader y mostrar el contenido
        preloader.style.transition = "opacity 400ms ease";
        preloader.style.opacity = "0";
        setTimeout(() => {
          // Remover el preloader del DOM para que no bloquee interacción
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
          content.style.visibility = "visible";
        }, 450);
      }
    }, intervalMs);
  }
}