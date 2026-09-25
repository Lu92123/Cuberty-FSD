const CLAVE_CARRITO = 'carrito';
const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function leerCarrito() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
    if (!Array.isArray(datos)) {
      throw new TypeError('El contenido guardado para el carrito no es una lista.');
    }

    return datos.filter((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.nombre === 'string' &&
      Number.isFinite(Number(item.precio)) &&
      Number(item.precio) >= 0 &&
      Number.isInteger(Number(item.cantidad)) &&
      Number(item.cantidad) > 0
    ).map((item) => ({
      ...item,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad),
      imagen: typeof item.imagen === 'string' ? item.imagen : '',
      descripcion: typeof item.descripcion === 'string' ? item.descripcion : '',
    }));
  } catch (error) {
    console.error('No se pudo leer el carrito guardado.', error);
    return [];
  }
}

let carrito = leerCarrito();

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (error) {
    console.error('No se pudo guardar el carrito.', error);
    const estado = document.getElementById('estado-compra');
    if (estado) {
      estado.hidden = false;
      estado.textContent = 'No se pudo guardar el carrito en este navegador.';
    }
  }
}

function actualizarIconoCarrito() {
  const icono = document.querySelector('a[href="carrito.html"] img');
  if (!icono) return;

  const hayProductos = carrito.length > 0;
  icono.src = hayProductos
    ? 'cubo/Carrito/Carrito_Full.png'
    : 'cubo/Carrito/Carrito_Empty.png';
  icono.alt = hayProductos ? 'Carrito con productos' : 'Carrito vacío';
}

function renderizarCarrito() {
  const listaCarritoDOM = document.getElementById('lista-carrito');
  const totalDOM = document.getElementById('total');
  const totalFinalDOM = document.getElementById('total-final');
  const carritoVacioDOM = document.getElementById('carrito-vacio');
  const btnVaciar = document.getElementById('btn-vaciar');
  const btnFinalizar = document.getElementById('btn-finalizar-compra');

  if (!listaCarritoDOM) {
    actualizarIconoCarrito();
    return;
  }

  listaCarritoDOM.replaceChildren();

  carrito.forEach((item) => {
    const articulo = document.createElement('article');
    articulo.className = 'cart-item';
    articulo.dataset.productId = item.id;

    const imagen = document.createElement('img');
    imagen.src = item.imagen;
    imagen.alt = item.nombre;

    const info = document.createElement('div');
    info.className = 'cart-item-info';

    const nombre = document.createElement('h2');
    nombre.textContent = item.nombre;

    const descripcion = document.createElement('p');
    descripcion.textContent = item.descripcion;

    const precio = document.createElement('p');
    precio.className = 'cart-item-price';
    precio.textContent = `Precio unitario: ${formatoPrecio.format(item.precio)}`;

    info.append(nombre, descripcion, precio);

    const controles = document.createElement('div');
    controles.className = 'cart-item-controls';

    const etiqueta = document.createElement('label');
    const idCantidad = `cantidad-${item.id}`;
    etiqueta.htmlFor = idCantidad;
    etiqueta.textContent = 'Cantidad';

    const cantidad = document.createElement('input');
    cantidad.id = idCantidad;
    cantidad.className = 'product-quantity';
    cantidad.type = 'number';
    cantidad.min = '1';
    cantidad.step = '1';
    cantidad.value = String(item.cantidad);
    cantidad.inputMode = 'numeric';
    cantidad.addEventListener('change', () => {
      const nuevaCantidad = Number(cantidad.value);
      if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
        cantidad.value = String(item.cantidad);
        return;
      }
      item.cantidad = nuevaCantidad;
      guardarCarrito();
      renderizarCarrito();
    });

    const eliminar = document.createElement('button');
    eliminar.className = 'remove-product';
    eliminar.type = 'button';
    eliminar.textContent = 'Eliminar';
    eliminar.setAttribute('aria-label', `Eliminar ${item.nombre}`);
    eliminar.addEventListener('click', () => {
      carrito = carrito.filter((producto) => producto.id !== item.id);
      guardarCarrito();
      renderizarCarrito();
    });

    controles.append(etiqueta, cantidad, eliminar);
    articulo.append(imagen, info, controles);
    listaCarritoDOM.append(articulo);
  });

  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  if (totalDOM) totalDOM.textContent = formatoPrecio.format(total);
  if (totalFinalDOM) totalFinalDOM.textContent = formatoPrecio.format(total);
  if (carritoVacioDOM) carritoVacioDOM.hidden = carrito.length > 0;
  if (btnVaciar) btnVaciar.disabled = carrito.length === 0;
  if (btnFinalizar) btnFinalizar.disabled = carrito.length === 0;
  actualizarIconoCarrito();
}

document.querySelectorAll('.botonCompras').forEach((boton) => {
  boton.addEventListener('click', () => {
    const { id, nombre, precio, imagen, descripcion } = boton.dataset;
    const precioNumerico = Number(precio);

    if (!id || !nombre || !imagen || !Number.isFinite(precioNumerico) || precioNumerico < 0) {
      console.error('No se pudo agregar el producto: faltan datos válidos en el botón.', boton);
      return;
    }

    const existente = carrito.find((item) => item.id === id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({
        id,
        nombre,
        precio: precioNumerico,
        cantidad: 1,
        imagen,
        descripcion: descripcion || '',
      });
    }

    guardarCarrito();
    actualizarIconoCarrito();
    boton.textContent = 'Agregado al carrito';
    window.setTimeout(() => {
      boton.textContent = ` ${formatoPrecio.format(precioNumerico)}`;
    }, 1200);
  });
});

const btnVaciar = document.getElementById('btn-vaciar');
if (btnVaciar) {
  btnVaciar.addEventListener('click', () => {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
  });
}

const btnFinalizar = document.getElementById('btn-finalizar-compra');
if (btnFinalizar) {
  btnFinalizar.addEventListener('click', () => {
    const estado = document.getElementById('estado-compra');
    if (estado) {
      estado.hidden = false;
      estado.textContent = 'El carrito está listo. La integración del pago todavía no está configurada.';
    }
  });
}

renderizarCarrito();
