/**
 * Serviço de Geocoding - Converte endereço em coordenadas
 * Usa Google Maps Geocoding API e OpenStreetMap Nominatim como fallback
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

/**
 * Converte endereço em coordenadas usando Nominatim (OpenStreetMap)
 * API gratuita, sem necessidade de chave
 */
export const geocodeAddress = async (
  street: string,
  number: string,
  neighborhood: string,
  city: string,
  state: string,
  zipCode?: string
): Promise<GeocodingResult | null> => {
  try {
    // Monta o endereço completo
    const parts = [
      number && street ? `${street}, ${number}` : street,
      neighborhood,
      city,
      state,
      'Brasil'
    ].filter(Boolean);

    const fullAddress = parts.join(', ');
    console.log('🌍 Geocoding endereço:', fullAddress);

    // Usa Nominatim (OpenStreetMap) - Gratuito e sem API key
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rappy-DeliveryApp/1.0' // Nominatim requer user-agent
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar coordenadas');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhuma coordenada encontrada para:', fullAddress);
      return null;
    }

    const result = data[0];
    const coordinates: Coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    console.log('✅ Coordenadas encontradas:', coordinates);

    return {
      coordinates,
      formattedAddress: result.display_name
    };

  } catch (error: any) {
    console.error('❌ Erro no geocoding:', error);
    
    // Fallback: Retorna coordenadas aproximadas do centro da cidade
    return geocodeCityCenter(city, state);
  }
};

/**
 * Fallback: Busca coordenadas do centro da cidade
 */
const geocodeCityCenter = async (
  city: string,
  state: string
): Promise<GeocodingResult | null> => {
  try {
    console.log('🔄 Tentando geocoding do centro da cidade:', city, state);
    
    const query = `${city}, ${state}, Brasil`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rappy-DeliveryApp/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    
    console.log('✅ Coordenadas do centro da cidade encontradas');

    return {
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      formattedAddress: result.display_name
    };

  } catch (error) {
    console.error('❌ Erro ao buscar centro da cidade:', error);
    return null;
  }
};

/**
 * Valida se as coordenadas são válidas
 */
export const areValidCoordinates = (lat: number, lng: number): boolean => {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
};

/**
 * Calcula distância entre duas coordenadas (em km) - Fórmula de Haversine
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arredonda para 2 casas decimais
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

