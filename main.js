let servicioSeleccionado = null;

const cargarServicios = async () => {
    try {
        const respuesta = await fetch('./data.json');
        const servicios = await respuesta.json();
        renderizarServicios(servicios);
    } catch (error) {
        Swal.fire("Error", "No pudimos cargar los servicios.", "error");
    }
};

const renderizarServicios = (lista) => {
    const contenedor = document.querySelector("#contenedor-servicios");
    
    lista.forEach(servicio => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = `
            <h3>${servicio.nombre}</h3>
            <p>Precio: $${servicio.precio}</p>
            <p>Duración: ${servicio.duracion}</p>
            <button class="btn-seleccionar" data-id="${servicio.id}">Seleccionar</button>
        `;
        contenedor.appendChild(tarjeta);
    });

    document.querySelectorAll(".btn-seleccionar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            servicioSeleccionado = lista.find(s => s.id == id);
            
            // Actualizamos el resumen
            document.querySelector("#resumen-servicio").textContent = servicioSeleccionado.nombre;
            document.querySelector("#resumen-total").textContent = servicioSeleccionado.precio;
            
            Toastify({
                text: `Seleccionaste: ${servicioSeleccionado.nombre}`,
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#f39c12" }
            }).showToast();
        });
    });
};

document.querySelector("#form-reserva").addEventListener("submit", (e) => {
    e.preventDefault(); // Evitamos que la página se recargue

    if (!servicioSeleccionado) {
        Swal.fire("Atención", "Primero seleccioná un servicio", "warning");
        return;
    }

    const nombre = document.querySelector("#nombre-cliente").value;
    Swal.fire("¡Éxito!", `Turno reservado para ${nombre} (${servicioSeleccionado.nombre})`, "success");
});

cargarServicios(); 