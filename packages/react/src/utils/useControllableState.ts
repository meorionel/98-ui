import { useCallback, useRef, useState } from "react";

export interface UseControllableStateOptions<T> {
	/** Controlled value. When provided the hook is fully controlled. */
	value?: T;
	/** Initial value used while uncontrolled. */
	defaultValue: T;
	/** Notified on every change request. */
	onChange?: (value: T) => void;
}

/**
 * Supports both controlled (`value` + `onChange`) and uncontrolled
 * (`defaultValue`) usage for a single value, the same way Radix and Reach do.
 */
export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: UseControllableStateOptions<T>): [T, (next: T | ((prev: T) => T)) => void] {
	const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
	const isControlled = value !== undefined;
	const current = isControlled ? (value as T) : uncontrolled;

	// Keep the latest values in refs so the setter identity stays stable.
	const currentRef = useRef(current);
	currentRef.current = current;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const isControlledRef = useRef(isControlled);
	isControlledRef.current = isControlled;

	const setValue = useCallback((next: T | ((prev: T) => T)) => {
		const resolved =
			typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
		if (!isControlledRef.current) setUncontrolled(resolved);
		onChangeRef.current?.(resolved);
	}, []);

	return [current, setValue];
}
