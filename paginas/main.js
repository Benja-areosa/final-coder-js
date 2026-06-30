let productosStock = [];
// Recuperamos el carrito si venimos de otra página, sino arranca vacío
let carrito = JSON.parse(localStorage.getItem("carritoPapilo")) || [];

// Capturamos los posibles contenedores
const contenedorPaletas = document.querySelector("#contenedor-paletas");
const contenedorAccesorios = document.querySelector("#contenedor-accesorios");
const contenedorZapatillas = document.querySelector("#contenedor-zapatillas");

const contenedorCarrito = document.querySelector("#items-carrito");
const contadorCarrito = document.querySelector("#contador-carrito");
const totalCarrito = document.querySelector("#total-carrito");
const btnComprar = document.querySelector("#btn-comprar");

// 1. OBTENEMOS EL INVENTARIO (Fetch Inteligente)
const cargarProductos = async () => {
    try {
        // Magia: Detecta si la URL actual tiene la palabra "paginas"
        // Si la tiene, busca el json ahí nomás. Si no (estamos en index), entra a la carpeta.
        const rutaJSON = window.location.pathname.includes('paginas') ? 'data.json' : 'paginas/data.json';
        
        const respuesta = await fetch(rutaJSON);
        productosStock = await respuesta.json();
        filtrarYRenderizarVistas();
    } catch (error) {
        console.error("Error al cargar JSON", error);
    }
};

// 2. DETECTAMOS LA PÁGINA ACTUAL Y DIBUJAMOS LO QUE CORRESPONDE
const filtrarYRenderizarVistas = () => {
    if (contenedorPaletas) {
        const paletas = productosStock.filter(prod => prod.categoria === "paletas");
        crearTarjetas(paletas, contenedorPaletas);
    }
    if (contenedorAccesorios) {
        const accesorios = productosStock.filter(prod => prod.categoria === "accesorios");
        crearTarjetas(accesorios, contenedorAccesorios);
    }
    if (contenedorZapatillas) {
        const zapatillas = productosStock.filter(prod => prod.categoria === "zapatillas");
        crearTarjetas(zapatillas, contenedorZapatillas);
    }
};

// 3. FUNCIÓN PARA DIBUJAR TARJETAS
const crearTarjetas = (arrayProductos, contenedorHTML) => {
    contenedorHTML.innerHTML = ""; 
    arrayProductos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "col-12 col-md-6 col-lg-4";
        tarjeta.innerHTML = `
            <div class="card producto-card h-100 text-light p-3">
                <img src="${producto.imagen}" class="card-img-top rounded" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold text-success">${producto.nombre}</h5>
                    <p class="card-text small text-secondary flex-grow-1">${producto.descripcion}</p>
                    <h4 class="fw-bold mb-3">$${producto.precio.toLocaleString('es-AR')}</h4>
                    <button class="btn btn-agregar w-100 fw-bold mt-auto" data-id="${producto.id}">
                        AGREGAR AL CARRITO
                    </button>
                </div>
            </div>
        `;
        contenedorHTML.appendChild(tarjeta);
    });

    asignarEventosAgregar();
};

// 4. LÓGICA DE AGREGAR AL CARRITO
const asignarEventosAgregar = () => {
    const botonesAgregar = document.querySelectorAll(".btn-agregar");
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = parseInt(e.target.getAttribute("data-id"));
            const productoElegido = productosStock.find(prod => prod.id === idProducto);
            const existe = carrito.some(prod => prod.id === idProducto);
            
            if (existe) {
                const prodRef = carrito.find(prod => prod.id === idProducto);
                prodRef.cantidad++;
            } else {
                carrito.push({ ...productoElegido, cantidad: 1 });
            }

            actualizarCarrito();

            Toastify({
                text: `¡${productoElegido.nombre} agregado!`,
                duration: 2000,
                gravity: "bottom",
                position: "right",
                style: { background: "#198754", color: "#fff" }
            }).showToast();
        });
    });
};

// 5. ACTUALIZAR PANEL DEL CARRITO Y GUARDAR EN LOCALSTORAGE
const actualizarCarrito = () => {
    // Si no estamos en una página con carrito (ej. un error 404), cortamos acá
    if (!contenedorCarrito) return; 

    contenedorCarrito.innerHTML = "";
    
    // GUARDAMOS EN LOCALSTORAGE (Para que viaje entre páginas)
    localStorage.setItem("carritoPapilo", JSON.stringify(carrito));

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `<p class="text-center text-secondary mt-4">Carrito vacío.</p>`;
        contadorCarrito.innerText = "0";
        totalCarrito.innerText = "$0";
        return;
    }

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(prod => {
        const div = document.createElement("div");
        div.className = "d-flex align-items-center mb-3 bg-black p-2 rounded border border-secondary";
        div.innerHTML = `
            <img src="${prod.imagen}" class="item-carrito-img bg-white me-3" alt="${prod.nombre}">
            <div class="flex-grow-1">
                <h6 class="mb-0 text-success fw-bold" style="font-size: 0.8rem;">${prod.nombre}</h6>
                <small class="text-secondary">Cant: ${prod.cantidad}</small>
                <div class="fw-bold">$${(prod.precio * prod.cantidad).toLocaleString('es-AR')}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger ms-2 btn-eliminar" data-id="${prod.id}"><i class="bi bi-trash"></i></button>
        `;
        contenedorCarrito.appendChild(div);

        total += (prod.precio * prod.cantidad);
        cantidadTotal += prod.cantidad;
    });

    contadorCarrito.innerText = cantidadTotal;
    totalCarrito.innerText = `$${total.toLocaleString('es-AR')}`;

    // Eventos para eliminar ítems
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            carrito = carrito.filter(prod => prod.id !== id);
            actualizarCarrito();
        });
    });
};

// 6. SIMULAR COMPRA FINAL CON ALERTAS
if (btnComprar) {
    btnComprar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Carrito vacío',
                text: 'Agregá algún producto antes de ir a la cancha.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#198754'
            });
            return;
        }
        
        Swal.fire({
            title: '¡Compra Confirmada!',
            text: 'Te enviamos los detalles al correo.',
            icon: 'success',
            confirmButtonColor: '#198754',
            background: '#1a1a1a',
            color: '#fff'
        }).then(() => {
            carrito = [];
            actualizarCarrito();
            const carritoOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('carritoOffcanvas'));
            if (carritoOffcanvas) {
                carritoOffcanvas.hide();
            }
        });
    });
}

// ==========================================
// ESTAS DOS LÍNEAS SON EL MOTOR, ¡NO SE BORRAN!
// ==========================================
cargarProductos();
actualizarCarrito();