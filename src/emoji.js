import emoji from 'emojilib';
import Fuse from 'fuse.js';
import { supportedemojis } from './data/supported_emojis';

// Top emojis on Facebook (see https://www.theverge.com/2017/7/17/15984204/facebooks-most-used-emoji-hearts-tears)
const popularEmojiNames = ['joy', 'heart_eyes', 'kissing_heart', 'laughing', 'grinning', 'heart', 'wink', 'blush', 'sob', 'smile', 'sweat', 'sweat_smile', '+1', 'expressionless', '100', 'cry', 'neutral_face', 'scream', 'ok_hand', 'pensive', 'weary', 'grin', 'smirk'];

// List of emojis supported by FB Messenger scraped off https://emojipedia/facebook using src/scripts/get-supported-emoji.py
const supportedEmojiNames = supportedemojis;

// Options for fuzzy searching using fuse.js library
const searchOptions = {
    distance: 0,
    location: 0,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.3,
};

const emojis = Object.keys(emoji.lib)
    .map(key => ({ name: key, keywords: [key].concat(emoji.lib[key].keywords), char: emoji.lib[key].char }))
    .filter(emojiItem => supportedEmojiNames.includes(emojiItem.name));

module.exports = {
    emojis,
    popularEmojis: emojis.filter(emojiItem => popularEmojiNames.includes(emojiItem.name))
        .sort((item1, item2) => popularEmojiNames.indexOf(item1.name) - popularEmojiNames.indexOf(item2.name)),
    exactSearchEngine: new Fuse(emojis, { ...searchOptions, keys: ['name'] }),
    fuzzySearchEngine: new Fuse(emojis, { ...searchOptions, keys: [{ name: 'name', weight: 0.9 }, { name: 'keywords', weight: 0.1 }] }),
};
