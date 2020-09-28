import requests
import pickle
import json
from bs4 import BeautifulSoup

messenger_emojis = []
emojilib = []
supported_emoji_names = []

r = requests.get('https://emojipedia.org/facebook/')
main_page = BeautifulSoup(r.text, 'lxml')

emoji_list_nodes = main_page.find('ul', class_='emoji-grid').find_all('li')

for index, node in enumerate(emoji_list_nodes):
    r = requests.get('https://emojipedia.org/' + node.a.attrs['href'])
    emoji_page = BeautifulSoup(r.text, 'lxml')
    messenger_emojis.append(emoji_page.find('input', id='emoji-copy').attrs['value'])
    print(index)

with open('src/data/messenger_emojis', 'w+', encoding="utf-8") as file:
    file.write(str(messenger_emojis))

with open('node_modules/emojilib/emojis.json', encoding="utf-8") as file:
    emoji_dictionary = json.load(file)
    emojilib = [{ **emoji_dictionary[key], **{ 'name': key }} for key in emoji_dictionary]

for item in emojilib:
    if item['char'] and item['char'] in messenger_emojis:
        supported_emoji_names.append(item['name'])

with open('src/data/supported_emojis.js', 'w+', encoding="utf-8") as file:
    file.write("export let supportedemojis = " + str(supported_emoji_names))