import os

# Fix food-data.js encoding
path = r'D:\健身网站\public\js\food-data.js'
for enc in ['gbk', 'utf-8-sig', 'latin-1']:
    try:
        with open(path, 'r', encoding=enc) as f:
            content = f.read()
        break
    except:
        continue

# Write as clean UTF-8
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'food-data.js: {len(content)} chars, {os.path.getsize(path)} bytes')

# Validate
import subprocess
r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
print(f'JS valid: {r.returncode == 0}')
