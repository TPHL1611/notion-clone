"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "./(marketing)/_components/logo";

const Error = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Logo />
            <h3 className="font-bold text-2xl">Page not found</h3>
            <p className="max-w-96 text-center">
                Either this page doesn&apos;t exist or you don&apos;t have permission to access it.
            </p>
            <Button size="lg">
                <Link href="/documents">Back to documents</Link>
            </Button>
        </div>
    );
};
export default Error;
