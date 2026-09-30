/**
 * Public surface of 98-pink-vue.
 *
 * ```ts
 * import { Window, Button, Checkbox } from "98-pink-vue";
 * import "98-pink-vue/style.css";
 * ```
 *
 * Every component is a Vue single-file component; its props interface lives in
 * the plain `<script>` block of the file and is re-exported here as a type.
 */

// --- Utilities ------------------------------------------------------------
export { cx } from "./utils/cx";
export type { ClassValue } from "./utils/cx";
export { useControllableState } from "./utils/controllable";
export type { UseControllableStateOptions } from "./utils/controllable";
export { FIELD_CONTEXT, useField } from "./utils/fieldContext";
export type { FieldContextValue } from "./utils/fieldContext";
export { accessKeyParts, renderAccessKey } from "./utils/access-key";
export type { AccessKeyPart } from "./utils/access-key";
export { default as Portal } from "./utils/Portal.vue";
export type { PortalProps } from "./utils/Portal.vue";
export { default as FloatingSurface } from "./utils/FloatingSurface.vue";
export type { FloatingSurfaceProps } from "./utils/FloatingSurface.vue";
export { computeFloatingPosition, useFloating } from "./utils/floating";
export type {
	Align,
	ComputePositionOptions,
	FloatingPosition,
	Side,
	UseFloatingOptions,
	UseFloatingResult,
} from "./utils/floating";
export { cloneTrigger, firstVNode, refToElement, RenderVNode, TriggerHost } from "./utils/trigger";
export { focusElement, getFocusable, useFocusTrap } from "./utils/focusTrap";
export type { InitialFocus, UseFocusTrapOptions } from "./utils/focusTrap";
export {
	isTopLayer,
	LAYER_BASE_Z_INDEX,
	lockBodyScroll,
	nextLayerZIndex,
	registerLayer,
	unregisterLayer,
	useLayerZIndex,
} from "./utils/layers";
export { useDismissable } from "./utils/dismissable";
export type { UseDismissableOptions } from "./utils/dismissable";
export { AccessKey } from "./components/AccessKey";

// --- Form controls --------------------------------------------------------
export { default as Button } from "./components/Button.vue";
export type { ButtonProps } from "./components/Button.vue";
export { default as Checkbox } from "./components/Checkbox.vue";
export type { CheckboxProps } from "./components/Checkbox.vue";
export { default as Radio } from "./components/Radio.vue";
export type { RadioProps } from "./components/Radio.vue";
export { default as RadioGroup } from "./components/RadioGroup.vue";
export type { RadioGroupProps, RadioGroupOption } from "./components/RadioGroup.vue";
export { default as GroupBox } from "./components/GroupBox.vue";
export type { GroupBoxProps } from "./components/GroupBox.vue";
export { default as TextBox } from "./components/TextBox.vue";
export type { TextBoxProps, TextBoxType, FieldLayout } from "./components/TextBox.vue";
export { default as TextArea } from "./components/TextArea.vue";
export type { TextAreaProps } from "./components/TextArea.vue";
export { default as FieldLabel } from "./components/FieldLabel.vue";
export type { FieldLabelProps } from "./components/FieldLabel.vue";
export { default as Select } from "./components/Select.vue";
export type { SelectProps, SelectOption } from "./components/Select.vue";
export { default as Slider } from "./components/Slider.vue";
export type { SliderProps } from "./components/Slider.vue";
export { default as SpinBox, SPIN_BOX_LABELS } from "./components/SpinBox.vue";
export type { SpinBoxProps } from "./components/SpinBox.vue";
export {
	default as Calendar,
	CALENDAR_MONTHS,
	CALENDAR_WEEKDAYS,
	parseIsoDate,
	toIsoDate,
} from "./components/Calendar.vue";
export type { CalendarProps, CalendarLabels } from "./components/Calendar.vue";
export { default as DatePicker } from "./components/DatePicker.vue";
export type { DatePickerProps } from "./components/DatePicker.vue";
export { default as ComboBox, comboBoxOptionText } from "./components/ComboBox.vue";
export type { ComboBoxProps, ComboBoxOption } from "./components/ComboBox.vue";
export { default as Field } from "./components/Field.vue";
export type { FieldProps } from "./components/Field.vue";
export { default as ButtonGroup } from "./components/ButtonGroup.vue";
export type { ButtonGroupProps } from "./components/ButtonGroup.vue";
export { default as ToggleButton } from "./components/ToggleButton.vue";
export type { ToggleButtonProps } from "./components/ToggleButton.vue";
export { default as ToggleGroup } from "./components/ToggleGroup.vue";
export type { ToggleGroupProps, ToggleGroupType } from "./components/ToggleGroup.vue";
export { default as ToggleGroupItem } from "./components/ToggleGroupItem.vue";
export type { ToggleGroupItemProps } from "./components/ToggleGroupItem.vue";
export { default as Toolbar } from "./components/Toolbar.vue";
export type { ToolbarProps } from "./components/Toolbar.vue";
export { default as ToolbarButton } from "./components/ToolbarButton.vue";
export type { ToolbarButtonProps } from "./components/ToolbarButton.vue";
export { default as ToolbarSeparator } from "./components/ToolbarSeparator.vue";
export type { ToolbarSeparatorProps } from "./components/ToolbarSeparator.vue";
export { default as ToolbarSpacer } from "./components/ToolbarSpacer.vue";
export type { ToolbarSpacerProps } from "./components/ToolbarSpacer.vue";
export { default as FieldRow } from "./components/FieldRow.vue";
export type { FieldRowProps } from "./components/FieldRow.vue";
export { default as FieldRowStacked } from "./components/FieldRowStacked.vue";
export type { FieldRowStackedProps } from "./components/FieldRowStacked.vue";

// --- Window chrome --------------------------------------------------------
export { default as Window } from "./components/Window.vue";
export type { WindowProps } from "./components/Window.vue";
export { default as WindowBody } from "./components/WindowBody.vue";
export type { WindowBodyProps } from "./components/WindowBody.vue";
export { default as TitleBar, TITLE_BAR_CONTROL_LABELS } from "./components/TitleBar.vue";
export type { TitleBarProps, TitleBarControl } from "./components/TitleBar.vue";
export { default as TitleBarButton } from "./components/TitleBarButton.vue";
export type { TitleBarButtonProps } from "./components/TitleBarButton.vue";
export { default as MenuBar } from "./components/MenuBar.vue";
export type { MenuBarProps, MenuBarItem } from "./components/MenuBar.vue";
export { default as MenuPopup } from "./components/MenuPopup.vue";
export type {
	MenuPopupProps,
	MenuEntry,
	MenuItemEntry,
	MenuSeparatorEntry,
	MenuLabelEntry,
	MenuCheckboxEntry,
	MenuRadioEntry,
	MenuSubmenuEntry,
} from "./components/MenuPopup.vue";
export { default as DropdownMenu } from "./components/DropdownMenu.vue";
export type { DropdownMenuProps } from "./components/DropdownMenu.vue";
export { default as ContextMenu } from "./components/ContextMenu.vue";
export type { ContextMenuProps } from "./components/ContextMenu.vue";
export { default as Dialog } from "./components/Dialog.vue";
export type { DialogProps } from "./components/Dialog.vue";
export { default as MessageBox, MESSAGE_BOX_BUTTON_LABELS } from "./components/MessageBox.vue";
export type { MessageBoxProps, MessageBoxIcon, MessageBoxButton } from "./components/MessageBox.vue";
export { default as Tooltip } from "./components/Tooltip.vue";
export type { TooltipProps } from "./components/Tooltip.vue";
export { default as Popover } from "./components/Popover.vue";
export type { PopoverProps } from "./components/Popover.vue";
export { default as BalloonTip } from "./components/BalloonTip.vue";
export type { BalloonTipProps, BalloonCorner, BalloonIcon } from "./components/BalloonTip.vue";
export { default as PropertySheet } from "./components/PropertySheet.vue";
export type { PropertySheetProps, PropertySheetTab } from "./components/PropertySheet.vue";
export { default as Wizard, WIZARD_LABELS } from "./components/Wizard.vue";
export type { WizardProps, WizardStep, WizardLabels } from "./components/Wizard.vue";
export { default as StatusBar } from "./components/StatusBar.vue";
export type { StatusBarProps } from "./components/StatusBar.vue";
export { default as StatusBarField } from "./components/StatusBarField.vue";
export type { StatusBarFieldProps } from "./components/StatusBarField.vue";

// --- Data display ---------------------------------------------------------
export { default as TreeView } from "./components/TreeView.vue";
export type { TreeViewProps } from "./components/TreeView.vue";
export { default as TreeViewItem } from "./components/TreeViewItem.vue";
export type { TreeViewItemProps } from "./components/TreeViewItem.vue";
export { default as TreeViewBranch } from "./components/TreeViewBranch.vue";
export type { TreeViewBranchProps } from "./components/TreeViewBranch.vue";
export { default as TreeViewLink } from "./components/TreeViewLink.vue";
export type { TreeViewLinkProps } from "./components/TreeViewLink.vue";
export { default as Tabs } from "./components/Tabs.vue";
export type { TabsProps } from "./components/Tabs.vue";
export { default as TabList } from "./components/TabList.vue";
export type { TabListProps } from "./components/TabList.vue";
export { default as Tab } from "./components/Tab.vue";
export type { TabProps } from "./components/Tab.vue";
export { default as TabPanel } from "./components/TabPanel.vue";
export type { TabPanelProps } from "./components/TabPanel.vue";
export { default as Table } from "./components/Table.vue";
export type { TableProps } from "./components/Table.vue";
export { default as TableHead } from "./components/TableHead.vue";
export type { TableHeadProps } from "./components/TableHead.vue";
export { default as TableBody } from "./components/TableBody.vue";
export type { TableBodyProps } from "./components/TableBody.vue";
export { default as TableRow } from "./components/TableRow.vue";
export type { TableRowProps } from "./components/TableRow.vue";
export { default as TableHeaderCell } from "./components/TableHeaderCell.vue";
export type { TableHeaderCellProps } from "./components/TableHeaderCell.vue";
export { default as TableCell } from "./components/TableCell.vue";
export type { TableCellProps } from "./components/TableCell.vue";
export { default as TableView } from "./components/TableView.vue";
export type {
	TableViewProps,
	TableViewColumn,
	TableSortState,
	SortDirection,
} from "./components/TableView.vue";
export { default as ProgressIndicator } from "./components/ProgressIndicator.vue";
export type { ProgressIndicatorProps } from "./components/ProgressIndicator.vue";
export { default as Badge } from "./components/Badge.vue";
export type { BadgeProps, BadgeVariant } from "./components/Badge.vue";
export { default as Avatar } from "./components/Avatar.vue";
export type { AvatarProps } from "./components/Avatar.vue";
export { default as Card } from "./components/Card.vue";
export type { CardProps } from "./components/Card.vue";
export { default as CardHeader } from "./components/CardHeader.vue";
export type { CardHeaderProps } from "./components/CardHeader.vue";
export { default as CardTitle } from "./components/CardTitle.vue";
export type { CardTitleProps } from "./components/CardTitle.vue";
export { default as CardDescription } from "./components/CardDescription.vue";
export type { CardDescriptionProps } from "./components/CardDescription.vue";
export { default as CardContent } from "./components/CardContent.vue";
export type { CardContentProps } from "./components/CardContent.vue";
export { default as CardFooter } from "./components/CardFooter.vue";
export type { CardFooterProps } from "./components/CardFooter.vue";
export { default as Heading } from "./components/Heading.vue";
export type { HeadingProps, HeadingLevel } from "./components/Heading.vue";
export { default as Text } from "./components/Text.vue";
export type { TextProps, TextVariant } from "./components/Text.vue";
export { default as Prose } from "./components/Prose.vue";
export type { ProseProps } from "./components/Prose.vue";
export { default as Empty } from "./components/Empty.vue";
export type { EmptyProps } from "./components/Empty.vue";
export { default as Spinner } from "./components/Spinner.vue";
export type { SpinnerProps, SpinnerSize } from "./components/Spinner.vue";
export { default as Pagination, PAGINATION_LABELS } from "./components/Pagination.vue";
export type { PaginationProps, PaginationLabels } from "./components/Pagination.vue";

// --- Panels, layout & misc ------------------------------------------------
export { default as FieldBorder } from "./components/FieldBorder.vue";
export { default as FieldBorderDisabled } from "./components/FieldBorderDisabled.vue";
export { default as StatusFieldBorder } from "./components/StatusFieldBorder.vue";
export { default as SunkenPanel } from "./components/SunkenPanel.vue";
export type { SunkenPanelProps } from "./components/SunkenPanel.vue";
export { default as VerticalBar } from "./components/VerticalBar.vue";
export type { VerticalBarProps } from "./components/VerticalBar.vue";
export { default as Link } from "./components/Link.vue";
export type { LinkProps } from "./components/Link.vue";
export { default as CodeBlock } from "./components/CodeBlock.vue";
export type { CodeBlockProps } from "./components/CodeBlock.vue";
export { default as Separator } from "./components/Separator.vue";
export type { SeparatorProps, SeparatorOrientation } from "./components/Separator.vue";
export { default as Kbd } from "./components/Kbd.vue";
export type { KbdProps } from "./components/Kbd.vue";
export { default as SplitPane } from "./components/SplitPane.vue";
export type { SplitPaneProps, SplitDirection } from "./components/SplitPane.vue";
