import geocoder
import requests


def get_user_location():
    """Get the user's approximate location based on their IP address."""
    try:
        # Using the free IPGeolocation service for demonstration purposes
        response = requests.get('https://ipinfo.io/json')
        response.raise_for_status()
        location_data = response.json()

        city = location_data.get('city', 'YourCity')
        country = location_data.get('country', 'YourCountry')

        return city, country
    except requests.exceptions.RequestException as e:
        print(f"Error fetching location data: {e}")
        return 'YourCity', 'YourCountry'

def get_current_weather(api_key):
    """Get the current weather conditions based on the user's location."""
    city, country = get_user_location()

    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        'q': f"{city},{country}",
        'appid': api_key,
        'units': 'metric'  # Adjust units as needed (metric, imperial, standard)
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        weather_data = response.json()

        # Extract relevant information from the API response
        temperature = weather_data['main']['temp']
        description = weather_data['weather'][0]['description']
        humidity = weather_data['main']['humidity']

        return f"Current weather in {city}, {country}: {description}, Temperature: {temperature}°C, Humidity: {humidity}%"
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return "Unable to retrieve weather information"

# Example Usage:
api_key = "YourOpenWeatherMapAPIKey"
weather_info = get_current_weather(api_key)
print(weather_info)
