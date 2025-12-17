try {
    const menus = require('@tiptap/react/menus');
    console.log('Menus exports:', Object.keys(menus));
} catch (e) {
    console.log('Error importing @tiptap/react/menus:', e.message);
}

try {
    const main = require('@tiptap/react');
    console.log('Main exports has BubbleMenu?', 'BubbleMenu' in main);
} catch (e) {
    console.log('Error importing @tiptap/react:', e.message);
}
