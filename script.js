const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchButton");
const currentBtn = document.getElementById("currentButton");

const dropdown = document.getElementById("cityDropdown");
const dropdownContainer = document.getElementById("dropdownContainer");

const apiKey = "a56bed1a30f406400e450a2928079da9";

// loading
let recentCities = JSON.parse(sessionStorage.getItem("recentCities")) || [];
populateDropdown(recentCities);

// EVENT LISTENERS
searchBtn.addEventListener("click", getCityCoordinates);
currentBtn.addEventListener("click", getCurrentLocation);
dropdown.addEventListener("change", () => {
  const selectedCity = dropdown.value;
  cityInput.value = selectedCity;
  getCityCoordinates(); 
});

// FUNCTIONS
function getCityCoordinates() {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  cityInput.value = "";

  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

  fetch(geoUrl)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) throw new Error("City not found");
      const { name, lat, lon, country, state } = data[0];

      // Add to recent cities 
      if (!recentCities.includes(name)) {
        recentCities.unshift(name);
        recentCities = recentCities.slice(0, 5); 
        sessionStorage.setItem("recentCities", JSON.stringify(recentCities));
        populateDropdown(recentCities);
      }

      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() => {
      alert("City not found or API failed.");
    });
}
//get cuurent location
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        getWeatherDetails("Your Location", lat, lon);
      },
      () => {
        alert("Failed to get your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}
//get weather details
function getWeatherDetails(name, lat, lon, country = "", state = "") {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  // Current Weather
  fetch(currentUrl)
    .then((res) => res.json())
    .then((data) => {
      document.querySelector(".text-3xl").textContent = `${data.main.temp}°C`;
      document.querySelector(".text-gray-600").textContent = `${data.weather[0].description}`;
      document.querySelector(".w-16").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      document.querySelector("#p1").textContent = `Humidity: ${data.main.humidity}% | Wind: ${data.wind.speed} m/s`;
    });

  // 5-Day Forecast
  fetch(forecastUrl)
    .then((res) => res.json())
    .then((data) => {
      const forecastList = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      const forecastCards = document.querySelectorAll(".grid > div");

      forecastList.slice(0, 5).forEach((item, index) => {
        const card = forecastCards[index];
        const temp = Math.round(item.main.temp);
        const description = item.weather[0].description;
        const date = new Date(item.dt_txt);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const icon = item.weather[0].icon;

        card.querySelector("img").src = `https://openweathermap.org/img/wn/${icon}.png`;
        card.querySelector(".text-xl").textContent = `${temp}°C`;
        card.querySelectorAll("p")[0].textContent = description;
        card.querySelectorAll("p")[1].textContent = weekday;
      });
    });
}
//dropdown function
function populateDropdown(cities) {
  if (!cities.length) {
    dropdownContainer.classList.add("hidden");
    return;
  }

  dropdownContainer.classList.remove("hidden");

  dropdown.innerHTML = `<option disabled selected> Select a city</option>`;
  cities.forEach(cityName => {
    const option = document.createElement("option");
    option.value = cityName;
    option.textContent = cityName;
    dropdown.appendChild(option);
  });
}
