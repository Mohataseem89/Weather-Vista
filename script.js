
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "b866f677d1f37c2a8db200991e722a3e"; // OpenWeatherMap API Key

// Function to create weather cards
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temp = (weatherItem.main.temp - 273.15).toFixed(2); // to Convert Kelvin to Celsius
    const wind = `${weatherItem.wind.speed} M/S`;
    const humidity = `${weatherItem.main.humidity}%`;
    const icon = weatherItem.weather[0].icon;
    const description = weatherItem.weather[0].description;

    if (index === 0) { // Current Weather
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h6>Temperature: ${temp}°C</h6>
                <h6>Wind: ${wind}</h6>
                <h6>Humidity: ${humidity}</h6>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                <h6>${description}</h6>
            </div>`;
    } 
    // Forecast Cards
    return `
        <li class="card">
            <h3>${date}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
            <h6>Temp: ${temp}°C</h6>
            <h6>Wind: ${wind}</h6>
            <h6>Humidity: ${humidity}</h6>
        </li>`;
};


const getWeatherDetails = async (cityName, latitude, longitude) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch weather data");

        
        const uniqueForecastDays = new Set();
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.has(forecastDate)) {
                uniqueForecastDays.add(forecastDate);
                return true;
            }
            return false;
        });

        // to Clear previous data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // to Insert new weather data
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            index === 0 
                ? currentWeatherDiv.insertAdjacentHTML("beforeend", html)
                : weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        });
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert("Please enter a city name.");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
        );
        const data = await response.json();

        if (!data.length) throw new Error(`No coordinates found for "${cityName}"`);

        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};
const getUserCoordinates = () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition(
        async position => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
                );
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.message || "Failed to fetch location data");

                getWeatherDetails(data.name, latitude, longitude);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission denied. Please enable it in settings.");
            } else {
                alert("Geolocation request error. Please try again.");
            }
        }
    );
};

//the  event Listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
