from celery import Celery
from app.core.config import settings
import requests
from bs4 import BeautifulSoup
import random
import time

celery = Celery(__name__)
celery.conf.broker_url = settings.REDIS_URL
celery.conf.result_backend = settings.REDIS_URL

@celery.task(name="scrape_exchange_rates")
def scrape_exchange_rates():
    # Simulate scraping a website
    # In a real scenario, we would use requests and BeautifulSoup
    # response = requests.get("https://www.x-rates.com/calculator/?from=USD&to=INR&amount=1")
    # soup = BeautifulSoup(response.content, "html.parser")
    # rate = soup.find(...)
    
    # Mocking the rate for stability
    base_rate = 83.50
    fluctuation = random.uniform(-0.5, 0.5)
    current_rate = base_rate + fluctuation
    
    return {"USD_INR": round(current_rate, 2), "timestamp": time.time()}

@celery.task(name="generate_monthly_statement")
def generate_monthly_statement(user_id: int):
    # Simulate heavy PDF generation
    time.sleep(5)
    return f"Statement generated for user {user_id}"
