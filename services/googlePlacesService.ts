import AsyncStorage from '@react-native-async-storage/async-storage';

class GooglePlacesService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.sociamosaic.com/api/google-places';

  // Get API key from backend
  async getApiKey(): Promise<string | null> {
    try {
      // Check if we have cached API key
      if (this.apiKey) {
        return this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/api-key`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.apiKey) {
          this.apiKey = data.apiKey;
          return this.apiKey;
        }
      }

      const errorText = await response.text();
      console.error('❌ Failed to get Google Places API key. Response:', errorText);
      
      // Fallback: Try to use backend search instead
      return 'BACKEND_SEARCH';
    } catch (error) {
      console.error('❌ Error getting Google Places API key:', error);
      // Fallback: Try to use backend search instead
      return 'BACKEND_SEARCH';
    }
  }

  // Search places using backend
  async searchPlaces(query: string, options: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          options: {
            language: 'hi',
            components: 'country:in',
            types: 'address',
            ...options
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      throw new Error('Failed to search places');
    } catch (error) {
      console.error('Error searching places:', error);
      return {
        success: false,
        error: 'SEARCH_FAILED',
        message: error.message
      };
    }
  }

  // Get place details using backend
  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      throw new Error('Failed to get place details');
    } catch (error) {
      console.error('Error getting place details:', error);
      return {
        success: false,
        error: 'DETAILS_FAILED',
        message: error.message
      };
    }
  }
}

export const googlePlacesService = new GooglePlacesService();
