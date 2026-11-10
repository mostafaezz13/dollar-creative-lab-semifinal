#!/usr/bin/env python3
"""Import the public Dollar Creative Lab Vimeo catalogue and original posters.
Uses Vimeo's public v2 endpoint; no access token or private embed links are stored.
"""
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PROFILE = 'https://vimeo.com/dollarcreativelab'
OWNER_ID = 131370187

class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in {'br','p','div','h3'}: self.parts.append('\n')
    def handle_data(self, data): self.parts.append(data)

def fetch_catalogue():
    videos = []
    for page in range(1, 4):
        with urlopen(f'{PROFILE.replace("/dollarcreativelab", "")}/api/v2/dollarcreativelab/videos.json?page={page}', timeout=30) as response:
            items = json.load(response)
        if not isinstance(items, list): raise RuntimeError('Unexpected catalogue response')
        videos.extend(items)
        if len(items) < 20: break
    else:
        raise RuntimeError('Public v2 catalogue limit reached; check the full account before importing.')
    if not videos or any(item.get('user_id') != OWNER_ID for item in videos):
        raise RuntimeError('Empty catalogue or unexpected video owner')
    if any(not isinstance(item.get('id'), int) or item['id'] <= 0 for item in videos): raise RuntimeError('Invalid video ID')
    if len({item['id'] for item in videos}) != len(videos): raise RuntimeError('Duplicate Vimeo IDs')
    return videos

def download_poster(item):
    url = item['thumbnail_large']
    parsed = urlparse(url)
    if parsed.scheme != 'https' or not parsed.hostname.endswith('.vimeocdn.com'):
        raise RuntimeError('Unexpected poster host')
    with urlopen(url, timeout=30) as response: image = response.read()
    if not image.startswith(b'\xff\xd8'): raise RuntimeError(f'Expected JPEG poster for {item["id"]}')
    path = ROOT / 'public' / 'vimeo-posters' / f'{item["id"]}.jpg'
    path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(image)
    return item['id'], f'/vimeo-posters/{item["id"]}.jpg'

def project(item, posters):
    parser = PlainText(); parser.feed(item.get('description') or '')
    description = '\n'.join(line.strip() for line in ''.join(parser.parts).splitlines() if line.strip())
    disciplines = []
    if re.search(r'\bedit(?:or|ing)?\b', description, re.I): disciplines.append('EDITING')
    if re.search(r'\bcolou?r(?:ist|ing)?\b', description, re.I): disciplines.append('COLOR')
    if re.search(r'\bsound\b', description, re.I): disciplines.append('SOUND')
    role = ' / '.join(disciplines) or 'POST PRODUCTION'
    title = item['title'].strip()
    client = title.split('—', 1)[1].strip() if '—' in title else 'Dollar Creative Lab'
    return {
        'id': item['id'], 'vimeoId': str(item['id']), 'title': title, 'client': client,
        'category': role, 'role': role, 'year': item['upload_date'][:4],
        'uploadedAt': item['upload_date'], 'duration': item['duration'],
        'width': item['width'], 'height': item['height'],
        'videoUrl': item['url'], 'previewVisual': item['url'], 'poster': posters[item['id']],
        'description': description, 'credits': item.get('description') or '',
        'hasCredit': bool(description), 'screenshots': [], 'sourceProfile': PROFILE
    }

if __name__ == '__main__':
    videos = fetch_catalogue()
    with ThreadPoolExecutor(max_workers=4) as workers: posters = dict(workers.map(download_poster, videos))
    projects = [project(item, posters) for item in videos]
    output = ROOT / 'src' / 'data' / 'vimeo-projects.json'
    output.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(projects)} public films and {len(posters)} original posters from {PROFILE}.')
    print('Titles and descriptions are preserved. Project years are Vimeo upload years.')
