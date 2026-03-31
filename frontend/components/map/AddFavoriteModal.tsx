"use client";

import { useState } from "react";
import { HeartIcon, LinkIcon, MapPinIcon, UtensilsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAddFavorite } from "@/hooks/useFavorites";

interface Props {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface Form {
  restaurant_name: string;
  address: string;
  maps_url: string;
}

const EMPTY: Form = { restaurant_name: "", address: "", maps_url: "" };

export function AddFavoriteModal({ open, onClose, initialQuery = "" }: Props) {
  const add = useAddFavorite();
  const [form, setForm] = useState<Form>({ ...EMPTY, restaurant_name: initialQuery });

  function handleClose() {
    setForm({ ...EMPTY, restaurant_name: initialQuery });
    onClose();
  }

  async function handleSave() {
    if (!form.restaurant_name.trim() || !form.address.trim()) return;
    await add.mutateAsync({
      restaurant_name: form.restaurant_name.trim(),
      address: form.address.trim(),
      maps_url: form.maps_url.trim() || undefined,
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartIcon className="size-4 text-rose-500" />
            加入收藏
          </DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>
              <UtensilsIcon className="mr-1 inline size-3.5 opacity-60" />
              餐廳名稱
            </FieldLabel>
            <Input
              placeholder="例：鼎泰豐"
              value={form.restaurant_name}
              onChange={(e) => setForm((p) => ({ ...p, restaurant_name: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel>
              <MapPinIcon className="mr-1 inline size-3.5 opacity-60" />
              地址
            </FieldLabel>
            <Input
              placeholder="例：台北市信義區信義路五段 7 號"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel>
              <LinkIcon className="mr-1 inline size-3.5 opacity-60" />
              Google Maps 連結（選填）
            </FieldLabel>
            <Input
              placeholder="貼上 Google Maps 分享連結…"
              value={form.maps_url}
              onChange={(e) => setForm((p) => ({ ...p, maps_url: e.target.value }))}
            />
          </Field>
        </FieldGroup>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={add.isPending}>
            取消
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={add.isPending || !form.restaurant_name.trim() || !form.address.trim()}
          >
            {add.isPending && <Spinner data-icon="inline-start" />}
            儲存收藏
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
