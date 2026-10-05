import os
from PIL import Image, ImageDraw, ImageFilter

# Paths
base_dir = r"d:\Apps-building\wormind"
logo_path = os.path.join(base_dir, "assets", "images", "wormind_logo.png")
icon_out_path = os.path.join(base_dir, "assets", "icon.png")
adaptive_out_path = os.path.join(base_dir, "assets", "adaptive-icon.png")
splash_out_path = os.path.join(base_dir, "assets", "splash.png")

# Open logo
logo = Image.open(logo_path).convert("RGBA")

# Target dimensions
SIZE = 1024
icon_canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

# 1. Create rich gradient background
bg = Image.new("RGBA", (SIZE, SIZE), (14, 9, 33, 255))
draw = ImageDraw.Draw(bg)

# Add a vibrant radial cyan/purple glow in the center behind the logo
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
center_x, center_y = SIZE // 2, SIZE // 2 - 20
for r in range(450, 0, -5):
    alpha = int(90 * (1 - r / 450)**1.5)
    # Blend purple and cyan
    glow_draw.ellipse(
        [center_x - r, center_y - r, center_x + r, center_y + r],
        fill=(168, 85, 247, alpha) if r > 200 else (6, 182, 212, alpha)
    )

glow = glow.filter(ImageFilter.GaussianBlur(radius=40))
bg.alpha_composite(glow)

# 2. Fit logo inside safe area (~700px width/height out of 1024px)
logo_aspect = logo.width / logo.height
target_w = 720
target_h = int(target_w / logo_aspect)
if target_h > 720:
    target_h = 720
    target_w = int(target_h * logo_aspect)

logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Create drop shadow for logo
shadow = Image.new("RGBA", (target_w + 60, target_h + 60), (0, 0, 0, 0))
shadow_logo = logo_resized.split()[3]
shadow.paste((0, 0, 0, 180), (30, 30), shadow_logo)
shadow = shadow.filter(ImageFilter.GaussianBlur(radius=25))

# Composite icon.png
pos_x = (SIZE - target_w) // 2
pos_y = (SIZE - target_h) // 2 - 10

bg.alpha_composite(shadow, (pos_x - 30, pos_y - 10))
bg.alpha_composite(logo_resized, (pos_x, pos_y))

# Save main icon.png
bg.save(icon_out_path, format="PNG")
print(f"Saved {icon_out_path}")

# 3. Create foreground adaptive-icon.png (transparent bg, logo in safe zone)
adaptive_fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
# Adaptive icon safe zone is 66% (approx 676px)
target_w_ad = 650
target_h_ad = int(target_w_ad / logo_aspect)
logo_ad_resized = logo.resize((target_w_ad, target_h_ad), Image.Resampling.LANCZOS)

pos_x_ad = (SIZE - target_w_ad) // 2
pos_y_ad = (SIZE - target_h_ad) // 2 - 10

adaptive_fg.alpha_composite(logo_ad_resized, (pos_x_ad, pos_y_ad))
adaptive_fg.save(adaptive_out_path, format="PNG")
print(f"Saved {adaptive_out_path}")

# 4. Create splash screen logo
splash_bg = Image.new("RGBA", (1242, 2436), (14, 9, 33, 255))
# Radial glow for splash
splash_glow = Image.new("RGBA", (1242, 2436), (0, 0, 0, 0))
sg_draw = ImageDraw.Draw(splash_glow)
sc_x, sc_y = 1242 // 2, 2436 // 2
for r in range(600, 0, -8):
    alpha = int(70 * (1 - r / 600)**1.5)
    sg_draw.ellipse(
        [sc_x - r, sc_y - r, sc_x + r, sc_y + r],
        fill=(168, 85, 247, alpha)
    )
splash_glow = splash_glow.filter(ImageFilter.GaussianBlur(radius=50))
splash_bg.alpha_composite(splash_glow)

# Logo for splash
sp_w = 850
sp_h = int(sp_w / logo_aspect)
logo_sp = logo.resize((sp_w, sp_h), Image.Resampling.LANCZOS)
sp_x = (1242 - sp_w) // 2
sp_y = (2436 - sp_h) // 2
splash_bg.alpha_composite(logo_sp, (sp_x, sp_y))
splash_bg.save(splash_out_path, format="PNG")
print(f"Saved {splash_out_path}")
