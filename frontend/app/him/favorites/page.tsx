"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HeartIcon } from "lucide-react";

const FOLDERS = ["🗂 全部", "📁 火鍋", "📁 燒烤", "📁 日式", "📁 甜點"];

export default function HimFavoritesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartIcon />
              <div>
                <CardTitle>愛心收藏</CardTitle>
                <CardDescription>查看收藏清單</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">唯讀</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {FOLDERS.map((folder) => (
              <div
                key={folder}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm">{folder}</span>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
