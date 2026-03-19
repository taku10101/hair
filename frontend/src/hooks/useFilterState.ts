import type { ParserBuilder } from "nuqs";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

/**
 * Generic hook for managing filter state that supports both controlled and uncontrolled modes.
 *
 * This hook eliminates the need to duplicate controlled/uncontrolled logic across
 * multiple filter components. It works with nuqs for URL state management.
 *
 * @template T - The type of the filter value
 *
 * @param params - Configuration object
 * @param params.paramName - The URL query parameter name
 * @param params.parser - The nuqs parser (e.g., parseAsString.withDefault(""))
 * @param params.controlledValue - Optional controlled value
 * @param params.onControlledChange - Optional controlled change handler
 *
 * @returns Object containing current value and change handler
 *
 * @example
 * // Uncontrolled mode (URL state managed)
 * const { currentValue, handleChange } = useFilterState({
 *   paramName: "search",
 *   parser: parseAsString.withDefault(""),
 * })
 *
 * @example
 * // Controlled mode (parent manages state)
 * const { currentValue, handleChange } = useFilterState({
 *   paramName: "search",
 *   parser: parseAsString.withDefault(""),
 *   controlledValue: myValue,
 *   onControlledChange: setMyValue,
 * })
 */
export function useFilterState<T>({
  paramName,
  parser,
  controlledValue,
  onControlledChange,
}: {
  paramName: string;
  parser: ParserBuilder<T>;
  controlledValue?: T;
  onControlledChange?: (value: T) => void;
}): {
  currentValue: T;
  handleChange: (newValue: T) => void;
  isControlled: boolean;
} {
  const [urlValue, setUrlValue] = useQueryState(paramName, parser);

  const isControlled = controlledValue !== undefined;
  const currentValue = (isControlled ? controlledValue : urlValue) as T;

  const handleChange = useCallback(
    (newValue: T) => {
      if (isControlled && onControlledChange) {
        onControlledChange(newValue);
      } else {
        setUrlValue(newValue as never);
      }
    },
    [isControlled, onControlledChange, setUrlValue]
  );

  return { currentValue, handleChange, isControlled };
}
