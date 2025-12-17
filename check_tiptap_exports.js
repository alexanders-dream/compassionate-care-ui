import * as TiptapReact from '@tiptap/react';
import * as BubbleExt from '@tiptap/extension-bubble-menu';
import * as FloatingExt from '@tiptap/extension-floating-menu';

console.log('TiptapReact keys:', Object.keys(TiptapReact));
try {
    console.log('BubbleExt keys:', Object.keys(BubbleExt));
} catch (e) {
    console.log('BubbleExt error:', e.message);
}
try {
    console.log('FloatingExt keys:', Object.keys(FloatingExt));
} catch (e) {
    console.log('FloatingExt error:', e.message);
}
