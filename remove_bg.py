import sys
from PIL import Image

def remove_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    # Start flood fill from the four corners of the image
    queue = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    def is_bg(color):
        r, g, b, a = color
        # Check if the pixel color is close to black (within tolerance)
        return r < tolerance and g < tolerance and b < tolerance
        
    for x, y in queue:
        visited.add((x, y))
        
    while queue:
        cx, cy = queue.pop(0)
        curr_color = pixels[cx, cy]
        
        if is_bg(curr_color):
            pixels[cx, cy] = (0, 0, 0, 0) # Make pixel transparent
            
            # Check 4-way neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                    
    img.save(output_path, "PNG")
    print(f"Successfully processed: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
