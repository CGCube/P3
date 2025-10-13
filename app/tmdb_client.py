import requests

class TMDBClient:
    def __init__(self, api_key, read_access_token):
        self.api_key = api_key
        self.read_access_token = read_access_token
        self.base_url = "https://api.themoviedb.org/3"

    def get_headers(self):
        return {
            "Authorization": f"Bearer {self.read_access_token}"
        }

    def search_movie(self, query):
        url = f"{self.base_url}/search/movie"
        params = {
            "api_key": self.api_key,
            "query": query
        }
        response = requests.get(url, headers=self.get_headers(), params=params)
        return response.json()

    def get_movie_details(self, movie_id):
        url = f"{self.base_url}/movie/{movie_id}"
        params = {
            "api_key": self.api_key
        }
        response = requests.get(url, headers=self.get_headers(), params=params)
        return response.json()