"use client";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full flex dark:bg-[#1f1f1f]">
            <main className="flex-1 h-full overflow-y-auto">{children}</main>
        </div>
    );
};
export default PublicLayout;
