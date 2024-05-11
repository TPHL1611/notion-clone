"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/egdestore";
import { useCoverImage } from "@/hooks/use-cover-image";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
}
const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { edgestore } = useEdgeStore();
    const coverImage = useCoverImage();

    const handleUpload = async (file: File) => {
        const res = await edgestore.publicFiles.upload({
            file,
            options: {
                replaceTargetUrl: coverImage.url,
            },
        });
        return res.url;
    };

    const editor: BlockNoteEditor = useCreateBlockNote({
        initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
        uploadFile: handleUpload,
    });
    return (
        <div>
            <BlockNoteView
                editor={editor}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={() => {
                    onChange(JSON.stringify(editor.document));
                }}
            />
        </div>
    );
};
export default Editor;
