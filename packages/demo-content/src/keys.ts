/** Collects every dotted leaf path from a nested message dictionary. */
export function flattenKeys(value: unknown, prefix = ""): string[] {
	if (typeof value === "string") return prefix ? [prefix] : [];
	if (value && typeof value === "object") {
		return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
			flattenKeys(child, prefix ? `${prefix}.${key}` : key),
		);
	}
	return [];
}
