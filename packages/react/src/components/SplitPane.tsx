import {
	forwardRef,
	useRef,
	useState,
	type HTMLAttributes,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";

/** `"horizontal"` puts the panes side by side and drags left/right. */
export type SplitDirection = "horizontal" | "vertical";

export interface SplitPaneProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Defaults to `"horizontal"`. */
	direction?: SplitDirection;
	/** Controlled size of the first pane, in pixels. */
	size?: number;
	/** Initial size of the first pane while uncontrolled. Defaults to `160`. */
	defaultSize?: number;
	onSizeChange?: (size: number) => void;
	/** Smallest size either pane may be dragged to. Defaults to `40`. */
	min?: number;
	/** Largest size the first pane may be dragged to. Defaults to the container minus `min`. */
	max?: number;
	/** How far one arrow press moves the divider. Defaults to `8`. */
	step?: number;
	/** Accessible name for the divider. */
	label?: string;
	disabled?: boolean;
	/** Left (or top) pane. */
	first: ReactNode;
	/** Right (or bottom) pane. It takes the remaining space. */
	second: ReactNode;
}

/**
 * Two panes with a draggable divider between them — the Windows 98 splitter.
 *
 * ```tsx
 * <SplitPane
 *   defaultSize={160}
 *   min={80}
 *   first={<TreeView>…</TreeView>}
 *   second={<TableView … />}
 * />
 * ```
 *
 * The divider is a real `separator`: it takes focus, exposes its size through
 * `aria-valuenow`, moves with the arrow keys, jumps with Home/End, and resets to
 * the default size on Enter or a double click. Dragging uses pointer capture, so
 * the pointer can leave the divider (or the window) mid-drag.
 */
export const SplitPane = forwardRef<HTMLDivElement, SplitPaneProps>(function SplitPane(
	{
		direction = "horizontal",
		size: sizeProp,
		defaultSize = 160,
		onSizeChange,
		min = 40,
		max,
		step = 8,
		label,
		disabled = false,
		first,
		second,
		className,
		...rest
	},
	ref,
) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [dragging, setDragging] = useState(false);

	const [size, setSize] = useControllableState<number>({
		value: sizeProp,
		defaultValue: defaultSize,
		onChange: onSizeChange,
	});

	const horizontal = direction === "horizontal";

	const clamp = (next: number) => {
		const rect = containerRef.current?.getBoundingClientRect();
		const total = rect ? (horizontal ? rect.width : rect.height) : undefined;
		const upper = Math.max(min, total === undefined ? (max ?? next) : total - min);
		const limit = max === undefined ? upper : Math.min(max, upper);
		return Math.round(Math.min(Math.max(next, min), limit));
	};

	const positionToSize = (event: PointerEvent<HTMLDivElement>) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;
		return horizontal ? event.clientX - rect.left : event.clientY - rect.top;
	};

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (disabled) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture?.(event.pointerId);
		setDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (!dragging || disabled) return;
		const next = positionToSize(event);
		if (next !== undefined) setSize(clamp(next));
	};

	const endDrag = (event: PointerEvent<HTMLDivElement>) => {
		if (!dragging) return;
		setDragging(false);
		event.currentTarget.releasePointerCapture?.(event.pointerId);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		const decrease = horizontal ? "ArrowLeft" : "ArrowUp";
		const increase = horizontal ? "ArrowRight" : "ArrowDown";

		switch (event.key) {
			case decrease:
				event.preventDefault();
				setSize(clamp(size - step));
				return;
			case increase:
				event.preventDefault();
				setSize(clamp(size + step));
				return;
			case "Home":
				event.preventDefault();
				setSize(clamp(min));
				return;
			case "End":
				event.preventDefault();
				setSize(clamp(Number.MAX_SAFE_INTEGER));
				return;
			case "Enter":
				event.preventDefault();
				setSize(clamp(defaultSize));
				return;
			default:
				return;
		}
	};

	return (
		<div
			{...rest}
			ref={(node) => {
				containerRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) ref.current = node;
			}}
			className={cx(
				"split-pane",
				!horizontal && "split-pane-vertical",
				dragging && "split-pane-dragging",
				className,
			)}
		>
			<div
				className="split-pane-pane"
				style={horizontal ? { width: size } : { height: size }}
			>
				{first}
			</div>
			<div
				role="separator"
				aria-orientation={horizontal ? "vertical" : "horizontal"}
				aria-label={label}
				aria-valuenow={size}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-disabled={disabled || undefined}
				tabIndex={disabled ? -1 : 0}
				className={cx("split-pane-divider", dragging && "split-pane-divider-dragging")}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onKeyDown={handleKeyDown}
				onDoubleClick={() => {
					if (!disabled) setSize(clamp(defaultSize));
				}}
			/>
			<div className="split-pane-pane split-pane-pane-fill">{second}</div>
		</div>
	);
});
