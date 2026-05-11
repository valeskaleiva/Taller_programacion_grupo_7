from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import re
import time


def json_response(data, status=200):
    return JsonResponse(
        data,
        status=status,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )


def get_chrome_driver():
    """Crea un driver de Chrome en modo headless."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver


@require_http_methods(["GET", "OPTIONS"])
def search_card_price(request):
    if request.method == "OPTIONS":
        return json_response({}, status=200)
    card_name = request.GET.get("nombre") or request.GET.get("name")
    if not card_name:
        return JsonResponse(
            {"error": "Falta el parámetro 'nombre' en la query string."}, status=400
        )

    driver = None
    try:
        driver = get_chrome_driver()
        
        search_url = f"https://www.tcgplayer.com/search/pokemon/product?productName={quote_plus(card_name)}"
        driver.get(search_url)
        
        # Esperar a que cargue al menos un producto
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-product-id], tr[class*='product'], div[class*='product']"))
            )
        except:
            pass  # Continuar aunque no encuentre productos
        
        time.sleep(2)  # Esperar a que carguen los precios dinámicamente
        
        # Obtener el HTML renderizado
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")
        
        cards = []
        
        # Estrategia 1: Buscar elementos con atributo data-product-id
        products = soup.find_all(attrs={"data-product-id": True})
        
        # Estrategia 2: Si no hay resultados, buscar filas de tabla
        if not products:
            products = soup.find_all("tr", {"class": re.compile("product-row|row")})
        
        # Estrategia 3: Buscar divs con clase product
        if not products:
            products = soup.find_all("div", {"class": re.compile("product", re.I)})
        
        for product in products[:15]:
            try:
                # Nombre
                name = None
                for selector in ["a.productTitle", "a.product-link", "span.productTitle", "a"]:
                    name_elem = product.select_one(selector)
                    if name_elem:
                        name = name_elem.text.strip()
                        break
                
                if not name or len(name) < 2:
                    continue
                
                # Precio - buscar en múltiples ubicaciones
                price = None
                price_patterns = [
                    r"\$\s*(\d+(?:[.,]\d{2})?)",  # $4.00
                    r"(\d+(?:[.,]\d{2})?)\s*USD",  # 4.00 USD
                ]
                
                # Buscar en todo el producto
                product_text = product.get_text()
                for pattern in price_patterns:
                    match = re.search(pattern, product_text)
                    if match:
                        price = match.group(1)
                        break
                
                if not price:
                    continue
                
                # Set/colección (si está disponible)
                set_name = "Unknown"
                set_elem = product.find(re.compile("td|span|div"), {"class": re.compile("set|collection", re.I)})
                if set_elem:
                    set_name = set_elem.text.strip()
                
                # URL
                url = None
                link_elem = product.find("a", href=True)
                if link_elem:
                    href = link_elem["href"]
                    if href.startswith("/"):
                        url = "https://www.tcgplayer.com" + href
                    else:
                        url = href

                # Imagen
                image = None
                img_elem = product.find("img", src=True)
                if img_elem and img_elem["src"]:
                    image = img_elem["src"]
                elif img_elem and img_elem.get("data-src"):
                    image = img_elem.get("data-src")
                
                if image and image.startswith("//"):
                    image = "https:" + image

                cards.append({
                    "name": name,
                    "price": price,
                    "currency": "USD",
                    "set": set_name,
                    "source": "TCGplayer",
                    "url": url or search_url,
                    "image": image,
                })
                
            except Exception as e:
                continue
        
        if cards:
            return json_response({
                "query": card_name,
                "cards": cards[:5],
                "count": len(cards[:5]),
                "source": "TCGplayer",
                "success": True
            })
        else:
            return json_response({
                "query": card_name,
                "cards": [],
                "count": 0,
                "source": "TCGplayer",
                "message": "No se encontraron resultados. Intenta con otro nombre.",
                "success": False
            }, status=200)
    
    except Exception as e:
        return json_response({
            "error": "Error al buscar precios",
            "message": str(e),
            "success": False
        }, status=500)
    
    finally:
        if driver:
            driver.quit()
