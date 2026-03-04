import LoginCard from "@/components/loginCard";

export default function App() {
  return (
    // Losse fallback shell; routing gebeurt in main.jsx.
    <section className="p-8 flex items-center justify-center min-h-screen w-screen bg-gray-100">
      <LoginCard />
    </section>
  );
}
