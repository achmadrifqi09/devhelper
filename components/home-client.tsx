"use client";

import { useConverted } from "@/lib/store";
const ConvertResult = dynamic(() => import("@/components/convert-result"), {
    ssr: false,
});
import Hero from "./hero";
import dynamic from "next/dynamic";

export default function HomeClient() {
    const { isSuccess } = useConverted();

    return <>{isSuccess ? <ConvertResult /> : <Hero />}</>;
}
