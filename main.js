// Arrays principales
let productosStock = [];
let carrito = [];

// Elementos del DOM
const contenedorPaletas = document.querySelector("#contenedor-paletas");
const contenedorAccesorios = document.querySelector("#contenedor-accesorios");
const contenedorZapatillas = document.querySelector("#contenedor-zapatillas");
const contenedorCarrito = document.querySelector("#items-carrito");
const contadorCarrito = document.querySelector("#contador-carrito");
const totalCarrito = document.querySelector("#total-carrito");
const btnComprar = document.querySelector("#btn-comprar");
const btnVaciar = document.querySelector("#btn-vaciar");

// 1. OBTENER LOS DATOS (FETCH)
const cargarProductos = async () => {
    try {
        const respuesta = await fetch('./data.json');
        productosStock = await respuesta.json();
        renderizarVistas(productosStock);
    } catch (error) {
        Swal.fire("Error", "No pudimos conectar con el servidor de Padel Papilo", "error");
    }
};

// 2. RENDERIZAR LAS VISTAS POR CATEGORÍA (DOM)
const renderizarVistas = (productos) => {
    // Vaciamos los contenedores por si acaso
    contenedorPaletas.innerHTML = "";
    contenedorAccesorios.innerHTML = "";
    contenedorZapatillas.innerHTML = "";

    productos.forEach(producto => {
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

        // Distribuimos según la categoría
        if (producto.categoria === "paletas") contenedorPaletas.appendChild(tarjeta);
        if (producto.categoria === "accesorios") contenedorAccesorios.appendChild(tarjeta);
        if (producto.categoria === "zapatillas") contenedorZapatillas.appendChild(tarjeta);
    });

    // Escuchar los botones de agregar
    asignarEventosAgregar();
};

// 3. LÓGICA DE AGREGAR AL CARRITO
const asignarEventosAgregar = () => {
    const botonesAgregar = document.querySelectorAll(".btn-agregar");
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = parseInt(e.target.getAttribute("data-id"));
            const productoElegido = productosStock.find(prod => prod.id === idProducto);
            
            // Verificamos si ya está en el carrito para sumar cantidad o agregarlo nuevo
            const existe = carrito.some(prod => prod.id === idProducto);
            if (existe) {
                const prodRef = carrito.find(prod => prod.id === idProducto);
                prodRef.cantidad++;
            } else {
                // Le agregamos la propiedad cantidad
                carrito.push({ ...productoElegido, cantidad: 1 });
            }

            actualizarCarrito();

            // Notificación de éxito
            Toastify({
                text: `¡${productoElegido.nombre} añadido al carrito!`,
                duration: 2000,
                gravity: "bottom",
                position: "right",
                style: { background: "#198754", color: "#fff", fontWeight: "bold" }
            }).showToast();
        });
    });
};

// 4. ACTUALIZAR PANEL DEL CARRITO Y TOTALES
const actualizarCarrito = () => {
    contenedorCarrito.innerHTML = "";
    
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `<p class="text-center text-secondary mt-4">El carrito está vacío.</p>`;
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
                <h6 class="mb-0 text-success fw-bold" style="font-size: 0.9rem;">${prod.nombre}</h6>
                <small class="text-secondary">Cant: ${prod.cantidad}</small>
                <div class="fw-bold">$${(prod.precio * prod.cantidad).toLocaleString('es-AR')}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger ms-2 btn-eliminar" data-id="${prod.id}">
                <i class="bi bi-trash"></i>
            </button>
        `;
        contenedorCarrito.appendChild(div);

        total += (prod.precio * prod.cantidad);
        cantidadTotal += prod.cantidad;
    });

    // Actualizamos números
    contadorCarrito.innerText = cantidadTotal;
    document.querySelector("#subtotal-carrito").innerText = `$${total.toLocaleString('es-AR')}`;
    totalCarrito.innerText = `$${total.toLocaleString('es-AR')}`;

    // Eventos para eliminar ítems
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Buscamos el ID subiendo hasta el botón por si se hace clic en el ícono
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            carrito = carrito.filter(prod => prod.id !== id);
            actualizarCarrito();
        });
    });
};

// 5. SIMULAR COMPRA FINAL
btnComprar.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Agregá alguna paleta antes de ir a la cancha.',
            background: '#1a1a1a',
            color: '#fff'
        });
        return;
    }

    Swal.fire({
        title: '¡Compra Confirmada!',
        text: 'Preparate para la Nueva Era del Pádel. Te enviamos el comprobante al mail.',
        icon: 'success',
        confirmButtonColor: '#198754',
        background: '#1a1a1a',
        color: '#fff'
    }).then(() => {
        carrito = [];
        actualizarCarrito();
        // Cierra el panel lateral de Bootstrap
        const carritoOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('carritoOffcanvas'));
        carritoOffcanvas.hide();
    });
});

// VACIAR CARRITO COMPLETO
btnVaciar.addEventListener("click", () => {
    if (carrito.length > 0) {
        carrito = [];
        actualizarCarrito();
    }
});

// Arrancar el simulador
cargarProductos();