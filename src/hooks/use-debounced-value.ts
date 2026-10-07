import * as React from "react"

/** Returns `value` delayed by `delay`ms — search inputs stay snappy while
 *  queries fire only after the user pauses typing. */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
