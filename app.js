// Constants
const apiKey = '52369564d2dc66c1fe013c20a839a624';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const placeKitApiKey = 'pk_12yK8qBIsLk5kiD2vUAAy4SkaGnCfF9Olpc4OLQlLDQ=';
const placeKitApiUrl = 'https://api.placekit.co/reverse';

// DOM Elements
const cityElement = document.getElementById('city');
const temperatureElement = document.getElementById('temperature');
const conditionElement = document.getElementById('condition');
const additionalInfoElement = document.getElementById('additional-info');
const cityInput = document.getElementById('cityInput');
const suggestionsContainer = document.getElementById('suggestionsContainer');

// Functions for fetching weather data
async function getWeather(city) {
    try {
        console.log('Fetching weather data for:', city);

        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        updateUI(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function getWeeklyWeather(city) {
    try {
        console.log('Fetching 5-day weather data for:', city);

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

        if (response.ok) {
            const data = await response.json();
            console.log('5-day Weather Data:', data);

            updateWeeklyUI(data);
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData.message);
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error fetching 5-day weather data:', error);
    }
}

async function getMonthlyWeather(city) {
    try {
        console.log('Fetching monthly weather data for:', city);

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        updateMonthlyUI(data);
    } catch (error) {
        console.error('Error fetching monthly weather data:', error);
    }
}

async function getWeatherByCoordinates(latitude, longitude, units = 'metric') {
    try {
        console.log('Fetching geolocation data...');
        const placeKitResponse = await fetch(`${placeKitApiUrl}?lat=${latitude}&lng=${longitude}&api_key=${placeKitApiKey}`);
        const placeKitData = await placeKitResponse.json();

        console.log('PlaceKit Data:', placeKitData);

        const cityName = placeKitData.features[0]?.place_name || 'Unknown City';

        const response = await fetch(`${apiUrl}?q=${cityName}&appid=${apiKey}&units=${units}`);
        const data = await response.json();
        updateUI(data);

        cityInput.value = cityName;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// UI update functions
function updateUI(data) {
    if (data.name && data.sys && data.sys.country) {
        cityElement.textContent = `${data.name}, ${data.sys.country}`;
    } else {
        cityElement.textContent = 'Location not available';
    }

    if (data.main && data.main.temp !== undefined) {
        temperatureElement.textContent = `${data.main.temp}°C`;
    } else {
        temperatureElement.textContent = 'Temperature not available';
    }

    if (data.weather && data.weather.length > 0) {
        const weatherCondition = data.weather[0].description;
        conditionElement.textContent = `Weather Condition: ${weatherCondition}`;
    } else {
        conditionElement.textContent = 'Weather Condition not available';
    }

    if (data.main) {
        const humidity = data.main.humidity;
        const windSpeed = data.wind ? data.wind.speed : 'N/A';

        additionalInfoElement.innerHTML = `<p>Humidity: ${humidity}%</p><p>Wind Speed: ${windSpeed} m/s</p>`;
    } else {
        additionalInfoElement.innerHTML = 'Additional information not available';
    }
}

function updateWeeklyUI(data) {
    console.log('Updating weekly UI with data:', data);

    const weeklyForecast = data.list;

    const weeklyContainer = document.getElementById('weeklyForecastContainer');
    weeklyContainer.innerHTML = '';

    if (weeklyForecast && weeklyForecast.length > 0) {
        for (let i = 0; i < weeklyForecast.length; i++) {
            const forecast = weeklyForecast[i];

            if (forecast && forecast.dt && forecast.main && forecast.weather && forecast.weather.length > 0) {
                const date = new Date(forecast.dt * 1000);
                const dateString = date.toLocaleDateString();

                const temperature = forecast.main.temp !== undefined ? forecast.main.temp : forecast.main;
                const condition = forecast.weather[0].description;

                const forecastElement = document.createElement('div');
                forecastElement.classList.add('forecast-item');

                const dateElement = document.createElement('p');
                dateElement.textContent = dateString;

                const temperatureElement = document.createElement('p');
                temperatureElement.textContent = `Temperature: ${temperature}°C`;

                const conditionElement = document.createElement('p');
                conditionElement.textContent = `Condition: ${condition}`;

                forecastElement.appendChild(dateElement);
                forecastElement.appendChild(temperatureElement);
                forecastElement.appendChild(conditionElement);

                weeklyContainer.appendChild(forecastElement);
            } else {
                console.error('Invalid forecast data:', forecast);
            }
        }
    } else {
        console.error('No data available for the weekly forecast.');
    }

    showPage('weekly');
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

// Event listeners
cityInput.addEventListener('input', async () => {
    console.log('Input changed:', cityInput.value);

    const userInput = cityInput.value;
    suggestionsContainer.innerHTML = '';

    if (userInput.trim().length >= 2) {
        try {
            console.log('Current placeKitApiKey:', placeKitApiKey);

            const placeKitResponse = await fetch(`${placeKitApiUrl}?q=${userInput}&api_key=${placeKitApiKey}`);
            const placeKitData = await placeKitResponse.json();

            const seenSuggestions = new Set();

            placeKitData.features.forEach(feature => {
                const placeName = feature.place_name || '';

                if (!seenSuggestions.has(placeName)) {
                    seenSuggestions.add(placeName);

                    const suggestionElement = document.createElement('div');
                    suggestionElement.textContent = placeName;
                    suggestionElement.classList.add('suggestion');

                    suggestionElement.addEventListener('click', () => {
                        cityInput.value = placeName;
                        suggestionsContainer.innerHTML = '';
                    });

                    suggestionsContainer.appendChild(suggestionElement);
                }
            });
        } catch (error) {
            console.error('Error fetching PlaceKit autocomplete suggestions:', error);
        }
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('#suggestionsContainer')) {
        suggestionsContainer.innerHTML = '';
    }
});

function handleEnter(event) {
    if (event.key === 'Enter') {
        getWeather(cityInput.value);
    }
}

function handleFocus() {
    if (cityInput.value === 'Search City') {
        cityInput.value = '';
    }
}

function handleBlur() {
    if (cityInput.value === '') {
        cityInput.value = 'Search City';
    }
}

// Geolocation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            if (latitude !== undefined && longitude !== undefined) {
                try {
                    const placeKitResponse = await fetch(`${placeKitApiUrl}?lat=${latitude}&lng=${longitude}&api_key=${placeKitApiKey}`);
                    const placeKitData = await placeKitResponse.json();

                    const cityName = placeKitData.features[0]?.place_name || 'Unknown City';

                    await getWeatherByCoordinates(latitude, longitude);

                    cityInput.value = cityName;
                } catch (error) {
                    console.error('Error fetching geolocation data:', error);
                    getWeather();
                }
            } else {
                console.error('Invalid coordinates');
                getWeather();
            }
        },
        () => {
            console.error('Unable to retrieve your location');
            getWeather();
        }
    );
} else {
    console.error('Geolocation is not supported by your browser');
    getWeather();
}
