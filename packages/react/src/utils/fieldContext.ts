import { createContext, useContext } from "react";

/**
 * What a `Field` tells the control inside it.
 *
 * A field owns the label, the description and the error message, so the control
 * does not have to repeat any of them: `TextBox`, `TextArea`, `Select` and
 * `ComboBox` read this context and wire the id and ARIA attributes themselves,
 * and skip their own `<label>` while they are inside a field.
 */
export interface FieldContextValue {
	/** Id the label points at, applied to the inner control. */
	controlId: string;
	/** Space-separated ids of the description and error nodes. */
	describedBy?: string;
	/** True once the field has an error. */
	invalid: boolean;
	required: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** The surrounding `Field`, or `null` when the control stands alone. */
export function useField(): FieldContextValue | null {
	return useContext(FieldContext);
}
