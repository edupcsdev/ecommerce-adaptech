import { useState, type ReactNode } from "react";
import type { ZodTypeAny } from "zod";
import { fieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Field = { name: string; label: string; type?: string; textarea?: boolean };

export function SimpleForm({ schema, fields, submitLabel, onSuccess, footer }: {
  schema: ZodTypeAny; fields: Field[]; submitLabel: string; onSuccess: (form: HTMLFormElement) => void | Promise<void>; footer?: ReactNode;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
      if (!r.success) return setErrors(fieldErrors(r.error.issues));
      setErrors({});
      void onSuccess(e.currentTarget);
    }}>
      {fields.map((f) => (
        <div key={f.name}>
          <Label htmlFor={f.name}>{f.label}</Label>
          {f.textarea
            ? <Textarea id={f.name} name={f.name} rows={5} className="mt-1" />
            : <Input id={f.name} name={f.name} type={f.type ?? "text"} className="mt-1" aria-invalid={!!errors[f.name]} />}
          {errors[f.name] && <p className="mt-1 text-xs text-destructive">{errors[f.name]}</p>}
        </div>
      ))}
      <Button type="submit" variant="hero" size="lg" className="w-full">{submitLabel}</Button>
      {footer}
    </form>
  );
}
