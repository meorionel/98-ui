import { type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { Dialog, type DialogProps } from "./Dialog";
import { focusElement } from "../utils/focusTrap";

export interface WizardStep {
	/** Stable identity for the step. */
	key: string;
	/** Caption in the step list. */
	title: ReactNode;
	/** The page itself. */
	content: ReactNode;
	/** Optional line under the content. */
	description?: ReactNode;
	/** Block "Next" while this step is showing. */
	disabled?: boolean;
}

export interface WizardLabels {
	back: string;
	next: string;
	finish: string;
	cancel: string;
	/** The "Step 2 of 4" readout. */
	stepOf: (step: number, count: number) => ReactNode;
}

/** English wizard button labels. */
export const WIZARD_LABELS: WizardLabels = {
	back: "Back",
	next: "Next",
	finish: "Finish",
	cancel: "Cancel",
	stepOf: (step, count) => `Step ${step} of ${count}`,
};

export interface WizardProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Caption in the title bar. */
	title?: ReactNode;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	steps: WizardStep[];
	/** Controlled step index, 0-based. */
	step?: number;
	/** Initial step index while uncontrolled. */
	defaultStep?: number;
	onStepChange?: (step: number) => void;
	/** Called by Finish, before the dialog closes. */
	onFinish?: () => void;
	onCancel?: () => void;
	/** Localised button labels and readout. */
	labels?: Partial<WizardLabels>;
	/** Show the list of steps on the left. Defaults to `true`. */
	showSteps?: boolean;
	width?: number | string;
	/** Extra props forwarded to the underlying `Dialog`. */
	dialogProps?: Omit<DialogProps, "title" | "label" | "footer" | "children" | "width">;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A Windows 98 wizard: Back, Next and Finish over an ordered set of pages.
 *
 * ```tsx
 * <Wizard
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Add Hardware Wizard"
 *   onFinish={install}
 *   steps={[
 *     { key: "welcome", title: "Welcome", content: <p>This wizard helps you install hardware.</p> },
 *     { key: "device", title: "Device", content: <DevicePicker /> },
 *     { key: "done", title: "Finish", content: <p>The device is installed.</p> },
 *   ]}
 * />
 * ```
 *
 * The step list on the left jumps between pages, the footer reports where you
 * are, and `Next` becomes `Finish` on the last step. `Enter` follows the default
 * button, so the whole wizard can be driven from the keyboard.
 */
export function Wizard({
	open,
	defaultOpen = false,
	onOpenChange,
	title,
	label,
	steps,
	step: stepProp,
	defaultStep = 0,
	onStepChange,
	onFinish,
	onCancel,
	labels,
	showSteps = true,
	width = 460,
	dialogProps,
	inline,
	container,
	className,
}: WizardProps) {
	const merged: WizardLabels = { ...WIZARD_LABELS, ...labels };
	const lastIndex = Math.max(0, steps.length - 1);

	const [step, setStep] = useControllableState<number>({
		value: stepProp,
		defaultValue: defaultStep,
		onChange: onStepChange,
	});
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const current = Math.min(Math.max(0, step), lastIndex);
	const active = steps[current];
	const isLast = current >= lastIndex;

	const goTo = (next: number) => {
		const target = Math.min(Math.max(0, next), lastIndex);
		if (steps[target]?.disabled) return;
		setStep(target);
		focusElement(
			typeof document === "undefined"
				? null
				: document.querySelector<HTMLElement>(`[data-wizard-step="${target}"]`),
		);
	};

	const finish = () => {
		onFinish?.();
		setOpen(false);
	};

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
			className={cx("wizard", className)}
			footer={
				<div className="wizard-footer">
					<span className="wizard-status">
						{merged.stepOf(current + 1, steps.length)}
					</span>
					<ButtonGroup>
						<Button disabled={current === 0} onClick={() => goTo(current - 1)}>
							{merged.back}
						</Button>
						{isLast ? (
							<Button variant="default" onClick={finish}>
								{merged.finish}
							</Button>
						) : (
							<Button
								variant="default"
								disabled={active?.disabled === true}
								onClick={() => goTo(current + 1)}
							>
								{merged.next}
							</Button>
						)}
						<Button
							onClick={() => {
								onCancel?.();
								setOpen(false);
							}}
						>
							{merged.cancel}
						</Button>
					</ButtonGroup>
				</div>
			}
		>
			<div className="wizard-body">
				{showSteps && (
					<ol className="wizard-steps">
						{steps.map((entry, index) => (
							<li key={entry.key}>
								<button
									type="button"
									data-wizard-step={index}
									className={cx(
										"wizard-step",
										index === current && "wizard-step-active",
										index < current && "wizard-step-done",
										entry.disabled && "wizard-step-disabled",
									)}
									aria-current={index === current ? "step" : undefined}
									disabled={entry.disabled}
									onClick={() => goTo(index)}
								>
									<span className="wizard-step-number" aria-hidden="true">
										{index + 1}
									</span>
									{entry.title}
								</button>
							</li>
						))}
					</ol>
				)}
				<div className="wizard-page">
					{active?.content}
					{active?.description !== undefined && (
						<p className="wizard-description">{active.description}</p>
					)}
				</div>
			</div>
		</Dialog>
	);
}
