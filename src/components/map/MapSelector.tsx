import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, RotateCcw, Trash2, MapPin } from 'lucide-react';

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
    useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
    return null;
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
    return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({
    searchType, latitude, longitude, radius, polygonPoints,
    onLocationChange, onRadiusChange, onPolygonChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const defaultCenter: [number, number] = [4.6097, -74.0817];
    const isValidCoord = (val: any) => val !== null && val !== undefined && val !== '' && !isNaN(parseFloat(val));
    const center: [number, number] = isValidCoord(latitude) && isValidCoord(longitude)
        ? [parseFloat(latitude as any), parseFloat(longitude as any)]
        : defaultCenter;

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data?.display_name) {
                const address = data.address;
                const city = address.city || address.town || address.village || '';
                const road = address.road || '';
                return road ? `${road}, ${city}` : data.display_name;
            }
        } catch (error) { console.error('Reverse geocode error:', error); }
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
            if (data?.length > 0) {
                const { lat, lon, display_name } = data[0];
                onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
            }
        } catch (error) { console.error('Search error:', error); }
        finally { setIsSearching(false); }
    };

    return (
        <div className="space-y-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                    type="text"
                    placeholder="Buscar ciudad o dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-24 py-2.5 text-sm focus:border-brand-300 outline-none transition-all"
                />
                <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {isSearching ? '...' : 'Buscar'}
                </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg h-80 z-0">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <ChangeView center={center} />
                    <MapEvents onMapClick={handleMapClick} />
                    {(searchType === 'default' || searchType === 'circle') && latitude && longitude && (
                        <>
                            <Marker position={[latitude, longitude]} />
                            {searchType === 'circle' && radius > 0 && (
                                <Circle center={[latitude, longitude]} radius={radius * 1000}
                                    pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.15, weight: 2 }} />
                            )}
                        </>
                    )}
                    {searchType === 'polygon' && polygonPoints.length > 0 && (
                        <>
                            <Polygon positions={polygonPoints}
                                pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.15, weight: 2 }} />
                            {polygonPoints.map((point, idx) => <Marker key={idx} position={point} />)}
                        </>
                    )}
                </MapContainer>
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
                    {searchType === 'polygon' && polygonPoints.length > 0 && (
                        <>
                            <button type="button" onClick={() => onPolygonChange(polygonPoints.slice(0, -1))}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 transition-all shadow-md backdrop-blur-sm"
                                title="Deshacer último punto">
                                <RotateCcw size={16} />
                            </button>
                            <button type="button" onClick={() => onPolygonChange([])}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-rose-500 rounded-xl hover:bg-gray-100 transition-all shadow-md backdrop-blur-sm"
                                title="Limpiar polígono">
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {searchType === 'circle' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white/90">Radio de búsqueda</h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Ajusta la distancia específica de búsqueda.</p>
                    </div>
                    <input type="range" min="1" max="100" step="1" value={radius}
                        onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>1 km</span><span>100 km</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg p-3 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Kilómetros</label>
                        <input type="number" value={radius}
                            onChange={(e) => onRadiusChange(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-transparent text-xl font-bold text-gray-800 dark:text-white/90 outline-none" />
                    </div>
                </div>
            )}

            {searchType === 'polygon' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2.5 bg-gray-800 dark:bg-gray-600 rounded-lg text-white">
                        <MapPin size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-white/90 uppercase tracking-tight">Modo Polígono Activo</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">Haz clic en el mapa para añadir puntos.</p>
                        <p className="text-[11px] text-gray-700 dark:text-white/90 mt-1.5 font-bold bg-gray-100 dark:bg-gray-700 w-fit px-2 py-0.5 rounded-full">{polygonPoints.length} puntos</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapSelector;
