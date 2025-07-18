let editIndex = null;

// Navegación entre paneles
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const panel = item.getAttribute('data-panel');
        if (!panel) return;
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${panel}`).classList.add('active');
    });
});

// Modales
const modal = document.getElementById('modalAgregarEquipo');
const modalTitulo = document.getElementById('modalTitulo');
const form = document.getElementById('formAgregarEquipo');
const mainContent = document.getElementById('main-content');

const modalEntrega = document.getElementById('modalEntrega');
const entregaInfo = document.getElementById('entregaInfo');
const confirmarEntregaBtn = document.getElementById('confirmarEntregaBtn');
const cancelarEntregaBtn = document.getElementById('cancelarEntregaBtn');

const modalColor = document.getElementById('modalColor');
const colorOptions = document.getElementById('colorOptions');
const cancelarColorBtn = document.getElementById('cancelarColorBtn');

let colorIndex = null;

// Paleta UNOVA coherente
const coloresDisponibles = {
    violeta: "rgba(149, 117, 205, 0.2)",
    lavanda: "rgba(196, 167, 222, 0.2)",
    menta: "rgba(152, 223, 183, 0.2)",
    azulnoche: "rgba(100, 149, 237, 0.2)"
};

// Botones de color
function generarBotonesColor() {
    colorOptions.innerHTML = '';
    Object.entries(coloresDisponibles).forEach(([nombre, color]) => {
        const btn = document.createElement('button');
        btn.classList.add('add-btn');
        btn.style.background = color;
        btn.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        btn.addEventListener('click', () => seleccionarColor(nombre));
        colorOptions.appendChild(btn);
    });
}
generarBotonesColor();

// Botones de filtro
function generarBotonesFiltro() {
    const filtrosContainer = document.getElementById('filtrosContainer');
    if (!filtrosContainer) return;
    filtrosContainer.innerHTML = '';

    const todosBtn = document.createElement('button');
    todosBtn.classList.add('add-btn');
    todosBtn.textContent = 'Todos';
    todosBtn.addEventListener('click', () => renderEquipos('todos'));
    filtrosContainer.appendChild(todosBtn);

    Object.entries(coloresDisponibles).forEach(([nombre, color]) => {
        const btn = document.createElement('button');
        btn.classList.add('add-btn');
        btn.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        btn.style.background = color;
        btn.addEventListener('click', () => renderEquipos(nombre));
        filtrosContainer.appendChild(btn);
    });
}
generarBotonesFiltro();

// Abrir modal agregar equipo
const agregarEquipoBtn = document.getElementById('agregarEquipoBtn');
if (agregarEquipoBtn) {
    agregarEquipoBtn.addEventListener('click', () => {
        modalTitulo.innerText = "Agregar equipo";
        form.reset();
        editIndex = null;
        document.getElementById('debeCliente').innerText = '';
        modal.classList.remove('hidden');
        mainContent.classList.add('blurred');
    });
}

// Cerrar modal agregar equipo
document.getElementById('cerrarModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
    mainContent.classList.remove('blurred');
});

// Formateo y cálculo "Debe"
function formatNumberInput(input) {
    let value = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    if (value !== '') {
        input.value = parseInt(value).toLocaleString('es-ES');
    }
}

function calcularDebe() {
    const presupuesto = parseInt(form.presupuesto.value.replace(/\./g, '')) || 0;
    const entrega = parseInt(form.entrega.value.replace(/\./g, '')) || 0;
    const debe = presupuesto - entrega;
    document.getElementById('debeCliente').innerText = (debe > 0) ? debe.toLocaleString('es-ES') : '';
}

form.presupuesto.addEventListener('input', e => {
    formatNumberInput(e.target);
    calcularDebe();
});
form.entrega.addEventListener('input', e => {
    formatNumberInput(e.target);
    calcularDebe();
});

// Guardar equipo
form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let equipos = JSON.parse(localStorage.getItem('equipos')) || [];

    if (editIndex !== null) {
        equipos[editIndex] = { ...equipos[editIndex], ...data };
    } else {
        equipos.push(data);
    }

    localStorage.setItem('equipos', JSON.stringify(equipos));
    modal.classList.add('hidden');
    mainContent.classList.remove('blurred');
    renderEquipos();
});

// Editar equipo
window.verEquipo = function(index) {
    let equipos = JSON.parse(localStorage.getItem('equipos')) || [];
    const eq = equipos[index];

    Object.keys(eq).forEach(key => {
        if (form[key]) form[key].value = eq[key];
    });

    calcularDebe();
    editIndex = index;
    modalTitulo.innerText = "Editar equipo";
    modal.classList.remove('hidden');
    mainContent.classList.add('blurred');
}

// Confirmar entrega
window.confirmarEntrega = function(index) {
    let equipos = JSON.parse(localStorage.getItem('equipos')) || [];
    const eq = equipos[index];
    const presupuesto = parseInt(eq.presupuesto.replace(/\./g, '')) || 0;
    const entrega = parseInt(eq.entrega.replace(/\./g, '')) || 0;
    const debe = presupuesto - entrega;

    entregaInfo.innerHTML = `
        <p><strong>Cliente:</strong> ${eq.nombreCliente}</p>
        <p><strong>Equipo:</strong> ${eq.tipoEquipo}</p>
        <p><strong>Presupuesto:</strong> ${presupuesto.toLocaleString('es-ES')}</p>
        <p><strong>Entrega:</strong> ${entrega.toLocaleString('es-ES')}</p>
        <p><strong style="color:lime;">Debe:</strong> <span style="color:lime; font-size:1.2em;">${debe.toLocaleString('es-ES')}</span></p>
    `;

    modalEntrega.classList.remove('hidden');
    mainContent.classList.add('blurred');

    confirmarEntregaBtn.onclick = () => {
        equipos.splice(index, 1);
        localStorage.setItem('equipos', JSON.stringify(equipos));
        modalEntrega.classList.add('hidden');
        mainContent.classList.remove('blurred');
        renderEquipos();
    };

    cancelarEntregaBtn.onclick = () => {
        modalEntrega.classList.add('hidden');
        mainContent.classList.remove('blurred');
    };
}

// Cambiar color
window.cambiarColor = function(index) {
    colorIndex = index;
    modalColor.classList.remove('hidden');
    mainContent.classList.add('blurred');
};

// Seleccionar color
function seleccionarColor(nombreColor) {
    let equipos = JSON.parse(localStorage.getItem('equipos')) || [];
    if (coloresDisponibles[nombreColor]) {
        equipos[colorIndex].color = coloresDisponibles[nombreColor];
        equipos[colorIndex].colorNombre = nombreColor;
        localStorage.setItem('equipos', JSON.stringify(equipos));
        modalColor.classList.add('hidden');
        mainContent.classList.remove('blurred');
        renderEquipos();
    }
}

// Cancelar cambio de color
cancelarColorBtn.addEventListener('click', () => {
    modalColor.classList.add('hidden');
    mainContent.classList.remove('blurred');
});

// Renderizar equipos
function renderEquipos(filtroColor = 'todos') {
    const contenedor = document.getElementById('equiposList');
    contenedor.innerHTML = '';
    let equipos = JSON.parse(localStorage.getItem('equipos')) || [];

    if (equipos.length === 0) {
        contenedor.innerHTML = "<p style='color:white;'>No hay equipos cargados aún.</p>";
        return;
    }

    equipos.forEach((eq, index) => {
        if (filtroColor !== 'todos' && eq.colorNombre !== filtroColor) return;

        const card = document.createElement('div');
        card.classList.add('equipo-card');
        if (eq.color) card.style.background = eq.color;

        card.innerHTML = `
            <p><strong>${eq.tipoEquipo || 'Equipo'}</strong> de ${eq.nombreCliente || 'Cliente'}</p>
            <p>${eq.fallaEquipo || 'Sin falla especificada'}</p>
            <button onclick="verEquipo(${index})">Ver / Editar</button>
            <button onclick="confirmarEntrega(${index})">Entregar</button>
            <button onclick="cambiarColor(${index})">Color</button>
        `;
        contenedor.appendChild(card);
    });
}

// Inicializar
renderEquipos();
