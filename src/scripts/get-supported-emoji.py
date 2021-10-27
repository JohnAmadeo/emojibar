import requests
import pickle
import json
from bs4 import BeautifulSoup

messenger_emojis = []
emojilib = []
supported_emoji_names = []

def callStuff(node):
    r = requests.get('https://emojipedia.org/' + node.a.attrs['href'])
    emoji_page = BeautifulSoup(r.text, 'html.parser')
    messenger_emojis.append(emoji_page.find('input', id='emoji-copy').attrs['value'])
    print(str(index) + " -> " + node.a.attrs['href'].replace("/",""))

# Get the content of the whole website that has the list of emojis
r = requests.get('https://emojipedia.org/facebook/')
main_page = BeautifulSoup(r.text, 'html.parser')

# Take only the list of emoji from the whole page
emoji_list_nodes = main_page.find('ul', class_='emoji-grid').find_all('li')

# Iterate on each and print each time the emoji added
for index, node in enumerate(emoji_list_nodes):
    try:
        callStuff(node)
    except Exception as e:
        print("FAILED. TRYING AGAIN")
        callStuff(node)

# Write in the messenger_emojis file all the emojis
with open('../data/messenger_emojis', 'w+', encoding="utf-8") as file:
    file.write(str(messenger_emojis))

with open('../../node_modules/emojilib/emojis.json', encoding="utf-8") as file:
    emoji_dictionary = json.load(file)
    emojilib = [{ **emoji_dictionary[key], **{ 'name': key }} for key in emoji_dictionary]

for item in emojilib:
    if item['char'] and item['char'] in messenger_emojis:
        supported_emoji_names.append(item['name'])

# Write in the supported_emojis file all the placeholder text of emojis
with open('../data/supported_emojis.js', 'w+', encoding="utf-8") as file:
    file.write("export let supportedemojis = " + str(supported_emoji_names))