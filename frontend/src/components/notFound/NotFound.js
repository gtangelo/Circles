import React from "react";
import notFound from "../../images/404.svg";
import { Button } from "antd";
import { Link } from "react-router-dom";
import "./notFound.less";

function NotFound({ setLoading }) {
  return (
    <div className="mainContainer">
      <img src={notFound} alt="" />
      <Link to="/">
        <Button type="primary" size="large" onClick={() => setLoading(true)}>
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}

export default NotFound;
