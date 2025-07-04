
'use server';
/**
 * @fileOverview Defines a Genkit tool for fetching the current weather.
 *
 * - getCurrentWeather - A tool that retrieves weather data from a public API.
 * - fetchWeather - The underlying function to retrieve weather data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// WMO Weather interpretation codes for open-meteo API
const weatherCodes: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const getWeatherDescription = (code: number) => {
  return weatherCodes[code] || 'Unknown weather';
};

export async function fetchWeather({ latitude, longitude }: { latitude: number; longitude: number; }): Promise<string> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
      }
      const data = await response.json();
      
      const temperatureF = data.current.temperature_2m;
      const temperatureC = (temperatureF - 32) * 5 / 9;
      const weatherCode = data.current.weather_code;
      const weatherDescription = getWeatherDescription(weatherCode);

      return `${weatherDescription}, ${Math.round(temperatureF)}°F (${Math.round(temperatureC)}°C)`;
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Provide a fallback response if the API fails
      return "Weather data is currently unavailable.";
    }
}

export const getCurrentWeather = ai.defineTool(
  {
    name: 'getCurrentWeather',
    description: "Gets the current weather for a given location using its latitude and longitude. This should be called for every request to get the most up-to-date weather.",
    inputSchema: z.object({
      latitude: z.number().describe('The latitude of the location.'),
      longitude: z.number().describe('The longitude of the location.'),
    }),
    outputSchema: z.string().describe('A description of the current weather conditions, including temperature in Fahrenheit and Celsius.'),
  },
  async (input) => fetchWeather(input)
);
