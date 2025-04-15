import React from "react";
import "./WeatherScreen.scss";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { BiSearchAlt } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";

function SearchHistory({ history, onSearchAgain, onDelete }) {
  return (
    <div className="search-history">
      <h2 className="mb-3 centered-row">Search History</h2>
      <div class="container">
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={index}>
              <Row>
                <Col xs="auto">
                  {" "}
                  {entry.countryName && entry.cityName ? (
                    <span className="city-name">
                      {entry.cityName}, {entry.countryName}
                    </span>
                  ) : entry.cityName ? (
                    <span className="city-name">{entry.cityName}</span>
                  ) : (
                    <span className="city-name">{entry.countryName}</span>
                  )}
                </Col>
                <Col className="sh-list">
                  <span className="small-font">
                    {entry.searchHistoryTimeStamp}
                  </span>
                </Col>
                <Col xs="auto">
                  {" "}
                  <BiSearchAlt
                    className="mt-1"
                    onClick={() => onSearchAgain(entry)}
                  />
                </Col>
                <Col xs="auto">
                  <RiDeleteBinLine
                    className="mt-1"
                    onClick={() => onDelete(entry)}
                  />
                </Col>
              </Row>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchHistory;
