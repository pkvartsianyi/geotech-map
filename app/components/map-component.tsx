"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom icons for different place types
const createCustomIcon = (type: string, isSelected = false) => {
  const colors = {
    Historic: "#f59e0b",
    Cultural: "#8b5cf6",
    Nature: "#10b981",
    Modern: "#3b82f6",
    Religious: "#f43f5e",
    Landmark: "#f97316",
  }

  const color = colors[type as keyof typeof colors] || "#6b7280"
  const size = isSelected ? 35 : 25

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? "14px" : "12px"};
        ${isSelected ? "animation: pulse 2s infinite;" : ""}
      ">
        📍
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface Place {
  id: string
  name: string
  description: string
  type: string
  coordinates: [number, number]
}

interface City {
  id: string
  name: string
  country: string
  coordinates: [number, number]
  zoom: number
}

interface MapComponentProps {
  city: City
  places: Place[]
  selectedPlace: Place | null
  onPlaceSelect: (place: Place) => void
}

// Component to handle map view changes
function MapController({ city }: { city: City }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(city.coordinates, city.zoom, {
      duration: 1.5,
      easeLinearity: 0.1,
    })
  }, [city, map])

  return null
}

export default function MapComponent({ city, places, selectedPlace, onPlaceSelect }: MapComponentProps) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={city.coordinates}
        zoom={city.zoom}
        className="h-full w-full rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController city={city} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* City center marker */}
        <Marker
          position={city.coordinates}
          icon={L.divIcon({
            html: `
              <div style="
                background-color: #dc2626;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                animation: pulse 2s infinite;
              ">
                🏙️
              </div>
              <style>
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
              </style>
            `,
            className: "city-marker",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{city.name}</h3>
              <p className="text-sm text-gray-600">{city.country}</p>
              <p className="text-xs text-gray-500 mt-1">City Center</p>
            </div>
          </Popup>
        </Marker>

        {/* Place markers - now filtered */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={createCustomIcon(place.type, selectedPlace?.id === place.id)}
            eventHandlers={{
              click: () => onPlaceSelect(place),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base pr-2">{place.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      place.type === "Historic"
                        ? "bg-amber-100 text-amber-800"
                        : place.type === "Cultural"
                          ? "bg-purple-100 text-purple-800"
                          : place.type === "Nature"
                            ? "bg-green-100 text-green-800"
                            : place.type === "Modern"
                              ? "bg-blue-100 text-blue-800"
                              : place.type === "Religious"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {place.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
