import React from "react";

type ProgressCircleProps = {
  size?: number;
};

const ProgressCircle: React.FC<ProgressCircleProps> = ({ size = 50 }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="relative">
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-500 opacity-50 animate-ping"
          style={{ animationDuration: "1.5s" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-500 opacity-50 animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-500 opacity-50 animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "1s" }}
        />
        <div className="relative w-20 h-20 rounded-full bg-purple-500" />
      </div>
    </div>
  );
};

export default ProgressCircle;
