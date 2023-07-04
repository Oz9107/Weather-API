import { useState, useEffect } from "react"; // Importar las funciones useState y useEffect de React
import axios from "axios"; // Importar la biblioteca axios
import Loader from "./Loader"; // Importar el componente Loader

const API_KEY = "fd2fd95e5cb8abc849c754b063354de1"; // Clave de API para OpenWeatherMap
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather"; // URL de la API de clima
const API_URL_LOCATION = "https://api.openweathermap.org/geo/1.0/direct"; // URL de la API de ubicación

const WeatherApp = () => {
  const [city, setCity] = useState(""); // Estado para almacenar la ciudad
  const [country, setCountry] = useState(""); // Estado para almacenar el país
  const [weatherIcon, setWeatherIcon] = useState(""); // Estado para almacenar el ícono del clima
  const [temperatureCelsius, setTemperatureCelsius] = useState(null); // Estado para almacenar la temperatura en Celsius
  const [temperatureUnit, setTemperatureUnit] = useState("Celsius"); // Estado para almacenar la unidad de temperatura
  const [humidity, setHumidity] = useState(null); // Estado para almacenar la humedad
  const [windSpeed, setWindSpeed] = useState(null); // Estado para almacenar la velocidad del viento
  const [weatherDescription, setWeatherDescription] = useState(""); // Estado para almacenar la descripción del clima
  const [selectedCity, setSelectedCity] = useState(""); // Estado para almacenar la ciudad seleccionada
  const [darkMode, setDarkMode] = useState(false); // Estado para almacenar el modo oscuro
  const [isLoading, setIsLoading] = useState(true); // Estado para almacenar el estado de carga
  const [airPressure, setAirPressure] = useState(null); // Estado para almacenar la presión atmosférica

  useEffect(() => {
    fetchCityOptions(); // Llamar a la función para obtener las opciones de ciudad al cargar el componente
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchData(selectedCity); // Llamar a la función para obtener los datos del clima cuando la ciudad seleccionada cambie
    }
  }, [selectedCity]);

  // Función para obtener las opciones de ciudad
  const fetchCityOptions = () => {
    axios
      .get(`${API_URL_LOCATION}?q=Bogota&limit=5&appid=${API_KEY}`) // Hacer una solicitud HTTP para obtener las opciones de ciudad
      .then((response) => {
        const cities = response.data.map((city) => city.name); // Extraer el nombre de cada ciudad de la respuesta
        setSelectedCity(cities[0]); // Establecer la primera ciudad como la seleccionada por defecto
      })
      .catch((error) => {
        console.error("Error fetching city options:", error);
      });
  };

  // Función para obtener los datos del clima de una ciudad
  const fetchData = (city) => {
    setIsLoading(true); // Establecer isLoading en true para mostrar el estado de carga

    let locationData;

    axios
      .get(`${API_URL_LOCATION}?q=${city}&limit=5&appid=${API_KEY}`) // Hacer una solicitud HTTP para obtener los datos de ubicación de la ciudad
      .then((responseLocation) => {
        locationData = responseLocation.data[0]; // Obtener los datos de ubicación de la primera ciudad de la respuesta

        return axios.get(
          `${API_URL_WEATHER}?lat=${locationData.lat}&lon=${locationData.lon}&appid=${API_KEY}`
        ); // Hacer una solicitud HTTP para obtener los datos del clima basados en la latitud y longitud de la ubicación
      })
      .then((responseWeather) => {
        const weatherData = responseWeather.data; // Obtener los datos del clima de la respuesta

        // Actualizar los estados con los datos obtenidos
        setCity(locationData.name);
        setCountry(locationData.country);
        setWeatherIcon(weatherData.weather[0].icon);
        setTemperatureCelsius(weatherData.main.temp - 273.15);
        setHumidity(weatherData.main.humidity);
        setWindSpeed(weatherData.wind.speed);
        setWeatherDescription(weatherData.weather[0].description);
        setAirPressure(weatherData.main.pressure);

        setIsLoading(false); // Establecer isLoading en false para ocultar el estado de carga
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  // Función para alternar la unidad de temperatura
  const toggleTemperatureUnit = () => {
    if (temperatureUnit === "Celsius") {
      setTemperatureUnit("Fahrenheit");
    } else if (temperatureUnit === "Fahrenheit") {
      setTemperatureUnit("Kelvin");
    } else {
      setTemperatureUnit("Celsius");
    }
  };

  // Función para convertir una temperatura a Fahrenheit
  const convertToFahrenheit = (temperature) => {
    return (temperature * 9) / 5 + 32;
  };

  // Función para convertir una temperatura a Kelvin
  const convertToKelvin = (temperature) => {
    return temperature + 273.15;
  };

  // Función para renderizar la temperatura con la unidad correcta
  const renderTemperature = () => {
    if (temperatureCelsius === null) {
      return null;
    }

    let temperatureValue = temperatureCelsius;

    if (temperatureUnit === "Fahrenheit") {
      temperatureValue = convertToFahrenheit(temperatureValue);
    } else if (temperatureUnit === "Kelvin") {
      temperatureValue = convertToKelvin(temperatureValue);
    }

    return `${temperatureValue.toFixed(1)} ${temperatureUnit}`;
  };

  // Función para manejar el envío del formulario de la ciudad
  const handleCitySubmit = (event) => {
    event.preventDefault();
    if (selectedCity) {
      fetchData(selectedCity); // Obtener los datos del clima cuando se envía el formulario
    }
  };

  // Función para alternar el modo oscuro
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode"); // Aplicar clase "dark-mode" al cuerpo del documento si el modo oscuro está activado
    } else {
      document.body.classList.remove("dark-mode"); // Quitar la clase "dark-mode" del cuerpo del documento si el modo oscuro está desactivado
    }
  }, [darkMode]);

  return (
    <section className={`app ${darkMode ? "dark-mode" : ""}`}>
      <button className="dark-mode-toggle" onClick={handleDarkModeToggle}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="container">
        <h1>Weather App</h1>
        <form onSubmit={handleCitySubmit}>
          <input
            type="text"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            placeholder="Enter city"
          />
          <button type="submit">Get Weather</button>
        </form>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {temperatureCelsius !== null && (
              <article className="card">
                {weatherIcon && (
                  <img
                    src={`https://openweathermap.org/img/w/${weatherIcon}.png`}
                    alt="Weather Icon"
                  />
                )}
                {city && country && (
                  <h2>
                    {city}, {country}
                  </h2>
                )}
                <h3>Temperature: {renderTemperature()}</h3>
                <p>Humidity: {humidity}%</p>
                <p>Wind Speed: {windSpeed} m/s</p>
                <p>Air Pressure: {airPressure} hPa</p>
                <p>Weather Description: {weatherDescription}</p>
              </article>
            )}
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
