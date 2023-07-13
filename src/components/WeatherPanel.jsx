import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";

const API_KEY = "fd2fd95e5cb8abc849c754b063354de1";
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather";
const API_URL_CITY_SEARCH = "https://api.openweathermap.org/data/2.5/find";

// Variables de estado utilizando el hook useState

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [temperatureCelsius, setTemperatureCelsius] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState("Celsius");
  const [humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [weatherDescription, setWeatherDescription] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [airPressure, setAirPressure] = useState(null);
  const [suggestedCities, setSuggestedCities] = useState([]);

  // Obtener datos de clima basados en la geolocalización del usuario

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
          fetchDefaultWeather();
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      fetchDefaultWeather();
    }
  }, []);

  // Obtener datos de clima predeterminados para una ciudad por defecto

  const fetchDefaultWeather = () => {
    const defaultCity = "Bogota";
    fetchWeatherByCity(defaultCity);
  };
  // Obtener datos de clima por coordenadas

  const fetchWeatherByCoordinates = (latitude, longitude) => {
    axios
      .get(
        `${API_URL_WEATHER}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      )
      .then((response) => {
        const weatherData = response.data;
        updateWeatherData(weatherData);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  // Obtener datos de clima por nombre de ciudad

  const fetchWeatherByCity = (city) => {
    axios
      .get(`${API_URL_WEATHER}?q=${city}&appid=${API_KEY}`)
      .then((response) => {
        const weatherData = response.data;
        updateWeatherData(weatherData);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  // Actualizar variables de estado con los datos de clima

  const updateWeatherData = (weatherData) => {
    setCity(weatherData.name);
    setCountry(weatherData.sys.country);
    setWeatherIcon(weatherData.weather[0].icon);
    setTemperatureCelsius(weatherData.main.temp - 273.15);
    setHumidity(weatherData.main.humidity);
    setWindSpeed(weatherData.wind.speed);
    setWeatherDescription(weatherData.weather[0].description);
    setAirPressure(weatherData.main.pressure);
    setIsLoading(false);
  };

  // Alternar unidad de temperatura entre Celsius, Fahrenheit y Kelvin

  const toggleTemperatureUnit = () => {
    if (temperatureUnit === "Celsius") {
      setTemperatureUnit("Fahrenheit");
    } else if (temperatureUnit === "Fahrenheit") {
      setTemperatureUnit("Kelvin");
    } else {
      setTemperatureUnit("Celsius");
    }
  };

  // Renderizar la temperatura con la unidad adecuada

  const renderTemperature = () => {
    if (temperatureCelsius === null) {
      return null;
    }

    let temperatureValue = temperatureCelsius;

    if (temperatureUnit === "Fahrenheit") {
      temperatureValue = (temperatureValue * 9) / 5 + 32;
    } else if (temperatureUnit === "Kelvin") {
      temperatureValue = temperatureValue + 273.15;
    }

    return `${temperatureValue.toFixed(1)} ${temperatureUnit}`;
  };

  // Manejar la presentación del formulario para obtener los datos de clima de la ciudad seleccionada

  const handleCitySubmit = (event) => {
    event.preventDefault();
    if (selectedCity) {
      fetchWeatherByCity(selectedCity);
    }
  };

  // Manejar el cambio de entrada de la ciudad y obtener las ciudades sugeridas

  const handleCityChange = (event) => {
    const query = event.target.value;
    setSelectedCity(query);
    fetchSuggestedCities(query);
  };

  // Obtener ciudades sugeridas según la entrada del usuario

  const fetchSuggestedCities = (query) => {
    if (query) {
      axios
        .get(`${API_URL_CITY_SEARCH}?q=${query}&limit=5&appid=${API_KEY}`)
        .then((response) => {
          const suggestedCitiesData = response.data.list;
          setSuggestedCities(suggestedCitiesData);
        })
        .catch((error) => {
          console.error("Error fetching suggested cities:", error);
        });
    } else {
      setSuggestedCities([]);
    }
  };

  // Aplicar la clase CSS "dark-mode" al cuerpo del documento cuando el modo oscuro está activado

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <section className={`app ${darkMode ? "dark-mode" : ""}`}>
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="container">
        <h1>Weather App</h1>
        <form onSubmit={handleCitySubmit}>
          <div className="suggestions-container">
            <input
              type="text"
              value={selectedCity}
              onChange={handleCityChange}
              placeholder="Enter city"
            />
            {suggestedCities.length > 0 && (
              <ul className="suggestions-list">
                {suggestedCities.map((city) => (
                  <li
                    key={city.id}
                    className="suggestions-list-item"
                    onClick={() => fetchWeatherByCity(city.name)}
                  >
                    {city.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit">Get Weather</button>
        </form>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <article className="card">
              <h2>
                {city}, {country}
              </h2>
              <h3>Temperature: {renderTemperature()}</h3>
              <p>Humidity: {humidity}%</p>
              <p>Wind Speed: {windSpeed} m/s</p>
              <p>Air Pressure: {airPressure} hPa</p>
              <p>Weather Description: {weatherDescription}</p>
              {weatherIcon && (
                <img
                  src={`https://openweathermap.org/img/w/${weatherIcon}.png`}
                  alt="Weather Icon"
                />
              )}
            </article>
          </>
        )}
      </div>
      <button className="switch" onClick={toggleTemperatureUnit}>
        Switch Unit
      </button>
    </section>
  );
};

export default WeatherApp;
