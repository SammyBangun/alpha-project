"use client";

import { useEffect, useState } from "react";
import { Input, Textarea, FieldLabel } from "@/components/ui/input";

interface AutoSaveProps {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  textarea?: boolean;
  minHeight?: number;
}

/** Text field that persists on blur (only when changed) — used by morning/night protocol. */
export function AutoSaveField({
  label,
  value,
  placeholder,
  onSave,
  textarea,
  minHeight = 78,
}: AutoSaveProps) {
  const [local, setLocal] = useState(value);

  // re-sync when the server value arrives/changes and the user isn't mid-edit elsewhere
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = () => {
    if (local !== value) onSave(local);
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {textarea ? (
        <Textarea
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          style={{ minHeight }}
        />
      ) : (
        <Input
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
        />
      )}
    </div>
  );
}
