const cameraDisplay = document.querySelector(".camera-display img"); // Imagen del Pokémon
const statsDisplay = document.querySelector(".stats-display"); // Contenedor para estadísticas
const nameInput = document.querySelector("[data-name]"); // Campo para el nombre o ID
const clearButton = document.querySelector(".game-mode"); // Botón para limpiar los datos
const upButton = document.querySelector(".cross-button.up"); // Botón UP para evoluciones
const leftButton = document.querySelector(".cross-button.left"); // Botón IZQUIERDA
const rightButton = document.querySelector(".cross-button.right"); // Botón DERECHA

const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const API_SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

let currentId = 1; // ID inicial (Bulbasaur)

// Función para obtener los datos de un Pokémon
const fetchPokemon = async (pokemonId) => {
  try {
    const response = await fetch(`${API_BASE_URL}${pokemonId}`);
    if (!response.ok) throw new Error("Pokémon no encontrado");
    return await response.json();
  } catch (error) {
    console.error(error);
    alert("Pokémon no encontrado. Por favor verifica el ID.");
    return null;
  }
};

// Función para obtener las evoluciones del Pokémon actual
const fetchEvolutions = async (pokemonId) => {
  try {
    const response = await fetch(`${API_SPECIES_URL}${pokemonId}`);
    if (!response.ok) throw new Error("Error al obtener evoluciones");
    const data = await response.json();

    const evolutionChainUrl = data.evolution_chain.url;
    const evolutionResponse = await fetch(evolutionChainUrl);
    const evolutionData = await evolutionResponse.json();

    return parseEvolutionChain(evolutionData.chain);
  } catch (error) {
    console.error("Error al obtener evoluciones", error);
    return [];
  }
};

// Función para analizar la cadena de evolución
const parseEvolutionChain = (chain) => {
  let evolutions = [];
  let currentStage = chain;

  while (currentStage) {
    evolutions.push(currentStage.species.name);
    currentStage = currentStage.evolves_to[0];
  }

  return evolutions;
};

// Renderizar los datos del Pokémon en el DOM
const renderPokemon = (pokemon) => {
  cameraDisplay.src = pokemon.sprites.front_default || "https://via.placeholder.com/150";
  cameraDisplay.alt = `Imagen de ${pokemon.name}`;

  statsDisplay.innerHTML = `
    <h2>${pokemon.name.toUpperCase()} (ID: ${pokemon.id})</h2>
    <p><strong>Tipo:</strong> ${pokemon.types.map((t) => t.type.name).join(", ")}</p>
    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
    <p><strong>Habilidades:</strong> ${pokemon.abilities.map((a) => a.ability.name).join(", ")}</p>
  `;
};

// Actualizar el Pokémon por ID
const updatePokemon = async (id) => {
  const pokemon = await fetchPokemon(id);
  if (pokemon) {
    currentId = pokemon.id; // Actualizar el ID actual
    renderPokemon(pokemon);
  }
};

// Buscar evoluciones del Pokémon
const displayEvolutions = async () => {
  const evolutions = await fetchEvolutions(currentId);
  const currentPokemon = await fetchPokemon(currentId);

  if (evolutions.length > 1) {
    const currentIndex = evolutions.indexOf(currentPokemon.name);

    if (currentIndex >= 0 && currentIndex < evolutions.length - 1) {
      const nextEvolutionName = evolutions[currentIndex + 1];
      const nextEvolution = await fetchPokemon(nextEvolutionName);
      if (nextEvolution) {
        renderPokemon(nextEvolution);
        currentId = nextEvolution.id; // Actualizar ID actual a la evolución
      }
    } else {
      alert("Este Pokémon ya está en su etapa final de evolución.");
    }
  } else {
    alert("Este Pokémon no tiene evoluciones conocidas.");
  }
};

// Evento para búsqueda automática (solo por ID)
nameInput.addEventListener("input", () => {
  const value = nameInput.value.trim();
  if (value && !isNaN(value) && value > 0) {  // Solo permite números mayores a 0
    updatePokemon(value); // Solo se busca por ID
  } else if (value !== "") {
    alert("Por favor ingresa un ID válido de Pokémon.");
  }
});

// Navegación con los botones de dirección
leftButton.addEventListener("click", () => {
  if (currentId > 1) {
    currentId++;
    updatePokemon(currentId);
  }
});

rightButton.addEventListener("click", () => {
  currentId--;
  updatePokemon(currentId);
});

upButton.addEventListener("click", displayEvolutions);

// Limpiar la UI y volver al inicio
clearButton.addEventListener("click", () => {
  statsDisplay.innerHTML = "";
  cameraDisplay.src = "https://via.placeholder.com/150";
  nameInput.value = "";
  currentId = 1;
  updatePokemon(currentId);
});

// Cargar el primer Pokémon (Bulbasaur) al iniciar
updatePokemon(currentId);
