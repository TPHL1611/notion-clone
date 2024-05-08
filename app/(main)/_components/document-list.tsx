import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

import Item from "./item";

interface DocumentListProps {
    parentDocumentId?: Id<"documents">;
    level?: number;
    data?: Doc<"documents">[];
}
export const DocumentList = ({ parentDocumentId, level = 0 }: DocumentListProps) => {
    const params = useParams();
    const router = useRouter();
    const [expanded, setIsExpanded] = useState<Record<string, boolean>>({});

    // Xử lý expand khi bấm vào item
    const onExpand = (documentId: string) => {
        setIsExpanded((prevExpanded) => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId],
        }));
    };
    // Gọi API lấy data
    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId,
    });
    // Redirect đến link document
    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };
    // Hiển thị khi đang gọi API lấy data
    if (documents === undefined) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        );
    }

    return (
        <>
            <p
                style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    expanded && "last:block",
                    level === 0 && "hidden"
                )}>
                No pages inside
            </p>
            {documents.map((document) => (
                <div key={document._id}>
                    <Item
                        id={document._id}
                        label={document.title}
                        onClick={() => onRedirect(document._id)}
                        icon={FileIcon}
                        documentIcon={document.icon}
                        active={params.documentId === document._id}
                        level={level}
                        onExpand={() => onExpand(document._id)}
                        expanded={expanded[document._id]}
                    />
                    {expanded[document._id] && (
                        <DocumentList parentDocumentId={document._id} level={level + 1} />
                    )}
                </div>
            ))}
        </>
    );
};
