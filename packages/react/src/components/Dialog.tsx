import { useEffect, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useDismissable } from "../utils/dismissable";
import { useElementRef } from "../utils/elementRef";
import { useFocusTrap } from "../utils/focusTrap";
import { lockBodyScroll, useLayerZIndex } from "../utils/layers";
import { Portal } from "../utils/portal";
import { useControllableState } from "../utils/useControllableState";
import { Button } from "./Button";
import { TitleBar, type TitleBarControl } from "./TitleBar";

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Caption shown in the title bar. */
	title?: ReactNode;
	/** Accessible name for dialogs that have no visible caption. */
	label?: string;
	/** Title bar commands. Defaults to a close button only. */
	controls?: TitleBarControl[];
	/** Localised accessible names for the title bar buttons. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Called for every title bar command, in addition to the built-in close. */
	onControl?: (action: TitleBarControl) => void;
	/** Rendered right-aligned under the body — the usual `<Button>` row. */
	footer?: ReactNode;
	/** Draw the dimming backdrop. Defaults to `true`. */
	overlay?: boolean;
	/** A click on the backdrop closes the dialog. Defaults to `false`, as in Windows 98. */
	closeOnOverlayClick?: boolean;
	/** Escape closes the dialog. Defaults to `true`. */
	closeOnEscape?: boolean;
	/**
	 * Modal dialogs trap Tab, hide the rest of the page from assistive
	 * technology and lock body scrolling. Defaults to `true`.
	 */
	modal?: boolean;
	width?: number | string;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}

/**
 * A Windows 98 modal dialog: a real window, centred over a dimmed page.
 *
 * ```tsx
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete file"
 *   footer={
 *     <>
 *       <Button variant="default" onClick={confirm}>Yes</Button>
 *       <Button onClick={() => setOpen(false)}>No</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to send this file to the Recycle Bin?
 * </Dialog>
 * ```
 *
 * The portal, the focus trap, the scroll lock and the `z-index` stack all come
 * from the shared layer utilities, so a dialog opened from inside another dialog
 * stacks and traps correctly.
 */
export function Dialog({
	open,
	defaultOpen = false,
	onOpenChange,
	title,
	label,
	controls = ["close"],
	labels,
	onControl,
	footer,
	overlay = true,
	closeOnOverlayClick = false,
	closeOnEscape = true,
	modal = true,
	width,
	inline,
	container,
	className,
	style,
	children,
	...rest
}: DialogProps) {
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});
	const {
		ref: surfaceRef,
		setRef: setSurfaceRef,
		version: surfaceVersion,
	} = useElementRef<HTMLDivElement>();
	const zIndex = useLayerZIndex(isOpen);
	const titleId = useId();

	useDismissable({
		enabled: isOpen,
		onDismiss: () => setOpen(false),
		refs: [surfaceRef],
		layer: zIndex,
		escape: closeOnEscape,
		// The backdrop is the only "outside": a dialog is centred and covers
		// everything else, so a pointer press outside it *is* a backdrop click.
		outsidePointerDown: closeOnOverlayClick,
	});

	useFocusTrap(surfaceRef, {
		active: isOpen && modal,
		wrap: true,
		// Windows gives the default button focus, not the title bar close box.
		initialFocus: () =>
			surfaceRef.current?.querySelector<HTMLElement>("button.default") ?? null,
		restoreFocus: true,
		layer: zIndex,
		nodeVersion: surfaceVersion,
	});

	useEffect(() => {
		if (!isOpen || !modal) return;
		return lockBodyScroll();
	}, [isOpen, modal]);

	if (!isOpen) return null;

	const hasTitle = title !== undefined;

	return (
		<Portal container={container} disabled={inline}>
			{overlay && <div className="dialog-overlay" style={{ zIndex }} />}
			<div
				ref={setSurfaceRef}
				role="dialog"
				aria-modal={modal || undefined}
				aria-labelledby={hasTitle ? titleId : undefined}
				aria-label={hasTitle ? undefined : label}
				tabIndex={-1}
				className={cx("window", "dialog", className)}
				style={{ width, zIndex: zIndex + 1, ...style }}
				{...rest}
			>
				{hasTitle && (
					<TitleBar
						text={<span id={titleId}>{title}</span>}
						controls={controls}
						labels={labels}
						onControl={(action) => {
							onControl?.(action);
							if (action === "close") setOpen(false);
						}}
					/>
				)}
				<div className="window-body">{children}</div>
				{footer !== undefined && <div className="dialog-buttons">{footer}</div>}
			</div>
		</Portal>
	);
}

/* -------------------------------------------------------------- message box */

/** The icons Windows 98 puts in a message box. */
export type MessageBoxIcon = "info" | "warning" | "error" | "question";

/** The buttons a message box can offer. */
export type MessageBoxButton = "ok" | "cancel" | "yes" | "no" | "retry";

/** English labels used when no localised `buttonLabels` are supplied. */
export const MESSAGE_BOX_BUTTON_LABELS: Record<MessageBoxButton, string> = {
	ok: "OK",
	cancel: "Cancel",
	yes: "Yes",
	no: "No",
	retry: "Retry",
};

export interface MessageBoxProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	title?: ReactNode;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	/** Glyph drawn to the left of the message. */
	icon?: MessageBoxIcon;
	/** The message itself. */
	children: ReactNode;
	/** Which buttons to show, left to right. Defaults to `["ok"]`. */
	buttons?: MessageBoxButton[];
	/** The button that responds to Enter. Defaults to the first one. */
	defaultButton?: MessageBoxButton;
	/** Called with the button that was pressed. The box also closes itself. */
	onResult?: (result: MessageBoxButton) => void;
	/** Localised button labels. */
	buttonLabels?: Partial<Record<MessageBoxButton, string>>;
	width?: number | string;
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * The Windows 98 message box, built on `Dialog`.
 *
 * ```tsx
 * <MessageBox
 *   open={open}
 *   onOpenChange={setOpen}
 *   icon="warning"
 *   title="Format complete"
 *   buttons={["ok", "cancel"]}
 *   onResult={(result) => console.log(result)}
 * >
 *   Setup has finished copying files.
 * </MessageBox>
 * ```
 */
export function MessageBox({
	open,
	defaultOpen = false,
	onOpenChange,
	title,
	label,
	icon,
	children,
	buttons = ["ok"],
	defaultButton,
	onResult,
	buttonLabels,
	width = 340,
	inline,
	container,
	className,
}: MessageBoxProps) {
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});
	const primary = defaultButton ?? buttons[0];

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setOpen}
			title={title}
			label={label}
			width={width}
			inline={inline}
			container={container}
			className={className}
			footer={buttons.map((button) => (
				<Button
					key={button}
					variant={button === primary ? "default" : "normal"}
					onClick={() => {
						onResult?.(button);
						setOpen(false);
					}}
				>
					{buttonLabels?.[button] ?? MESSAGE_BOX_BUTTON_LABELS[button]}
				</Button>
			))}
		>
			<div className="message-box">
				{icon !== undefined && (
					<span
						className={cx("message-box-icon", `message-box-icon-${icon}`)}
						aria-hidden="true"
					/>
				)}
				<div className="message-box-text">{children}</div>
			</div>
		</Dialog>
	);
}
