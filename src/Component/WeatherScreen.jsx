import React, { Component } from "react";
import moment from "moment";
import SearchHistory from "./SearchHistory";
import { toast } from "react-toastify";

// Bootstrap
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import "./WeatherScreen.scss";
import { BiSearchAlt } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { CiLocationOn } from "react-icons/ci";
import Image from "react-bootstrap/Image";
import { BsSun, BsMoonStars } from "react-icons/bs";

class Weather extends Component {
  constructor() {
    super();
    this.state = {
      weatherData: null,
      loading: true,
      currentTime: new Date(),
      apiKey: "06a17fbd827afd00eda7804891ec5c19",
      lat: 1.29027, // On default set to Singapore lat and lon
      lon: 103.851959,
      cityName: "",
      countryName: "",
      combineCityCountry: "",
      history: [],
      notFound: false,
      searchHistoryTimeStamp: new Date(),
      greeting: "",
      cloudImg: "",
    };
  }

  componentDidMount() {
    this.weatherDataCall();
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 12 && currentHour <= 18) {
      return this.setState({ greeting: "Good Afternoon!" });
    } else if (currentHour > 18 && currentHour <= 23) {
      return this.setState({ greeting: "Good Evening!" });
    } else {
      return this.setState({ greeting: "Good Morning!" });
    }
  }

  weatherDataCall = () => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}&units=metric`;
    xhr.open("GET", url, true);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data) {
          this.setState({
            weatherData: data,
            loading: false,
            cloudImg: data.weather[0].description,
            currentTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
          });
        } else {
          toast.error("No such City or Country!");
        }
      } else {
        this.setState({ loading: false });
        console.error("Error fetching weather data.");
      }
    };
    xhr.send();
  };

  // As OpenWeather does not have build-in lat and lon
  // Will need to find via city/countrycode to get the lat and lon
  convertCountryCityToLatLon = () => {
    const xhr = new XMLHttpRequest();
    let url = null;
    if (this.state.cityName !== "" && this.state.countryName !== "") {
      url = `http://api.openweathermap.org/geo/1.0/direct?q=${this.state.cityName},${this.state.countryName}&appid=${this.state.apiKey}`;
    } else if (this.state.cityName) {
      url = `http://api.openweathermap.org/geo/1.0/direct?q=${this.state.cityName}&appid=${this.state.apiKey}`;
    } else if (this.state.countryName) {
      url = `http://api.openweathermap.org/geo/1.0/direct?q=${this.state.countryName}&appid=${this.state.apiKey}`;
    }
    xhr.open("GET", url, true);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.length !== 0) {
          this.setState(
            {
              loading: false,
              lat: data[0].lat,
              lon: data[0].lon,
              notFound: false,
            },
            () => {
              this.weatherDataCall();
            }
          );
        } else {
          toast.error("No such City or Country!");
          this.setState({ notFound: true });
        }
      } else {
        this.setState({ loading: false });
        console.error("Error fetching weather data.");
      }
    };
    xhr.send();
  };

  handleCityChange = (e) => {
    this.setState({ cityName: e.target.value });
  };
  handleCountryChange = (e) => {
    this.setState({ countryName: e.target.value });
  };

  // Current Search
  handleSearch = () => {
    if (this.state.countryName || this.state.cityName) {
      this.convertCountryCityToLatLon();
      const newHistoryEntry = {
        cityName: this.state.cityName,
        countryName: this.state.countryName,
        searchHistoryTimeStamp: moment().format("MMMM Do YYYY, h:mm:ss a"),
      };
      this.setState((prevState) => ({
        // For search history
        history: [newHistoryEntry, ...prevState.history],
      }));
    } else {
      toast.error("Please enter either City or Country");
    }
  };

  handleReset = () => {
    this.setState({ cityName: "", countryName: "" });
  };

  // History Search
  handleHistorySearch = async (entry) => {
    await this.setState({
      cityName: entry.cityName,
      countryName: entry.countryName,
    });
    if (this.state.countryName || this.state.cityName) {
      this.convertCountryCityToLatLon();
    } else {
      toast.error("No such City or Country!");
    }
  };

  handleDelete = (entry) => {
    this.setState((prevState) => ({
      history: prevState.history.filter((item) => item !== entry),
    }));
  };

  // e.g. change from broken clouds to Broken Clouds
  toCapsWord = (inputString) => {
    const words = inputString.split(/[^a-zA-Z0-9]+/);
    const camelCasedWithSpaces = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return camelCasedWithSpaces;
  };

  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.handleSearch();
    }
  };

  render() {
    const { weatherData, loading } = this.state;
    const { isDarkMode, toggleTheme } = this.props;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!weatherData) {
      return <div>Error loading weather data</div>;
    }

    return (
      <div>
        <div>
          <Row className="mb-3 ws-search-header centered-row">
            <Col xs="auto">
              <Form.Floating className="mb-3 ">
                <Form.Control
                  id="floatingInputCustom"
                  type="text"
                  placeholder="City"
                  onChange={this.handleCityChange}
                  value={this.state.cityName}
                  className="ws-form-background"
                  onKeyDown={this.handleKeyPress}
                />
                <label
                  htmlFor="floatingInputCustom"
                  className="ws-search-label "
                >
                  City
                </label>
              </Form.Floating>
            </Col>
            <Col xs="auto">
              <Form.Floating className="mb-3">
                <Form.Control
                  id="floatingInputCustom"
                  type="text"
                  placeholder="Country"
                  onChange={this.handleCountryChange}
                  value={this.state.countryName}
                  className="ws-form-background"
                  onKeyDown={this.handleKeyPress}
                />
                <label
                  htmlFor="floatingInputCustom"
                  className=" ws-search-label"
                >
                  Country Code
                </label>
              </Form.Floating>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-light"
                className="mt-2"
                onClick={this.handleSearch}
              >
                <BiSearchAlt />
              </Button>
              <br></br>
              <label className="ws-button-label">Search</label>
            </Col>
            <Col xs="auto" className="mt-2">
              <Button variant="outline-light" onClick={this.handleReset}>
                <RxCross2 />
              </Button>
              <br></br>
              <label className="ws-button-label">Clear</label>
            </Col>
            <Col xs="auto" className="mt-2">
              {isDarkMode ? (
                <Button
                  variant="outline-light"
                  title="Dark theme"
                  onClick={toggleTheme}
                >
                  <BsMoonStars />
                </Button>
              ) : (
                <Button
                  variant="outline-light"
                  title="Light theme"
                  onClick={toggleTheme}
                >
                  <BsSun />
                </Button>
              )}
              <br></br>
              <label className="ws-button-label">Theme</label>
            </Col>
          </Row>
        </div>

        {!this.state.notFound ? (
          <div className="container">
            <h2>Today's Weather</h2>
            <h3>{this.state.greeting}</h3>
            <p>
              <CiLocationOn />
              {weatherData.name}, {weatherData.sys.country}
            </p>
            <Row>
              <Col>
                <p>Temperature</p>
                <h1 className="temp-color">
                  {Math.round(weatherData.main.temp)}°C
                </h1>
              </Col>
              <Col>
                <Image
                  src={
                    this.state.cloudImg.includes("clouds") ||
                    this.state.cloudImg.includes("thunderstorm") ||
                    this.state.cloudImg.includes("rain") ||
                    this.state.cloudImg.includes("drizzle")
                      ? "/cloud.png"
                      : "/sun.png"
                  }
                  style={{ width: "200px", height: "150px" }}
                />{" "}
              </Col>
            </Row>
            <Row>
              <Col>
                <p>
                  H:{Math.round(weatherData.main.temp_max)}°C L:
                  {Math.round(weatherData.main.temp_min)}°C
                </p>
              </Col>
              <Col>
                <p>
                  Description:{" "}
                  {this.toCapsWord(weatherData.weather[0].description)}
                </p>
              </Col>
            </Row>

            <p>Humidity: {weatherData.main.humidity}</p>
            <p>Time: {this.state.currentTime}</p>
          </div>
        ) : null}

        <div>
          <SearchHistory
            history={this.state.history}
            onSearchAgain={this.handleHistorySearch}
            onDelete={this.handleDelete}
          />
        </div>
      </div>
    );
  }
}

export default Weather;
