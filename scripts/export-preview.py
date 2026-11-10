#!/usr/bin/env python3
"""Bundle the production build and its media into one offline HTML preview.
Run npm run build first, then python scripts/export-preview.py [output.html].
Source files and dist stay unchanged.
"""
from pathlib import Path
import base64
import json
import mimetypes
import re
import sys

root = Path(__file__).resolve().parents[1] / 'dist'
html = (root / 'index.html').read_text()
script_path = re.search(r'<script[^>]+src="([^"]+)"[^>]*></script>', html).group(1)
style_path = re.search(r'<link[^>]+href="([^"]+\.css)"[^>]*>', html).group(1)
js = (root / script_path.lstrip('/')).read_text()
css = (root / style_path.lstrip('/')).read_text()

def data_url(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()

# Each media payload appears once, even when many components use it.
constants = []
for index, asset in enumerate(sorted(root.iterdir())):
    if not asset.is_file() or asset.suffix not in {'.mp4', '.jpg', '.png', '.webp'}:
        continue
    variable = f'__preview_asset_{index}'
    literal = json.dumps('/' + asset.name)
    if literal in js:
        constants.append(f'const {variable}={json.dumps(data_url(asset))};')
        js = js.replace(literal, variable)

for asset in (root / 'assets').iterdir():
    if asset.suffix not in {'.css', '.js'}:
        css = css.replace('/assets/' + asset.name, data_url(asset))
        html = html.replace('/assets/' + asset.name, data_url(asset))

js = '\n'.join(constants) + '\n' + js
js = js.replace('</script', '<\\/script')
html = re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>', lambda _: '<script type="module">' + js + '</script>', html)
html = re.sub(r'<link[^>]+href="[^"]+\.css"[^>]*>', lambda _: '<style>' + css + '</style>', html)
output = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/DOLLAR-POST-3D-preview.html')
output.write_text(html)
print(f'{output} ({output.stat().st_size:,} bytes)')
