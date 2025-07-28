import HomeClient from "@/components/home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "evhelper",
    description:
        "A simple way to convert a postman collection into an open API schema with just a few clicks.",
};

export default async function Home() {
    return <HomeClient />;
}
