import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes } from "react";

interface CtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: React.ReactNode;
}

export default function CtaButton({
    className,
    children,
    ...props
}: CtaButtonProps) {
    return (
        <button
            className={cn(
                "flex gap-1 bg-gradient-to-r hover:cursor-pointer from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-full shadow-lg transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
