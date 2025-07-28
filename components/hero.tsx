"use client";

import { ChevronRight } from "lucide-react";
import CtaButton from "./ui/cta-button";
import ConvertForm from "./convert-form";
import { useEffect, useState } from "react";
import GradientText from "./GradientText/GradientText";
import { v4 as uuidv4 } from "uuid";

export default function Hero() {
    const [showForm, setShowForm] = useState<boolean>(false);

    useEffect(() => {
        const existingUUID = localStorage.getItem("client_id");

        if (!existingUUID && localStorage) {
            const newUUID = uuidv4();
            localStorage.setItem("client_id", newUUID);
        }
    }, []);

    return (
        <main className="w-full overflow-x-hidden min-h-dvh p-6 sm:p-0">
            <div className="flex h-dvh justify-center items-center relative z-50">
                <div className="text-center">
                    <GradientText
                        colors={[
                            "#40ffaa",
                            "#4079ff",
                            "#40ffaa",
                            "#4079ff",
                            "#40ffaa",
                        ]}
                        animationSpeed={3}
                        showBorder={false}
                        className="text-4xl leading-normal md:text-6xl font-bold text-center xl:leading-[4rem] bg-transparent"
                    >
                        Convert Your{" "}
                        <span className=" bg-gradient-to-br from-blue-600 to-blue-900 rotate-2 inline-block w-max text-white">
                            Postman
                        </span>{" "}
                        <br /> Collection to Open API Schema
                    </GradientText>
                    <p className="mt-6 text-gray-300 md:text-lg">
                        A simple way to convert a postman collection into an
                        open API schema with just a few clicks.
                    </p>
                    {!showForm && (
                        <CtaButton
                            className="mt-10 mx-auto"
                            onClick={() => setShowForm(true)}
                        >
                            Get Started <ChevronRight />
                        </CtaButton>
                    )}
                    {showForm && <ConvertForm />}
                </div>
            </div>
        </main>
    );
}
