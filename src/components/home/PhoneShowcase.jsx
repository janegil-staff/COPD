import Image from "next/image";

export default function PhoneShowcase({ t }) {
  return (
    <div className="flex-1 min-w-[300px] max-w-[580px] order-2 min-[600px]:order-1">
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

      <div className="flex items-end gap-3">
        {[
          { src: "/screen4.png", alt: "Login" },
          { src: "/screen2.png", alt: "Calendar", lift: true },
          { src: "/screen1.png", alt: "Charts" },
        ].map(({ src, alt, lift }) => (
          <div
            key={src}
            className="flex-shrink-0 overflow-hidden shadow-2xl"
            style={{
              width: 160,
              marginBottom: lift ? 24 : 0,
              border: "6px solid #1a1a1a",
              borderRadius: 28,
              background: "#1a1a1a",
            }}
          >
            <Image
              height={300}
              width={130}
              src={src}
              alt={alt}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 22,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
