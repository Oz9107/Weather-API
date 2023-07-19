
const WeatherIcon = ({ iconCode }) => {
  const getWeatherIconUrl = (iconCode) => {
    switch (iconCode) {
      case "01d":
      case "01n":
        return "/Images/01d.png";
      case "02d":
      case "02n":
        return "/Images/02d.png";
      case "03d":
      case "03n":
        return "/Images/03d.png";
      case "04d":
      case "04n":
        return "/Images/04d.png";
      case "09d":
      case "09n":
        return "/Images/09d.png";
      case "10d":
      case "10n":
        return "/Images/10d.png";
      case "11d":
      case "11n":
        return "/Images/11d.png";
      case "13d":
      case "13n":
        return "/Images/13d.png";
      case "50d":
      case "50n":
        return "/Images/50d.png";
      default:
        return "";
    }
  };

  return <img src={getWeatherIconUrl(iconCode)} alt="Weather Icon" />;
};

export default WeatherIcon;
