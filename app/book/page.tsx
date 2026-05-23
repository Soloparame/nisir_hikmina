import dynamic from "next/dynamic";

const BookFlow = dynamic(() => import("../../components/BookFlow"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: "4rem 2rem",
        textAlign: "center",
        color: "#004D4D",
      }}
    >
      በመጫን ላይ...
    </div>
  ),
});

export default function BookPage() {
  return <BookFlow />;
}
