"use client";

import { io } from "socket.io-client";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";

import { useEffect, useState } from "react";

interface Worker {
    id: string;
    lat: number;
    lng: number;
    name: string;
}

const center = {
    lat: 3.451647, // Coordenadas de cali por defecto
    lng: -76.531985,
};
const socket = io("https://smart-routes-production.up.railway.app/locations", {
    transports: ["websocket"],
    reconnection: true,
});

export default function MapComponent() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Conectado al servidor Socket.IO:", socket.id);
        });

        socket.on("locationUpdate", (location: Worker) => {
            console.log("📍 Nueva ubicación recibida:", location);


            const parsedLocation: Worker = {
                ...location,
                lat: Number(location.lat),
                lng: Number(location.lng),
            };

            setWorkers((prev) => {
                const existing = prev.find((w) => w.id === parsedLocation.id);
                if (existing) {
                    return prev.map((w) =>
                        w.id === parsedLocation.id ? parsedLocation : w
                    );
                } else {
                    return [...prev, parsedLocation];
                }
            });
        });

        // Limpieza al desmontar
        return () => {
            socket.off("connect");
            socket.off("locationUpdate");
            socket.disconnect();
        };
    }, []);

    if (!isLoaded) return <p className="text-center">Cargando mapa...</p>;

    return (
        <div className="w-full h-[750px] relative ">
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={13}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {workers.map((worker) => (
                    <Marker
                        key={worker.id}
                        position={{ lat: worker.lat, lng: worker.lng }}
                        onClick={() => setSelectedWorker(worker)} // Al hacer clic se selecciona
                        title={`Ejecutivo: ${worker.name}`}
                    />
                ))}

                {/* Mostrar InfoWindow si hay un trabajador seleccionado */}
                {selectedWorker && (
                    <InfoWindow
                        position={{ lat: selectedWorker?.lat, lng: selectedWorker?.lng }}
                        onCloseClick={() => setSelectedWorker(null)}
                    >
                        <div className="bg-white p-3 rounded-lg shadow-lg min-w-[150px]">
                            <h4 className="font-bold text-blue-700">{selectedWorker?.name}</h4>
                            <p className="text-sm text-gray-700">Lat: {selectedWorker?.lat}</p>
                            <p className="text-sm text-gray-700">Lng: {selectedWorker?.lng}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>

    );
}
