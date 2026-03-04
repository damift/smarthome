import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";

export default function AuthTextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-3">
      {/* Standaard input-veld voor auth forms met consistente styling. */}
      <Label htmlFor={id} className="text-base font-normal">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-14 rounded-lg border-2 border-black bg-gray-100 px-5 text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
