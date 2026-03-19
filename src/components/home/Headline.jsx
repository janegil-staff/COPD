import React from "react";

const Headline = ({ t }) => {
  return (
    <div className="w-full min-[600px]:w-auto min-[600px]:flex-1 min-[600px]:min-w-[300px] min-[600px]:max-w-[580px]">
      <h1
        className="font-bold mb-3 leading-tight"
        style={{
          color: "#268E86",
          fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
          fontFamily: "Georgia, serif",
        }}
      >
        {t.title}
      </h1>
      <p
        className="mb-8 leading-relaxed max-w-[460px]"
        style={{ color: "#268E86", fontSize: "0.97rem" }}
      >
        {t.subtitle}
      </p>
    </div>
  );
};

export default Headline;