# emojibar

EmojiBar for FB Messenger is a Slack-like emoji picker for Facebook Messenger. EmojiBar is implemented as a Chrome extension that works on all www.messenger.com and www.facebook.com/messages URLs.

Download the Chrome extension at http://bit.ly/emojibar.

(I also wrote a blog post about what I learned from building EmojiBar here https://medium.com/@johnamadeo/lessons-from-building-emojibar-12cced28a9d7)

![](assets/ph/gallery1.jpg)

![](assets/ph/gallery2.jpg)

![](assets/ph/gallery3.jpg)

![](assets/ph/gallery4.jpg)

# IMPORTANT
Since Facebook has done some weird stuff lately, it's unfortunately no longer simply possible to search for an emoji and press enter. Therefore it is now necessary to press CTRL+SHIFT+ALT as an alternative to pressing ENTER on your keyboard, after searching for an emoji.

Before you could do :joy and then press ENTER, but now you have to write :joy followed by CTRL+SHIFT+ALT instead. Very unfortunate.

# Develoment

## Build the project locally

- Git clone the project locally
- Run ```npm i``` (Install all libraries the project need)
- Run ```npx webpack``` (Build the project in the dist folder. You must run this command each time you make changes to see them appear)
- Tell chrome that your extension is in the dist folder, where the manifest.json file is located
- Voilà, you're running the extension locally, now you can start working on it

## Update the emoji list

The list of emoji may be outdated over time, it does not update automatically, you have to update it manually, for this you have to
- Go in ```src/scripts``` folder
- Run ```get-supported-emoji.py``` script (this script is going to update the files in the ```data``` folder with the new list of emojis)
- You can check if the new emojis are here by building the extension to test it locally (```npx webpack```)
- If the new emojis appear, then pull request your commits so the project can be update and the extension can get the new emojis
