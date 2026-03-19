import { Search } from "lucide-react";
import { parseAsString } from "nuqs";
import { memo } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useFilterState } from "@/hooks/useFilterState";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  paramName?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  // 制御モード
  value?: string;
  onChange?: (value: string) => void;
}

export const SearchFilter = memo(function SearchFilter({
  paramName = "search",
  placeholder = "Search...",
  label,
  className,
  value: controlledValue,
  onChange: controlledOnChange,
}: SearchFilterProps) {
  const { currentValue, handleChange } = useFilterState<string>({
    paramName,
    parser: parseAsString.withDefault(""),
    controlledValue,
    onControlledChange: controlledOnChange,
  });

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 h-5">{label && <Label htmlFor={paramName}>{label}</Label>}</div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={paramName}
          type="text"
          placeholder={placeholder}
          value={currentValue ?? ""}
          onChange={(e) => handleChange((e.target.value || null) as string)}
          className="pl-9"
        />
      </div>
    </div>
  );
});
