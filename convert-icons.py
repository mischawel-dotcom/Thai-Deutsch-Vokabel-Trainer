#!/usr/bin/env python3
"""
Konvertiert SVG Icons zu PNG mit Pillow
"""

from PIL import Image, ImageDraw
from pathlib import Path

def create_icon_png(size: int, output_path: str):
    """Erstelle ein Thai-Vokabeltrainer Icon als PNG"""
    # Erstelle ein neues Bild mit dunkelblauem Hintergrund
    img = Image.new('RGB', (size, size), color='#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Zeichne einen blauen Kreis
    circle_size = int(size * 0.7)
    x0 = (size - circle_size) // 2
    y0 = (size - circle_size) // 2
    x1 = x0 + circle_size
    y1 = y0 + circle_size
    draw.ellipse([x0, y0, x1, y1], fill='#3b82f6')
    
    # Speichern
    img.save(output_path, 'PNG')
    print(f"✓ {Path(output_path).name} erstellt ({size}x{size})")

# Hauptordner
icons_dir = Path(__file__).parent / "public" / "icons"
icons_dir.mkdir(parents=True, exist_ok=True)

# Erstelle alle Icons
create_icon_png(192, str(icons_dir / "icon-192.png"))
create_icon_png(512, str(icons_dir / "icon-512.png"))
create_icon_png(192, str(icons_dir / "icon-maskable-192.png"))
create_icon_png(512, str(icons_dir / "icon-maskable-512.png"))

print("\n✅ Alle Icons erfolgreich erstellt!")

