"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ExternalLink, Github, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("./components/map-component"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />,
})

interface Place {
  id: string
  name: string
  description: string
  type: string
  coordinates: [number, number] // [lat, lng]
}

interface City {
  id: string
  name: string
  country: string
  coordinates: [number, number] // [lat, lng]
  places: Place[]
  zoom: number
}

const cities: City[] = [
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    coordinates: [38.7223, -9.1393],
    zoom: 12,
    places: [
      {
        id: "belem-tower",
        name: "Belém Tower",
        description: "Historic fortress and UNESCO World Heritage site",
        type: "Historic",
        coordinates: [38.6916, -9.216],
      },
      {
        id: "rossio-square",
        name: "Rossio Square",
        description: "Central square with beautiful wave-pattern cobblestones",
        type: "Landmark",
        coordinates: [38.7139, -9.1394],
      },
      {
        id: "alfama",
        name: "Alfama District",
        description: "Historic neighborhood with narrow streets and Fado music",
        type: "Cultural",
        coordinates: [38.7139, -9.1333],
      },
      {
        id: "lx-factory",
        name: "LX Factory",
        description: "Creative hub with shops, restaurants, and art spaces",
        type: "Modern",
        coordinates: [38.7041, -9.1758],
      },
    ],
  },
  {
    id: "munster",
    name: "Münster",
    country: "Germany",
    coordinates: [51.9607, 7.6261],
    zoom: 13,
    places: [
      {
        id: "prinzipalmarkt",
        name: "Prinzipalmarkt",
        description: "Historic market square with gabled houses",
        type: "Historic",
        coordinates: [51.9625, 7.6287],
      },
      {
        id: "munster-cathedral",
        name: "Münster Cathedral",
        description: "Gothic cathedral with astronomical clock",
        type: "Religious",
        coordinates: [51.963, 7.6251],
      },
      {
        id: "aasee",
        name: "Aasee Lake",
        description: "Artificial lake perfect for recreation and cycling",
        type: "Nature",
        coordinates: [51.9478, 7.6114],
      },
      {
        id: "lwl-museum",
        name: "LWL Museum",
        description: "Natural history museum with planetarium",
        type: "Cultural",
        coordinates: [51.9542, 7.6058],
      },
    ],
  },
  {
    id: "castellon",
    name: "Castellón",
    country: "Spain",
    coordinates: [39.9864, -0.0513],
    zoom: 12,
    places: [
      {
        id: "fadrell-castle",
        name: "Fadrell Castle",
        description: "Medieval castle ruins with panoramic views",
        type: "Historic",
        coordinates: [39.9925, -0.0347],
      },
      {
        id: "grau-beach",
        name: "El Grau Beach",
        description: "Beautiful Mediterranean beach near the city",
        type: "Nature",
        coordinates: [39.9775, -0.0347],
      },
      {
        id: "mayor-square",
        name: "Plaza Mayor",
        description: "Main square with City Hall and Santa María Cathedral",
        type: "Landmark",
        coordinates: [39.9864, -0.0513],
      },
      {
        id: "ribalta-park",
        name: "Ribalta Park",
        description: "Large urban park perfect for relaxation",
        type: "Nature",
        coordinates: [39.9889, -0.0444],
      },
    ],
  },
]

const typeColors = {
  Historic: "bg-amber-100 text-amber-800",
  Cultural: "bg-purple-100 text-purple-800",
  Nature: "bg-green-100 text-green-800",
  Modern: "bg-blue-100 text-blue-800",
  Religious: "bg-rose-100 text-rose-800",
  Landmark: "bg-orange-100 text-orange-800",
}

export default function Map() {
  const year = new Date().getFullYear()
  const [selectedCity, setSelectedCity] = useState<string>("lisbon")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Historic",
    "Cultural",
    "Nature",
    "Modern",
    "Religious",
    "Landmark",
  ])
  const [mapKey, setMapKey] = useState(0)

  const currentCity = cities.find((city) => city.id === selectedCity)

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId)
    setSelectedPlace(null)
    setMapKey((prev) => prev + 1) // Force map re-render for smooth transition
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const filteredPlaces = currentCity?.places.filter((place) => selectedCategories.includes(place.type)) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Geotech Places</h1>
              <p className="text-sm text-gray-600">Discover places in program cities</p>
            </div>
            <div className="flex gap-2">
              {cities.map((city) => (
                <Button
                  key={city.id}
                  variant={selectedCity === city.id ? "default" : "outline"}
                  onClick={() => handleCityChange(city.id)}
                  className="transition-all duration-300"
                >
                  {city.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Category Filters */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeColors).map(([category, colorClass]) => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category)}
                className={`transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? colorClass.replace("bg-", "bg-").replace("text-", "text-")
                    : ""
                }`}
              >
                {category} ({currentCity?.places.filter((p) => p.type === category).length || 0})
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategories(Object.keys(typeColors))}
              className="text-blue-600 hover:text-blue-800"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategories([])}
              className="text-red-600 hover:text-red-800"
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Map Area - Now takes 3/4 of the screen */}
          <div className="xl:col-span-3">
            <Card className="h-[700px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {currentCity?.name}, {currentCity?.country}
                  <span className="text-sm font-normal text-gray-500">({filteredPlaces.length} places shown)</span>
                </CardTitle>
                <CardDescription>Click on the markers to explore places</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full">
                  {currentCity && (
                    <MapComponent
                      key={`${mapKey}-${selectedCategories.join(",")}`}
                      city={currentCity}
                      places={filteredPlaces}
                      selectedPlace={selectedPlace}
                      onPlaceSelect={setSelectedPlace}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Places List - Now takes 1/4 of the screen */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Places in {currentCity?.name}
              <span className="text-sm font-normal text-gray-500 block">
                {filteredPlaces.length} of {currentCity?.places.length} places
              </span>
            </h2>
            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">No places match the selected categories.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategories(Object.keys(typeColors))}
                    className="mt-2"
                  >
                    Show All Categories
                  </Button>
                </Card>
              ) : (
                filteredPlaces.map((place) => (
                  <Card
                    key={place.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPlace?.id === place.id ? "ring-2 ring-blue-500 shadow-md" : ""
                    }`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{place.name}</CardTitle>
                        <Badge className={`text-xs ${typeColors[place.type as keyof typeof typeColors]}`}>
                          {place.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">{place.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left"></div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://mastergeotech.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Program Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/pkvartsianyi/geotech-map"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p>© {year} Geotech Program. Discover amazing places in Lisbon, Münster, and Castellón.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
