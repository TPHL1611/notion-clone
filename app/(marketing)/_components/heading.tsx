"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRightIcon } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";

export const Heading = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Your Ideas, Documents, & Plans. Unified. Welcom to{" "}
                <span className="underline">Jotion</span>
            </h1>
            <h3 className="text-base sm:text-xl md-:text-2xl font-medium">
                Jotion is the connected workspace where <br />
                better, faster work happens
            </h3>
            {isLoading && (
                <Button>
                    <Spinner />
                </Button>
            )}
            {!isAuthenticated && !isLoading && (
                <SignInButton mode="modal">
                    <Button size="sm">
                        Enter Jotion
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                </SignInButton>
            )}
            {isAuthenticated && !isLoading && (
                <Button>
                    <Link href="/documents" className="w-fit flex">
                        Enter Jotion
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            )}
        </div>
    );
};
