import React from "react";

const Loader = ({ size = 50, fullScreen = false }) => {
  return (
    <div
      className={fullScreen ? "loader-fullscreen" : "loader-container"}
      style={!fullScreen ? { height: "150px" } : {}}
    >
      <div
        className="loader-ring"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

export default Loader;