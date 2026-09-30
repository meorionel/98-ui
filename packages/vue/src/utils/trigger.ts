import { cloneVNode, defineComponent, mergeProps, type PropType, type VNode } from "vue";

type RefTarget = unknown;

function isElement(value: unknown): value is HTMLElement {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as { nodeType?: number }).nodeType === 1
	);
}

/** The DOM element behind a template ref, unwrapping a component instance. */
export function refToElement(target: RefTarget): HTMLElement | null {
	if (isElement(target)) return target;
	const element = (target as { $el?: unknown } | null)?.$el;
	return isElement(element) ? element : null;
}

/** True for vnodes that render nothing of their own (text, comments, fragments). */
function isRenderable(vnode: VNode | null | undefined): vnode is VNode {
	return !!vnode && typeof vnode.type !== "symbol";
}

/**
 * Picks the trigger element out of a slot's children.
 *
 * Slot content arrives as an array that may carry whitespace text nodes, so the
 * first real element or component is the trigger.
 */
export function firstVNode(children: unknown): VNode | null {
	const list = Array.isArray(children) ? children : [children];
	for (const child of list) {
		if (isRenderable(child as VNode | null)) return child as VNode;
	}
	return null;
}

/**
 * Clones a trigger element and merges our props into it.
 *
 * The Vue counterpart of React's `cloneElement`: `DropdownMenu`, `Popover` and
 * `Tooltip` need a ref, click handlers and ARIA state on a trigger the *caller*
 * authored. `mergeProps` chains event handlers so the caller's own handler runs
 * first — if it calls `preventDefault()` we can see that and skip our own
 * behaviour — and their ref is preserved alongside ours.
 *
 * **This must run inside a render function.** Vue records the ref owner
 * (`currentRenderingInstance`) when a vnode is created, and drops the ref with a
 * warning otherwise — which is exactly why `TriggerHost` below exists.
 */
export function cloneTrigger(
	vnode: VNode | null,
	extraProps: Record<string, unknown>,
	setElement?: (element: HTMLElement | null) => void,
): VNode | null {
	if (!vnode) return null;

	const merged: Record<string, unknown> = { ...extraProps };
	if (setElement) {
		// The ref has to travel *through* `cloneVNode` so that Vue can record its
		// owner; assigning `cloned.ref` afterwards produces a raw ref that
		// `setRef` cannot resolve and warns about.
		merged.ref = (target: RefTarget) => {
			setElement(refToElement(target));
		};
	}

	return cloneVNode(vnode, mergeProps(vnode.props ?? {}, merged), true);
}

/**
 * Renders the caller's trigger with the component's own props merged in.
 *
 * The cloning has to happen inside a render function, so the trigger is handed
 * over as a slot and cloned here rather than in a computed property.
 *
 * ```vue
 * <TriggerHost
 *   :content="slots.default"
 *   :bindings="{ 'aria-expanded': isOpen, onClick: toggle }"
 *   :on-element="(el) => (triggerEl = el)"
 * />
 * ```
 */
export const TriggerHost = defineComponent({
	name: "TriggerHost",
	props: {
		/** The `#trigger` (or default) slot function. */
		content: {
			type: Function as PropType<(() => unknown) | undefined>,
			default: undefined,
		},
		/** Props merged into the trigger element. */
		bindings: {
			type: Object as PropType<Record<string, unknown>>,
			default: () => ({}),
		},
		/** Called with the trigger's DOM element whenever it attaches. */
		onElement: {
			type: Function as PropType<(element: HTMLElement | null) => void>,
			default: undefined,
		},
	},
	setup(props) {
		return () =>
			cloneTrigger(
				firstVNode(props.content?.()),
				props.bindings,
				props.onElement ?? undefined,
			);
	},
});

/** Renders a raw vnode from a prop. Handy for `AccessKey`-style fragments. */
export const RenderVNode = defineComponent({
	name: "RenderVNode",
	props: {
		vnode: { type: null as unknown as PropType<VNode | null>, default: null },
	},
	setup(props) {
		return () => props.vnode;
	},
});
