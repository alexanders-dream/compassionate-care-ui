import * as TiptapReact from '@tiptap/react';

console.log('Checking @tiptap/react exports...');
if ('BubbleMenu' in TiptapReact) {
    console.log('BubbleMenu found in @tiptap/react');
} else {
    console.log('BubbleMenu NOT found in @tiptap/react');
}

// Try dynamic import for menus if it exists
try {
    // Note: This matches the suggestion from search results
    // We strive to check if we can import from this path
    console.log('Attempting to import from @tiptap/extension-bubble-menu');
} catch (e) {
    console.log('Error:', e.message);
}
