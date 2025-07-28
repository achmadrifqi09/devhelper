"use client";

import "react18-json-view/src/style.css";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useConverted } from "@/lib/store";
import ReactJson from "react18-json-view";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import { useState, useMemo, useCallback, ChangeEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server } from "@/types/server";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { DialogDescription } from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";
const RedocStandalone = dynamic(
    () => import("redoc").then((mod) => mod.RedocStandalone),
    { ssr: false }
);

export default function ConvertResult() {
    const { result, setResult } = useConverted() as {
        result: {
            servers?: Server[];
            [key: string]: any;
        };
        setResult: (value: any) => void;
    };

    const memoizedServers = useMemo(() => {
        return result?.servers ?? [];
    }, [result?.servers]);

    const [showDialog, setShowDialog] = useState(false);
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    const memoizedResult = useMemo(() => result, [result]);

    const handleAddServer = useCallback(() => {
        if (!url || !description) return;

        const newServer: Server = { url, description };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { openapi, info, servers, ...rest } = result as any;

        const newResult = {
            ...(openapi && { openapi }),
            ...(info && { info }),
            servers: [...memoizedServers, newServer],
            ...rest,
        };

        setResult(newResult);
        setUrl("");
        setDescription("");
        setShowDialog(false);
    }, [url, description, result, memoizedServers, setResult]);

    const handleDeleteServer = useCallback(
        (index: number) => {
            if (
                !result?.servers ||
                index < 0 ||
                index >= result.servers.length
            ) {
                return;
            }

            const updatedServers = result.servers.filter(
                (_, i: number) => i !== index
            );

            const newResult = {
                ...result,
                servers: updatedServers,
            };

            setResult(newResult);
        },
        [result, setResult]
    );

    return (
        <div>
            <div className="max-h-dvh flex flex-col sm:flex-row">
                <div className="max-w-sm w-full sticky top-0 p-4">
                    <Card className="rounded-md">
                        <CardHeader>
                            <CardTitle>Options</CardTitle>
                            <CardDescription>
                                Adjust conversion results
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <h5 className="font-medium">Servers</h5>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDialog(true)}
                                >
                                    <Plus />
                                </Button>
                            </div>
                            <ul className="mt-2 space-y-2">
                                {memoizedServers.length === 0 ? (
                                    <li className="px-2.5 py-2 border rounded-md text-center text-sm text-gray-400">
                                        No server
                                    </li>
                                ) : (
                                    memoizedServers.map(
                                        (server: Server, i: number) => (
                                            <li
                                                key={`server-${i}-${server.url}`}
                                                className="px-2.5 py-2 border rounded-md text-sm flex justify-between items-start gap-2"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <strong className="block">
                                                        {server.description}
                                                    </strong>
                                                    <span className="text-xs text-muted-foreground break-all">
                                                        {server.url}
                                                    </span>
                                                </div>
                                                <Button
                                                    onClick={() =>
                                                        handleDeleteServer(i)
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-shrink-0 h-8 w-8 p-0"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        )
                                    )
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1 h-[calc(100dvh-32px)] rounded-md overflow-hidden m-4 sm:ms-0 sm:my-4 sm:mr-4 text-white">
                    <div className="h-full overflow-auto bg-[#171717] p-2">
                        <Tabs defaultValue="code" className="w-full">
                            <div className="flex justify-between">
                                <TabsList>
                                    <TabsTrigger value="code">Code</TabsTrigger>
                                    <TabsTrigger value="preview">
                                        Preview
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="code" className="w-full">
                                <ReactJson
                                    src={memoizedResult}
                                    collapsed={1}
                                    dark={true}
                                    enableClipboard={true}
                                />
                            </TabsContent>
                            <TabsContent
                                value="preview"
                                className="w-full h-full"
                            >
                                <div className="w-full h-full overflow-auto bg-white text-gray-600">
                                    <RedocStandalone spec={memoizedResult} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Server</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={url}
                                type="url"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setUrl(e.target.value)
                                }
                                placeholder="https://api.example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Development server"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAddServer}>
                                Add Server
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
