import { useState, useEffect } from "react"; // Importar las funciones useState y useEffect de React
import axios from "axios"; // Importar el módulo axios para realizar solicitudes HTTP
import Loader from "./Loader"; // Importar el componente Loader desde un archivo local

const API_KEY = "fd2fd95e5cb8abc849c754b063354de1"; // Clave de la API de OpenWeatherMap
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather"; // URL base de la API de OpenWeatherMap

const WeatherApp = () => {
  // Definir el componente principal WeatherApp como una función de componente

  // Estados del componente
  const [city, setCity] = useState(""); // Ciudad actual
  const [country, setCountry] = useState(""); // País actual
  const [weatherIcon, setWeatherIcon] = useState(""); // Icono del clima actual
  const [temperatureCelsius, setTemperatureCelsius] = useState(null); // Temperatura actual en Celsius
  const [temperatureUnit, setTemperatureUnit] = useState("Celsius"); // Unidad de temperatura (Celsius, Fahrenheit, Kelvin)
  const [humidity, setHumidity] = useState(null); // Humedad actual
  const [windSpeed, setWindSpeed] = useState(null); // Velocidad del viento actual
  const [weatherDescription, setWeatherDescription] = useState(""); // Descripción del clima actual
  const [selectedCity, setSelectedCity] = useState(""); // Ciudad seleccionada por el usuario
  const [darkMode, setDarkMode] = useState(false); // Modo oscuro
  const [isLoading, setIsLoading] = useState(true); // Indicador de carga
  const [airPressure, setAirPressure] = useState(null); // Presión atmosférica actual

  useEffect(() => {
    // Efecto secundario para obtener los datos del clima de forma predeterminada o por geolocalización
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

  const fetchDefaultWeather = () => {
    // Obtener los datos del clima por defecto (ciudad predeterminada)
    const defaultCity = "Bogota";
    fetchWeatherByCity(defaultCity);
  };

  const fetchWeatherByCoordinates = (latitude, longitude) => {
    // Obtener los datos del clima por coordenadas geográficas
    axios
      .get(
        `${API_URL_WEATHER}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      )
      .then((response) => {
        const weatherData = response.data;

        setCity(weatherData.name);
        setCountry(weatherData.sys.country);
        setWeatherIcon(weatherData.weather[0].icon);
        setTemperatureCelsius(weatherData.main.temp - 273.15);
        setHumidity(weatherData.main.humidity);
        setWindSpeed(weatherData.wind.speed);
        setWeatherDescription(weatherData.weather[0].description);
        setAirPressure(weatherData.main.pressure);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  const fetchWeatherByCity = (city) => {
    // Obtener los datos del clima por nombre de ciudad
    axios
      .get(`${API_URL_WEATHER}?q=${city}&appid=${API_KEY}`)
      .then((response) => {
        const weatherData = response.data;

        setCity(weatherData.name);
        setCountry(weatherData.sys.country);
        setWeatherIcon(weatherData.weather[0].icon);
        setTemperatureCelsius(weatherData.main.temp - 273.15);
        setHumidity(weatherData.main.humidity);
        setWindSpeed(weatherData.wind.speed);
        setWeatherDescription(weatherData.weather[0].description);
        setAirPressure(weatherData.main.pressure);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  const toggleTemperatureUnit = () => {
    // Cambiar la unidad de temperatura
    if (temperatureUnit === "Celsius") {
      setTemperatureUnit("Fahrenheit");
    } else if (temperatureUnit === "Fahrenheit") {
      setTemperatureUnit("Kelvin");
    } else {
      setTemperatureUnit("Celsius");
    }
  };

  const renderTemperature = () => {
    // Renderizar la temperatura con la unidad adecuada
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

  const handleCitySubmit = (event) => {
    // Manejar el envío del formulario
    event.preventDefault();
    if (selectedCity) {
      fetchWeatherByCity(selectedCity);
    }
  };

  useEffect(() => {
    // Efecto secundario para cambiar el modo oscuro o claro
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <section className={`app ${darkMode ? "dark-mode" : ""}`}>
      {/* Botón para alternar entre el modo oscuro y claro */}
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="container">
        <h1>Weather App</h1>
        {/* Formulario para ingresar la ciudad y obtener el clima */}
        <form onSubmit={handleCitySubmit}>
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="Enter city"
          />
          <button type="submit">Get Weather</button>
        </form>
        {/* Mostrar el componente Loader mientras se obtienen los datos del clima */}
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Mostrar los datos del clima */}
            <article className="card">
              {weatherIcon && (
                <img
                  src={`https://openweathermap.org/img/w/${weatherIcon}.png`}
                  alt="Weather Icon"
                />
              )}
              <h2>
                {city}, {country}
              </h2>
              <h3>Temperature: {renderTemperature()}</h3>
              <p>Humidity: {humidity}%</p>
              <p>Wind Speed: {windSpeed} m/s</p>
              <p>Air Pressure: {airPressure} hPa</p>
              <p>Weather Description: {weatherDescription}</p>
            </article>
          </>
        )}
      </div>
      {/* Botón para alternar entre las unidades de temperatura */}
      <button className="switch" onClick={toggleTemperatureUnit}>
        Switch Unit
      </button>
    </section>
  );
};

export default WeatherApp;
