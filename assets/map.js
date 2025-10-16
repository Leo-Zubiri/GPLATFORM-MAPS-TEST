let map;
let marker;
let infoWindow;

async function initMap() {
  // Carga las librerías necesarias
  const [{ Map }, { AdvancedMarkerElement }, placesLibrary] = await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("places"),
  ]);


  // Crea el mapa
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.432608, lng: -99.133209 },
    zoom: 13,
    mapId: "4504f8b37365c3d0",
    mapTypeControl: false,
  });

  // Crea el nuevo componente de autocompletado
  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
    locationBias: map.getCenter(), // bias inicial
  });

  placeAutocomplete.id = "place-autocomplete-input";
  placeAutocomplete.startFetchingOnFocus = true;
  const card = document.getElementById("place-autocomplete-card");

  card.appendChild(placeAutocomplete);

  // Inserta el input dentro del card y agrégalo al mapa
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);


  // Crea el marcador y el InfoWindow
  marker = new google.maps.marker.AdvancedMarkerElement({
    map,
  });
  infoWindow = new google.maps.InfoWindow({});

  // Evento cuando el usuario selecciona un lugar
  placeAutocomplete.addEventListener("gmp-select", async (event) => {
    const placePrediction = event.placePrediction;
    const place = await placePrediction.toPlace();

    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "location", "viewport"],
    });

    // Centra el mapa en el lugar seleccionado
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(17);
    }

    // Contenido del InfoWindow
    const content = `
      <div id="infowindow-content">
        <strong>${place.displayName}</strong><br>
        ${place.formattedAddress}
      </div>
    `;

    updateInfoWindow(content, place.location);
    marker.position = place.location;

    console.log("Dirección:", place.formattedAddress);
    console.log("Coordenadas:", place.location.toJSON());
  });
}

// Helper para actualizar el InfoWindow
function updateInfoWindow(content, position) {
  infoWindow.setContent(content);
  infoWindow.setPosition(position);
  infoWindow.open({
    map,
    anchor: marker,
    shouldFocus: false,
  });
}

window.initMap = initMap;
