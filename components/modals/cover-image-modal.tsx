"use client";

import { useCoverImage } from "@/hooks/use-cover-image";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "../ui/dialog";
import { SingleImageDropzone } from "../single-image-dropzone";
import { useEdgeStore } from "@/lib/egdestore";
import { EdgeStoreApiClientError } from "@edgestore/react/shared";
import { toast } from "sonner";

export const CoverImageModal = () => {
    const params = useParams();
    const update = useMutation(api.documents.update);
    const coverImage = useCoverImage();
    const { edgestore } = useEdgeStore();

    const [file, setFile] = useState<File>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onClose = () => {
        setFile(undefined);
        setIsSubmitting(false);
        coverImage.onClose();
    };

    const onChange = async (file?: File) => {
        try {
            if (file) {
                setIsSubmitting(true);
                setFile(file);

                const res = await edgestore.publicFiles.upload({
                    file,
                    options: {
                        replaceTargetUrl: coverImage.url,
                    },
                });

                await update({
                    id: params.documentId as Id<"documents">,
                    coverImage: res.url,
                });

                onClose();
            }
        } catch (error) {
            if (error instanceof EdgeStoreApiClientError) {
                let errorText;
                switch (error.data.code) {
                    case "FILE_TOO_LARGE":
                        errorText = `File too large. Please upload image with file size less than 1MB.`;
                        break;
                    case "MIME_TYPE_NOT_ALLOWED":
                        errorText = `File type not allowed. Allowed types are ${error.data.details.allowedMimeTypes.join(
                            ", "
                        )}`;
                        break;
                    default:
                        break;
                }

                setTimeout(() => {
                    setIsSubmitting(false);
                    setFile(undefined);
                }, 200);
                toast.error(errorText);
            }
        }
    };

    return (
        <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
            <DialogContent>
                <DialogHeader>
                    <h2 className="text-center text-lg font-semibold">Cover Image</h2>
                </DialogHeader>
                <DialogDescription className="border-t border-dashed pt-3">
                    <h3 className="text-sm font-semibold">Max file size: 1MB</h3>
                    <h3 className="text-sm font-semibold mt-1">
                        File types allowed: .png, .jpeg, .webp
                    </h3>
                </DialogDescription>
                <SingleImageDropzone
                    className="w-full outline-none"
                    disabled={isSubmitting}
                    value={file}
                    onChange={onChange}
                />
            </DialogContent>
        </Dialog>
    );
};
