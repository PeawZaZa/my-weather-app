const apiKey = '37e2f1e05e38287ab3c8c69c7435df50';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const vid2 = document.querySelector('#video2');
const vid1 = document.querySelector('#video1');
const body = document.body;
const weatherinfo = document.querySelector('.weather-info-container'); // This variable is unused in the provided code, keeping it as is.

const lastSearch = localStorage.getItem('lastSearch');
if (lastSearch) {
    getWeatherAndForecast(lastSearch); // Load last searched city and its forecast on page load
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeatherAndForecast(cityName);
        localStorage.setItem('lastSearch', cityName); // Save last searched city
        cityInput.value = ''; // Clear input after search
    } else {
       
        weatherInfoContainer.innerHTML = '<p class="error">Please enter a city name.</p>';
    }
});

async function getWeatherAndForecast(city) {
    weatherInfoContainer.innerHTML = `<p>Loading...</p>`;
    const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

    try {
        
        const currentWeatherResponse = await fetch(currentWeatherApiUrl);
        if (!currentWeatherResponse.ok) {
            throw new Error('City not found or API error for current weather');
        }
        const currentWeatherData = await currentWeatherResponse.json();
        const { lat, lon } = currentWeatherData.coord; 

        
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;
        const forecastResponse = await fetch(forecastApiUrl);
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not found or API error');
        }
        const forecastData = await forecastResponse.json();

        displayWeather(currentWeatherData);
        displayForecast(forecastData);

    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather, sys, dt } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];
    const { sunrise, sunset } = sys;

    console.log(main, weather, data);
    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>Humidity: ${humidity}%</p>
        <div id="forecast-section"></div> <!-- Placeholder for 5-day forecast -->
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
    const newVideoSrc = isDaytime(dt, sunrise, sunset) === "Daytime" ? "Day" : "Night";
    setBackgroundVideo(newVideoSrc);
}

function displayForecast(data) {
    const forecastSection = document.getElementById('forecast-section');
    if (!forecastSection) {
        console.error('Forecast section not found in DOM.');
        return;
    }

    if (!data || !data.list || data.list.length === 0) {
        forecastSection.innerHTML = '<p class="error">Could not retrieve 5-day forecast data.</p>';
        return;
    }

    let forecastHtml = '<h3>5-Day Forecast</h3><div class="forecast-cards-container">';
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

       
        const forecastHour = date.getUTCHours();
        if (!dailyForecasts[day] || (forecastHour >= 11 && forecastHour <= 14)) {
            dailyForecasts[day] = item;
        }
    });

    let count = 0;
    for (const day in dailyForecasts) {
        if (count >= 5) break; // Limit to 5 days
        const item = dailyForecasts[day];
        const temp = Math.round(item.main.temp);
        const description = item.weather[0].description;
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        forecastHtml += `
            <div class="forecast-card">
                <p class="forecast-day">${day}</p>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
        count++;
    }

    forecastHtml += '</div>';
    forecastSection.innerHTML = forecastHtml;
}


function isDaytime(dt, sunrise, sunset) {
    return dt >= sunrise && dt < sunset ? "Daytime" : "Nighttime";
}

function setBackgroundVideo(vid) {
    if (vid === "Day") {
        vid1.classList.remove('hidden');
        vid2.classList.add('hidden');
        body.classList.add('Daytime');
    }
    else if (vid === "Night") {
        vid2.classList.remove('hidden');
        vid1.classList.add('hidden');
        body.classList.remove('Daytime');
    }
}