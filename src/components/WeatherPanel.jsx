import { useState, useEffect } from "react";
import axios from "axios";
import Louder from "./Loader";

const API_KEY = "fd2fd95e5cb8abc849c754b063354de1";
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather";
const API_URL_LOCATION = "https://api.openweathermap.org/geo/1.0/direct";

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

  useEffect(() => {
    fetchCityOptions();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchData(selectedCity);
    }
  }, [selectedCity]);

  const fetchCityOptions = () => {
    axios
      .get(`${API_URL_LOCATION}?q=Bogota&limit=5&appid=${API_KEY}`)
      .then((response) => {
        const cities = response.data.map((city) => city.name);
        setSelectedCity(cities[0]);
      })
      .catch((error) => {
        console.error("Error fetching city options:", error);
      });
  };

  const fetchData = (city) => {
    setIsLoading(true);

    let locationData;

    axios
      .get(`${API_URL_LOCATION}?q=${city}&limit=5&appid=${API_KEY}`)
      .then((responseLocation) => {
        locationData = responseLocation.data[0];

        return axios.get(
          `${API_URL_WEATHER}?lat=${locationData.lat}&lon=${locationData.lon}&appid=${API_KEY}`
        );
      })
      .then((responseWeather) => {
        const weatherData = responseWeather.data;

        setCity(locationData.name);
        setCountry(locationData.country);
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
    if (temperatureUnit === "Celsius") {
      setTemperatureUnit("Fahrenheit");
    } else if (temperatureUnit === "Fahrenheit") {
      setTemperatureUnit("Kelvin");
    } else {
      setTemperatureUnit("Celsius");
    }
  };

  const convertToFahrenheit = (temperature) => {
    return (temperature * 9) / 5 + 32;
  };

  const convertToKelvin = (temperature) => {
    return temperature + 273.15;
  };

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

  const handleCitySubmit = (event) => {
    event.preventDefault();
    if (selectedCity) {
      fetchData(selectedCity);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
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
          <Louder />
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
