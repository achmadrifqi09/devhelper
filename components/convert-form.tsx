"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { convertPostmanToOpenAPI } from "@/lib/postmanToOpenAPI";
import { toast } from "sonner";
import { useConverted } from "@/lib/store";

export default function ConvertForm() {
    const [fileName, setFileName] = useState("No file selected");
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isSelectedFile, setIsSelectedFile] = useState<boolean>(false);
    const { setResult, setSuccess } = useConverted();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fullName = file.name;
            const shortName =
                fullName.length > 40 ? fullName.slice(0, 37) + "..." : fullName;
            setFileName(shortName);
            setIsSelectedFile(true);

            const reader = new FileReader();
            reader.onload = () => {
                setFileContent(reader.result as string);
            };
            reader.readAsText(file);
        } else {
            setFileName("No file selected");
            setIsSelectedFile(false);
            setFileContent(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!fileContent) {
            return;
        }

        try {
            const postmanJson = JSON.parse(fileContent);
            const openapiJson = convertPostmanToOpenAPI(postmanJson);
            setResult(JSON.parse(openapiJson));
            setSuccess(true);
        } catch (err: any) {
            setSuccess(false);
            setResult({});
            const message: string =
                err?.message || "Invalid Postman collection";
            toast(message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-2.5 w-max mx-auto mt-10">
                    <label
                        htmlFor="file"
                        className="flex bg-muted gap-4 w-max p-1.5 rounded-xl mx-auto select-none"
                    >
                        <span className="px-4 py-2.5 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-700 whitespace-nowrap hover:cursor-pointer text-white">
                            Pick your collection
                        </span>
                        <input
                            type="file"
                            id="file"
                            accept="application/json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <span className="max-w-sm mr-4 py-2.5 w-full block truncate">
                            {fileName}
                        </span>
                    </label>
                    <button
                        disabled={!isSelectedFile}
                        type="submit"
                        className="py-3 flex items-center justify-center text-center px-4 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 bg-gradient-to-tr from-blue-500 to-blue-700 rounded-xl text-white"
                    >
                        <ArrowRight />
                    </button>
                </div>
            </form>
        </>
    );
}
