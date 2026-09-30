import {
	createContext,
	forwardRef,
	useContext,
	useId,
	useRef,
	type HTMLAttributes,
	type KeyboardEvent,
	type LiHTMLAttributes,
	type MenuHTMLAttributes,
	type MouseEvent,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";

interface TabsContextValue {
	value: string;
	setValue: (value: string) => void;
	baseId: string;
	keepMounted: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
	const context = useContext(TabsContext);
	if (!context) {
		throw new Error(`<${component}> must be rendered inside a <Tabs> component.`);
	}
	return context;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Controlled active tab value. */
	value?: string;
	/** Initial active tab value for uncontrolled usage. */
	defaultValue?: string;
	onChange?: (value: string) => void;
	/**
	 * Keep inactive panels mounted and hide them with `hidden` instead of
	 * unmounting. Useful when panel content holds state or expensive DOM.
	 */
	keepMounted?: boolean;
}

/**
 * A tab control.
 *
 * ```tsx
 * <Tabs defaultValue="desktop">
 *   <TabList>
 *     <Tab value="desktop">Desktop</Tab>
 *     <Tab value="computer">My computer</Tab>
 *   </TabList>
 *   <TabPanel value="desktop">the tab content</TabPanel>
 * </Tabs>
 * ```
 *
 * State lives here, so no custom JavaScript is needed to toggle
 * `aria-selected` the way the plain-CSS version required.
 */
export function Tabs({
	value,
	defaultValue = "",
	onChange,
	keepMounted = false,
	className,
	children,
	...rest
}: TabsProps) {
	const baseId = useId();
	const [selected, setSelected] = useControllableState<string>({
		value,
		defaultValue,
		onChange,
	});

	return (
		<TabsContext.Provider
			value={{ value: selected, setValue: setSelected, baseId, keepMounted }}
		>
			<div className={cx(className)} {...rest}>
				{children}
			</div>
		</TabsContext.Provider>
	);
}

// React types the intrinsic `<menu>` element as `HTMLElement` (not
// `HTMLMenuElement`), so the ref types follow suit.
export interface TabListProps extends MenuHTMLAttributes<HTMLElement> {
	/** Stretch the tabs evenly across the full width (`menu.multirows`). */
	multirows?: boolean;
	/** Accessible name for the tab list. */
	label?: string;
}

/** The strip of tabs. Renders `<menu role="tablist">`. */
export const TabList = forwardRef<HTMLElement, TabListProps>(function TabList(
	{ multirows = false, label, className, children, onKeyDown, ...rest },
	ref,
) {
	const listRef = useRef<HTMLElement | null>(null);

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		onKeyDown?.(event);
		if (event.defaultPrevented) return;

		const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
		if (!keys.includes(event.key)) return;

		const tabs = Array.from(
			listRef.current?.querySelectorAll<HTMLLIElement>(
				'[role="tab"]:not([aria-disabled="true"])',
			) ?? [],
		);
		if (tabs.length === 0) return;

		event.preventDefault();
		const current = tabs.findIndex((tab) => tab === document.activeElement);
		let next = current;
		if (event.key === "ArrowRight") next = (current + 1 + tabs.length) % tabs.length;
		if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
		if (event.key === "Home") next = 0;
		if (event.key === "End") next = tabs.length - 1;

		const nextTab = tabs[next];
		nextTab.focus();
		// Follow the Windows behaviour: arrowing to a tab selects it.
		const link = nextTab.querySelector<HTMLAnchorElement>("a");
		if (link) link.click();
	};

	return (
		<menu
			ref={(node) => {
				listRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) ref.current = node;
			}}
			role="tablist"
			aria-label={label}
			className={cx(multirows && "multirows", className)}
			onKeyDown={handleKeyDown}
			{...rest}
		>
			{children}
		</menu>
	);
});

export interface TabProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "onSelect"> {
	/** Identifies this tab and links it to the matching `TabPanel`. */
	value: string;
	/** Render the tab inert: it cannot be selected or reached with the arrow keys. */
	disabled?: boolean;
	children?: ReactNode;
}

/** A single tab. The anchor inside keeps the original focus styling. */
export const Tab = forwardRef<HTMLLIElement, TabProps>(function Tab(
	{ value, disabled = false, className, children, onClick, onKeyDown, ...rest },
	ref,
) {
	const { value: selected, setValue, baseId } = useTabsContext("Tab");
	const isSelected = selected === value;
	const panelId = `${baseId}-panel-${value}`;
	const tabId = `${baseId}-tab-${value}`;

	const select = () => {
		if (!disabled) setValue(value);
	};

	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		select();
	};

	return (
		<li
			ref={ref}
			id={tabId}
			role="tab"
			aria-selected={isSelected}
			aria-controls={panelId}
			aria-disabled={disabled || undefined}
			tabIndex={disabled ? -1 : isSelected ? 0 : -1}
			className={cx(className)}
			onKeyDown={onKeyDown}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) select();
			}}
			{...rest}
		>
			<a href={`#${panelId}`} onClick={handleClick}>
				{children}
			</a>
		</li>
	);
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
	/** Must match the `value` of the `Tab` it belongs to. */
	value: string;
	/** Wrap the content in a `.window-body`. Defaults to `true`. */
	body?: boolean;
	/**
	 * `"window"` (default) draws the raised panel that merges with the selected
	 * tab. `"flat"` drops the window chrome so the panel can live inside a
	 * dialog — that is what `PropertySheet` uses.
	 */
	variant?: "window" | "flat";
}

/**
 * The panel shown for the matching `Tab`. Renders a `.window[role=tabpanel]`
 * so it visually merges with the selected tab.
 */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
	{ value, body = true, variant = "window", className, children, ...rest },
	ref,
) {
	const { value: selected, baseId, keepMounted } = useTabsContext("TabPanel");
	const isSelected = selected === value;
	if (!isSelected && !keepMounted) return null;

	const panelId = `${baseId}-panel-${value}`;
	const tabId = `${baseId}-tab-${value}`;

	return (
		<div
			ref={ref}
			id={panelId}
			role="tabpanel"
			aria-labelledby={tabId}
			hidden={!isSelected}
			tabIndex={0}
			className={cx(variant === "window" && "window", className)}
			{...rest}
		>
			{body ? <div className="window-body">{children}</div> : children}
		</div>
	);
});
