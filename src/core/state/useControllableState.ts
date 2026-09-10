import { useState, useCallback, useRef } from 'react'

interface UseControllableStateOptions<T> {
  value?: T
  defaultValue?: T | (() => T)
  onChange?: (value: T) => void
}

export function useControllableState<T>({
  value: valueProp,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (nextValue: T | ((prev: T) => T)) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(() => {
    if (valueProp !== undefined) return valueProp
    if (typeof defaultValue === 'function') {
      return (defaultValue as () => T)()
    }
    return defaultValue as T
  })

  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      const setter = nextValue as (prev: T) => T
      const resolvedValue =
        typeof nextValue === 'function' ? setter(isControlled ? (valueProp as T) : uncontrolledValue) : nextValue

      if (!isControlled) {
        setUncontrolledValue(resolvedValue)
      }
      onChangeRef.current?.(resolvedValue)
    },
    [isControlled, valueProp, uncontrolledValue]
  )

  return [value, setValue]
}
