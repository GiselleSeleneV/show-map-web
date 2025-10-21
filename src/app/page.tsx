import MapComponent from "@/components/MapComponent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] p-6">
      <h1 className="text-3xl font-semibold text-gray-100 mb-6">
        Ubicación de Ejecutivos en tiempo real
      </h1>
      <MapComponent />
    </main>
  );
}