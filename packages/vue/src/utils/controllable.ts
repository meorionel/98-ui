import { computed, ref, type ComputedRef, type Ref } from "vue";

export interface UseControllableStateOptions<T> {
	/** Controlled value getter. When it returns a value the state is controlled. */
	value: () => T | undefined;
	/** Initial value used while uncontrolled. */
	defaultValue: T;
	/** Notified on every change request. */
	onChange?: (value: T) => void;
}

/**
 * Supports both controlled (`v-model` / `value` + `onChange`) and uncontrolled
 * (`defaultValue`) usage for a single value.
 *
 * The Vue port takes the controlled value as a *getter* so a component can pass
 * `() => props.value` and stay reactive; React's `value` prop plays the same
 * role. Everything else — including the "never write local state while
 * controlled" rule — is unchanged.
 *
 * ```ts
 * const [open, setOpen] = useControllableState<boolean>({
 *   value: () => props.open,
 *   defaultValue: props.defaultOpen,
 *   onChange: (next) => emit("open-change", next),
 * });
 * ```
 */
export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: UseControllableStateOptions<T>): [ComputedRef<T>, (next: T | ((prev: T) => T)) => void] {
	const uncontrolled = ref(defaultValue) as Ref<T>;
	const isControlled = computed(() => value() !== undefined);
	const current = computed<T>(() => (isControlled.value ? (value() as T) : uncontrolled.value));

	const setValue = (next: T | ((prev: T) => T)) => {
		const resolved = typeof next === "function" ? (next as (prev: T) => T)(current.value) : next;
		if (!isControlled.value) uncontrolled.value = resolved;
		onChange?.(resolved);
	};

	return [current, setValue];
}
