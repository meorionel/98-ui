import { type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";
import { Button } from "./Button";
import { Dialog, type DialogProps } from "./Dialog";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

export interface PropertySheetTab {
	/** Identifies the tab and its page. */
	value: string;
	/** The tab caption. */
	label: ReactNode;
	/** The page content. */
	content: ReactNode;
	disabled?: boolean;
}

export interface PropertySheetProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Caption in the title bar. */
	title?: ReactNode;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	tabs: PropertySheetTab[];
	/** Controlled active tab. */
	value?: string;
	/** Initial active tab while uncontrolled. Defaults to the first tab. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** The OK button. Closes the sheet unless `closeOnOk` is `false`. */
	onOk?: () => void;
	onCancel?: () => void;
	/** Adds an Apply button when provided. */
	onApply?: () => void;
	okLabel?: string;
	cancelLabel?: string;
	applyLabel?: string;
	closeOnOk?: boolean;
	width?: number | string;
	/** Extra props forwarded to the underlying `Dialog`. */
	dialogProps?: Omit<DialogProps, "title" | "label" | "footer" | "children" | "width">;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A Windows 98 property sheet: a modal dialog whose pages are tabs, with OK,
 * Cancel and an optional Apply.
 *
 * ```tsx
 * <PropertySheet
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Display Properties"
 *   tabs={[
 *     { value: "background", label: "Background", content: <BackgroundPage /> },
 *     { value: "settings", label: "Settings", content: <SettingsPage /> },
 *   ]}
 *   onApply={apply}
 * />
 * ```
 *
 * It is `Dialog` plus `Tabs`, so stacking, focus trapping, `Escape` and the
 * dimmed backdrop all behave exactly as they do for any other dialog.
 */
export function PropertySheet({
	open,
	defaultOpen = false,
	onOpenChange,
	title,
	label,
	tabs,
	value,
	defaultValue,
	onValueChange,
	onOk,
	onCancel,
	onApply,
	okLabel = "OK",
	cancelLabel = "Cancel",
	applyLabel = "Apply",
	closeOnOk = true,
	width = 420,
	dialogProps,
	inline,
	container,
	className,
}: PropertySheetProps) {
	const [activeTab, setActiveTab] = useControllableState<string>({
		value,
		defaultValue: defaultValue ?? tabs[0]?.value ?? "",
		onChange: onValueChange,
	});
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	return (
		<Dialog
			{...dialogProps}
			open={isOpen}
			onOpenChange={setOpen}
			title={title}
			label={label}
			width={width}
			inline={inline}
			container={container}
			className={cx("property-sheet", className)}
			footer={
				<>
					{onApply !== undefined && <Button onClick={onApply}>{applyLabel}</Button>}
					<Button
						variant="default"
						onClick={() => {
							onOk?.();
							if (closeOnOk) setOpen(false);
						}}
					>
						{okLabel}
					</Button>
					<Button
						onClick={() => {
							onCancel?.();
							setOpen(false);
						}}
					>
						{cancelLabel}
					</Button>
				</>
			}
		>
			<Tabs value={activeTab} onChange={setActiveTab} keepMounted>
				<TabList label={label ?? (typeof title === "string" ? title : undefined)} multirows>
					{tabs.map((tab) => (
						<Tab key={tab.value} value={tab.value} disabled={tab.disabled}>
							{tab.label}
						</Tab>
					))}
				</TabList>
				{tabs.map((tab) => (
					<TabPanel
						key={tab.value}
						value={tab.value}
						variant="flat"
						body={false}
						className="property-page"
					>
						{tab.content}
					</TabPanel>
				))}
			</Tabs>
		</Dialog>
	);
}
