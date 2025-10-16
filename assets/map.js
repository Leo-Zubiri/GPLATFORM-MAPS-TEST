let map;
let marker;
let infoWindow;
let geocoder;
let placeAutocomplete;

async function initMap() {
  const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
  ]);

  geocoder = new google.maps.Geocoder();

  // Crear mapa
  map = new Map(document.getElementById("map"), {
    center: { lat: 19.432608, lng: -99.133209 },
    zoom: 13,
    mapTypeControl: false,
    mapId: "1d5ecc631751ef8917386781", // tu Map ID válido
  });

  // Crear AdvancedMarkerElement
  marker = new AdvancedMarkerElement({
    map,
    position: map.getCenter(),
  });

  infoWindow = new google.maps.InfoWindow();

  // Crear componente de autocompletado
  placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
    locationBias: map.getCenter(),
  });
  placeAutocomplete.id = "place-autocomplete-input";
  placeAutocomplete.startFetchingOnFocus = true;

  const card = document.getElementById("place-autocomplete-card");
  card.appendChild(placeAutocomplete);

  // Evento cuando se selecciona un lugar
  placeAutocomplete.addEventListener("gmp-select", async (event) => {
    const placePrediction = event.placePrediction;
    const place = await placePrediction.toPlace();

    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "location", "viewport"],
    });

    // Centrar mapa
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(17);
    }

    // Mover marcador
    marker.position = place.location;

    // Mostrar InfoWindow
    const content = `
      <div>
        <strong>${place.displayName}</strong><br>
        ${place.formattedAddress}
      </div>
    `;
    updateInfoWindow(content, place.location);
  });

  // --- Mover marcador haciendo click en el mapa ---
  map.addListener("click", (e) => {
    const latLng = e.latLng;

    // Mover marcador
    marker.position = latLng;

    // Geocoding inverso para obtener dirección
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Actualiza input del autocomplete
        placeAutocomplete.value = results[0].formatted_address;

        // Actualiza InfoWindow
        const content = `
          <div>
            <strong>${results[0].formatted_address}</strong><br>
            Lat: ${latLng.lat().toFixed(6)}, Lng: ${latLng.lng().toFixed(6)}
          </div>
        `;
        updateInfoWindow(content, latLng);
      }
    });
  });
}

// Helper InfoWindow
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
