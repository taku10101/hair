import { DateFilter } from "../DateFilter";
import { DateRangeFilter } from "../DateRangeFilter";
import { MultiSelectFilter } from "../MultiSelectFilter";
import { NumberRangeFilter } from "../NumberRangeFilter";
import { SearchFilter } from "../SearchFilter";
import { SelectFilter } from "../SelectFilter";
import type { FilterConfig, FilterValue, FilterValues } from "../types";

/**
 * Render a single filter based on its configuration
 */
export function renderFilter(
  config: FilterConfig,
  localValues: FilterValues,
  onUpdate: (key: string, value: FilterValue) => void
): React.ReactNode {
  switch (config.type) {
    case "search":
      return (
        <SearchFilter
          key={config.id}
          paramName={config.paramName}
          placeholder={config.placeholder}
          label={config.label}
          className={config.className}
          value={localValues[config.paramName] as string}
          onChange={(value) => onUpdate(config.paramName, value)}
        />
      );

    case "select":
      return (
        <SelectFilter
          key={config.id}
          paramName={config.paramName}
          options={config.options}
          placeholder={config.placeholder}
          label={config.label}
          className={config.className}
          defaultValue={config.defaultValue}
          value={localValues[config.paramName] as string}
          onChange={(value) => onUpdate(config.paramName, value)}
        />
      );

    case "multi-select":
      return (
        <MultiSelectFilter
          key={config.id}
          paramName={config.paramName}
          options={config.options}
          placeholder={config.placeholder}
          label={config.label}
          className={config.className}
          value={localValues[config.paramName] as string[]}
          onChange={(value) => onUpdate(config.paramName, value)}
        />
      );

    case "date":
      return (
        <DateFilter
          key={config.id}
          paramName={config.paramName}
          placeholder={config.placeholder}
          label={config.label}
          className={config.className}
          value={localValues[config.paramName] as Date | null}
          onChange={(value) => onUpdate(config.paramName, value)}
        />
      );

    case "date-range":
      return (
        <DateRangeFilter
          key={config.id}
          fromParamName={config.fromParamName}
          toParamName={config.toParamName}
          placeholder={config.placeholder}
          label={config.label}
          className={config.className}
          fromValue={localValues[config.fromParamName] as Date | null}
          toValue={localValues[config.toParamName] as Date | null}
          onFromChange={(value) => onUpdate(config.fromParamName, value)}
          onToChange={(value) => onUpdate(config.toParamName, value)}
        />
      );

    case "number-range":
      return (
        <NumberRangeFilter
          key={config.id}
          minParamName={config.minParamName}
          maxParamName={config.maxParamName}
          minPlaceholder={config.minPlaceholder}
          maxPlaceholder={config.maxPlaceholder}
          label={config.label}
          className={config.className}
          minValue={localValues[config.minParamName] as number | null}
          maxValue={localValues[config.maxParamName] as number | null}
          onMinChange={(value) => onUpdate(config.minParamName, value)}
          onMaxChange={(value) => onUpdate(config.maxParamName, value)}
        />
      );

    default:
      return null;
  }
}
