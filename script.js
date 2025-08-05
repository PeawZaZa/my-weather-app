const apiKey = '37e2f1e05e38287ab3c8c69c7435df50';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const vid2 = document.querySelector('#video2');
const vid1 = document.querySelector('#video1');
const body = document.body;
const weatherinfo = document.querySelector('.weather-info-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather, sys, dt } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];
    const { sunrise, sunset } = sys;

    console.log(main,weather,data);
    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
    const newVideoSrc = isDaytime(dt, sunrise, sunset) === "Daytime" ? "Day" : "Night";
    setBackgroundVideo(newVideoSrc);

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


