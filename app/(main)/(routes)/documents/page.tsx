"use client";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

const DocumentsPage = () => {
    const { user } = useUser();
    const create = useMutation(api.documents.create);

    const onCreate = () => {
        const promise = create({ title: "Untitled" });
        toast.promise(promise, {
            loading: "Creating a new note ...",
            success: "New note created!",
            error: "Failed to create a new note.",
        });
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-lg font-medium mb-3">
                Welcome to {user?.firstName} {user?.fullName}&apos;s Jotion
            </h2>
            <Button onClick={onCreate}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create a note
            </Button>
        </div>
    );
};
export default DocumentsPage;
