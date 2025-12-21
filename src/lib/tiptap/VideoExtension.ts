import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
    allowFullscreen: boolean;
    controls: boolean;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            /**
             * Set a video node
             */
            setVideo: (options: { src: string }) => ReturnType;
        };
    }
}

export const Video = Node.create<VideoOptions>({
    name: 'video',

    addOptions() {
        return {
            allowFullscreen: true,
            controls: true,
            HTMLAttributes: {
                class: 'w-full rounded-lg my-4',
            },
        };
    },

    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            controls: {
                default: true,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setVideo:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});
