const loginBtn = document.getElementById("login-btn");
const usuarioInput = document.getElementById("usuario");
const loginNavbar = document.getElementById("login-navbar");
const searchNavbar = document.getElementById("search-navbar");
const saludo = document.getElementById("saludo");
const comentariosDisplay = document.getElementById("comentarios-display");

const imgMain = document.getElementById("img-main");

const logoutBtn = document.getElementById("logout-btn");

const API_KEY = "8902013dccc7f1c095903e4175a98b3a";

const formSearch = document.getElementById("search-navbar");
const ciudadInput = formSearch.querySelector("input[type='search']");

const tempDisplay = document.querySelector(".display-1");
const ciudadDisplay = document.getElementById("ciudad-display");


const imgSlider = document.getElementById("img-slider");
const ciudadSlider = document.getElementById("ciudad-slider");
const climaSlider = document.getElementById("clima-sliderv");
const tempSlider = document.getElementById("temp-slider");


loginBtn.addEventListener("click", () => {
    const usuario = usuarioInput.value.trim();
    if (usuario === "") {
        alert("Ingresá tu nombre");
        return;
    }

    // Guardar usuario activo
    localStorage.setItem("usuarioActivo", usuario);

    // Inicializar estructura si no existe
    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify({}));
    }

    loginNavbar.classList.add("d-none");
    searchNavbar.classList.remove("d-none");

    saludo.textContent = `Hola ${usuario}, ingresá una ciudad`;
});


function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");

    loginNavbar.classList.remove("d-none");
    searchNavbar.classList.add("d-none");

    usuarioInput.value = "";
    saludo.textContent = "Clima";
    
}
logoutBtn.addEventListener("click", cerrarSesion);

window.addEventListener("DOMContentLoaded", () => {
    const usuario = localStorage.getItem("usuarioActivo");

    if (usuario) {
        loginNavbar.classList.add("d-none");
        searchNavbar.classList.remove("d-none");
        saludo.textContent = `Hola, ${usuario}, ingresá una ciudad`;
    }
});


formSearch.addEventListener("submit", (e) => {
    e.preventDefault();

    const ciudad = ciudadInput.value.trim();
    if (ciudad === "") return;

    obtenerClima(ciudad);
    ciudadInput.value = "";
});

async function obtenerClima(ciudad) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
        );

        if (!response.ok) {
            throw new Error("Ciudad no encontrada");
        }

        const data = await response.json();
        mostrarClima(data);

        // Guardar ciudad en el historial del usuario
        guardarCiudad(data);

    } catch (error) {
        comentariosDisplay.textContent = "No se pudo obtener el clima 😕";
    }
}

function mostrarClima(data) {
    tempDisplay.textContent = Math.round(data.main.temp);
    ciudadDisplay.textContent = data.name;
    comentariosDisplay.textContent = data.weather[0].description;

    cambiarImagenClima(data.weather[0].main);
}

function cambiarImagenClima(clima) {
    const imagen = imagenesClima[clima] || "assets/img/clear.png";
    imgMain.src = imagen;
}

function guardarCiudad(data) {
    const usuario = localStorage.getItem("usuarioActivo");
    if (!usuario) return;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (!usuarios[usuario]) {
        usuarios[usuario] = [];
    }

    const nuevaCiudad = {
        nombre: data.name,
        temp: Math.round(data.main.temp),
        clima: data.weather[0].description,
        main: data.weather[0].main
    };

    // evitar duplicados
    usuarios[usuario] = usuarios[usuario].filter(
        c => c.nombre !== nuevaCiudad.nombre
    );

    usuarios[usuario].unshift(nuevaCiudad);

    if (usuarios[usuario].length > 5) {
        usuarios[usuario].pop();
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    renderHistorial();
}

const historialDiv = document.getElementById("historial");

function renderHistorial() {
    const usuario = localStorage.getItem("usuarioActivo");
    if (!usuario) return;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
    const historial = usuarios[usuario] || [];

    historialDiv.innerHTML = "";

    historial.forEach(ciudad => {
        const card = document.createElement("div");
        card.className = "historial-card";

        const img = imagenesClima[ciudad.main] || "assets/img/clear.png";

        card.innerHTML = `
            <div class="historial-card-header">
            <div class="ciudad">${ciudad.nombre}</div>
            <div class="temp">${ciudad.temp}°</div>
            <img src="${img}" alt="">
        `;

        card.addEventListener("click", () => {
            obtenerClima(ciudad.nombre);
        });

        historialDiv.appendChild(card);
    });
}


function obtenerHistorial() {
    const usuario = localStorage.getItem("usuarioActivo");
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    return usuarios[usuario] || [];
}




const ciudadesSlider = [
    "Santiago,CL",
    "Buenos Aires,AR",
    "Madrid",
    "New York",
    "Paris",
    "Tokyo",
    "Londres",
    "Roma,IT",
];

const imagenesClima = {
    Clear: "assets/img/clear.png",
    Clouds: "assets/img/clouds.png",
    Rain: "assets/img/rain.png",
    Drizzle: "assets/img/rain.png",
    Thunderstorm: "assets/img/storm.png",
    Snow: "assets/img/snow.png",
    Mist: "assets/img/mist.png",
    Fog: "assets/img/mist.png",
    Haze: "assets/img/mist.png"
};

const sliderItems = document.querySelectorAll(".slider .item");

async function cargarSlider() {
    ciudadesSlider.forEach((ciudad, index) => {
        obtenerClimaSlider(ciudad, sliderItems[index]);
    });
}

async function obtenerClimaSlider(ciudad, card) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
        );

        if (!res.ok) throw new Error("Error API");

        const data = await res.json();
        mostrarClimaSlider(data, card);

    } catch (error) {
        console.error("Error slider:", ciudad);
    }
}

function mostrarClimaSlider(data, card) {
    const img = card.querySelector(".weather-img");
    const ciudadSpan = card.querySelector(".ciudad-slider");
    const climaSpan = card.querySelector(".clima-slider");
    const tempSpan = card.querySelector(".temp-slider");
    const paisSpan = card.querySelector(".pais-slider");

    const clima = data.weather[0].main;

    img.src = imagenesClima[clima] || "assets/img/clear.png";
    img.alt = data.weather[0].description;

    paisSpan.textContent = data.sys.country;
    ciudadSpan.textContent = data.name;
    climaSpan.textContent = data.weather[0].description;
    tempSpan.textContent = `${Math.round(data.main.temp)}°`;

    card.addEventListener("click", () => {
        obtenerClima(data.name);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const usuario = localStorage.getItem("usuarioActivo");

    cargarSlider();
    renderHistorial();

    // Ciudad por defecto al iniciar
    obtenerClima("Santiago");

    if (usuario) {
        loginNavbar.classList.add("d-none");
        searchNavbar.classList.remove("d-none");
        saludo.textContent = `Hola, ${usuario}, ingresá una ciudad`;
    }
});

