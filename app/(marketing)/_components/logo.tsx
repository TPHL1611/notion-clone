import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "600"],
});

export const Logo = () => {
    return (
        <div className="hidden md:flex items-center gap-x-2">
            <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="dark:brightness-0 dark:invert"
            />
            <span className="lg:inline-block dark:text-white">Notion</span>
        </div>
    );
};
