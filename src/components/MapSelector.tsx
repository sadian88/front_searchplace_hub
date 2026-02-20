import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, RotateCcw, Trash2, MapPin } from 'lucide-react';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
    searchType: 'default' | 'circle' | 'polygon';
    latitude: number;
    longitude: number;
    radius: number;
    polygonPoints: [number, number][];
    onLocationChange: (lat: number, lng: number, address?: string) => void;
    onRadiusChange: (radius: number) => void;
    onPolygonChange: (points: [number, number][]) => void;
}

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({
    searchType,
    latitude,
    longitude,
    radius,
    polygonPoints,
    onLocationChange,
    onRadiusChange,
    onPolygonChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const defaultCenter: [number, number] = [4.6097, -74.0817]; // Bogotá
    const isValidCoord = (val: any) => val !== null && val !== undefined && val !== '' && !isNaN(parseFloat(val));
    const center: [number, number] = isValidCoord(latitude) && isValidCoord(longitude)
        ? [parseFloat(latitude as any), parseFloat(longitude as any)]
        : defaultCenter;

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
                // Return a simplified address if possible
                const address = data.address;
                const city = address.city || address.town || address.village || '';
                const road = address.road || '';
                const displayName = road ? `${road}, ${city}` : data.display_name;
                return displayName;
            }
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
        }
        return `Ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (searchType === 'circle' || searchType === 'default') {
            const address = await reverseGeocode(lat, lng);
            onLocationChange(lat, lng, address);
        } else if (searchType === 'polygon') {
            onPolygonChange([...polygonPoints, [lat, lng]]);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
            }
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const undoPolygon = () => {
        onPolygonChange(polygonPoints.slice(0, -1));
    };

    return (
        <div className="space-y-6">
            {/* Search Bar - Changed from form to div to avoid nested form issues */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                    type="text"
                    placeholder="Buscar ciudad o dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-2xl pl-10 pr-24 py-3 text-sm focus:border-zinc-400 outline-none transition-all shadow-sm"
                />
                <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                    {isSearching ? '...' : 'Buscar'}
                </button>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-xl h-80 z-0 bg-white">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ChangeView center={center} />
                    <MapEvents onMapClick={handleMapClick} />

                    {(searchType === 'default' || searchType === 'circle') && latitude && longitude && (
                        <>
                            <Marker position={[latitude, longitude]} />
                            {searchType === 'circle' && radius > 0 && (
                                <Circle
                                    center={[latitude, longitude]}
                                    radius={radius * 1000}
                                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}
                                />
                            )}
                        </>
                    )}

                    {searchType === 'polygon' && polygonPoints.length > 0 && (
                        <>
                            <Polygon
                                positions={polygonPoints}
                                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}
                            />
                            {polygonPoints.map((point, idx) => (
                                <Marker key={idx} position={point} />
                            ))}
                        </>
                    )}
                </MapContainer>

                {/* Map Overlay Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                    {searchType === 'polygon' && polygonPoints.length > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={undoPolygon}
                                className="p-2 bg-white/90 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all shadow-md backdrop-blur-sm"
                                title="Deshacer último punto"
                            >
                                <RotateCcw size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onPolygonChange([])}
                                className="p-2 bg-white/90 border border-zinc-200 text-rose-500 rounded-xl hover:bg-zinc-100 transition-all shadow-md backdrop-blur-sm"
                                title="Limpiar polígono"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Radius Control - Styled as per Reference */}
            {searchType === 'circle' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-2 duration-300 shadow-sm transition-all hover:border-zinc-300">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-zinc-900">Radio local personalizado</h4>
                        <p className="text-xs text-zinc-500">Ajusta la distancia específica de búsqueda para este proceso.</p>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={radius}
                            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                        <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                            <span>1 km</span>
                            <span>100 km</span>
                        </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kilómetros</label>
                        <input
                            type="number"
                            value={radius}
                            onChange={(e) => onRadiusChange(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-transparent text-xl font-black text-zinc-900 outline-none"
                        />
                    </div>
                </div>
            )}

            {searchType === 'polygon' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:border-zinc-300 transition-all">
                    <div className="p-2.5 bg-zinc-900 rounded-xl text-white shadow-lg">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-zinc-900 uppercase tracking-tight">Modo Polígono Activo</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Haz clic en el mapa para añadir puntos. El polígono se cerrará automáticamente.</p>
                        <p className="text-[10px] text-zinc-900 mt-2 font-black bg-zinc-100 w-fit px-2 py-0.5 rounded-full">{polygonPoints.length} puntos seleccionados</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapSelector;
