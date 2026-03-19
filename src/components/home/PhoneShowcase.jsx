import Image from "next/image";

export default function PhoneShowcase({ t }) {
  return (
    <div className="w-full min-[600px]:flex-1 min-[600px]:min-w-[300px] min-[600px]:max-w-[580px]">
      <div className="flex items-end gap-3 justify-center min-[600px]:justify-start">
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
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 22 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}