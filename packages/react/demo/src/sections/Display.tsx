import {
	Avatar,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Empty,
	FieldRow,
	Heading,
	ProgressIndicator,
	Prose,
	Spinner,
	SunkenPanel,
	Text,
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

/* -------------------------------------------------------- badge and avatar */

function BadgeAvatarSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="display.badgeAvatar.p1" as="p" />

			<Example
				code={`
					<Badge>New</Badge>
					<Badge variant="success">Saved</Badge>
					<Badge variant="warning">Unsaved changes</Badge>
					<Badge variant="error">3 errors</Badge>
					<Badge variant="info">Beta</Badge>
				`}
			>
				<FieldRow>
					<Badge>{t("display.badgeAvatar.new")}</Badge>
					<Badge variant="success">{t("display.badgeAvatar.saved")}</Badge>
					<Badge variant="warning">{t("display.badgeAvatar.warning")}</Badge>
					<Badge variant="error">{t("display.badgeAvatar.errors")}</Badge>
					<Badge variant="info">{t("display.badgeAvatar.info")}</Badge>
				</FieldRow>
			</Example>

			<T k="display.badgeAvatar.p2" as="p" />

			<Example
				code={`
					<Avatar fallback="MO" />
					<Avatar src="/me.png" alt="Meorion" size={48} shape="circle" fallback="MO" />
				`}
			>
				<FieldRow>
					<Avatar fallback="MO" />
					<span>{t("display.badgeAvatar.initials")}</span>
				</FieldRow>
				<br />
				<FieldRow>
					<Avatar
						src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
						alt=""
						size={48}
						shape="circle"
						fallback="MO"
					/>
					<span>{t("display.badgeAvatar.circle")}</span>
				</FieldRow>
			</Example>
		</Component>
	);
}

/* -------------------------------------------------------------------- card */

function CardSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="display.card.p1" as="p" />

			<Example
				code={`
					<Card style={{ width: 280 }}>
					  <CardHeader>
					    <CardTitle>Modem</CardTitle>
					    <CardDescription>Standard 56k modem</CardDescription>
					  </CardHeader>
					  <CardContent>Connected at 33.6 kbps.</CardContent>
					  <CardFooter>
					    <Button variant="default">Properties</Button>
					    <Button>Disconnect</Button>
					  </CardFooter>
					</Card>
				`}
			>
				<Card style={{ width: 280 }}>
					<CardHeader>
						<CardTitle>{t("display.card.title")}</CardTitle>
						<CardDescription>{t("display.card.description")}</CardDescription>
					</CardHeader>
					<CardContent>{t("display.card.content")}</CardContent>
					<CardFooter>
						<Button variant="default">{t("display.card.properties")}</Button>
						<Button>{t("display.card.disconnect")}</Button>
					</CardFooter>
				</Card>
			</Example>
		</Component>
	);
}

/* -------------------------------------------------------------- typography */

function TypographySection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="display.typography.p1" as="p" />

			<Example
				code={`
					<Heading level={2}>Disk Defragmenter</Heading>
					<Text variant="lead">Rearranges the files on your disk.</Text>
					<Text>You do not need to defragment an NTFS drive.</Text>
					<Text variant="muted">C:\\Windows\\System</Text>
					<Text variant="small">Last run: never</Text>
				`}
			>
				<Heading level={2}>{t("display.typography.heading")}</Heading>
				<Text variant="lead">{t("display.typography.lead")}</Text>
				<Text>{t("display.typography.body")}</Text>
				<Text variant="muted">{t("display.typography.muted")}</Text>
				<Text variant="small">{t("display.typography.small")}</Text>
			</Example>

			<T k="display.typography.p2" as="p" />

			<Example
				code={`
					<Prose>
					  <h3>Disk Defragmenter</h3>
					  <p>Rearranges the files on your disk.</p>
					  <ul>
					    <li>Close other programs first.</li>
					    <li>Do not run the screensaver while it works.</li>
					  </ul>
					  <blockquote>
					    "A defragmented drive is a happy drive."
					    <footer>Every Windows 98 manual, more or less</footer>
					  </blockquote>
					  <p>Use <code>defrag C:</code> from a command prompt.</p>
					</Prose>
				`}
			>
				<Prose>
					<h3>{t("display.typography.heading")}</h3>
					<p>{t("display.typography.body")}</p>
					<ul>
						<li>{t("display.typography.list1")}</li>
						<li>{t("display.typography.list2")}</li>
					</ul>
					<blockquote>
						<p>{t("display.typography.quote")}</p>
						<footer>{t("display.typography.quoteSource")}</footer>
					</blockquote>
					<T k="display.typography.code" as="p" />
				</Prose>
			</Example>
		</Component>
	);
}

/* ------------------------------------------------------------------- empty */

function EmptySection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="display.empty.p1" as="p" />

			<Example
				code={`
					<SunkenPanel style={{ height: 150, width: 320 }}>
					  <Empty
					    title="This folder is empty"
					    description="Drag files here, or use File, New, Folder."
					  >
					    <Button variant="default">New folder</Button>
					  </Empty>
					</SunkenPanel>
				`}
			>
				<SunkenPanel style={{ height: 150, width: 320 }}>
					<Empty
						title={t("display.empty.title")}
						description={t("display.empty.description")}
					>
						<Button variant="default">{t("display.empty.action")}</Button>
					</Empty>
				</SunkenPanel>
			</Example>

			<T k="display.empty.p2" as="p" />

			<Example
				code={`
					<Card style={{ width: 280 }}>
					  <Empty
					    compact
					    title="No devices found"
					    description="Plug a device in and choose Refresh."
					  />
					</Card>
				`}
			>
				<Card style={{ width: 280 }}>
					<Empty
						compact
						title={t("display.empty.compactTitle")}
						description={t("display.empty.compactDescription")}
					/>
				</Card>
			</Example>
		</Component>
	);
}

/* ---------------------------------------------------------------- feedback */

function FeedbackSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="display.feedback.p1" as="p" />

			<Example
				code={`
					<FieldRow>
					  <Spinner />
					  <span>Copying files…</span>
					</FieldRow>

					<FieldRow>
					  <Spinner size="large" label="Formatting drive C:" />
					  <Spinner size={20} />
					</FieldRow>
				`}
			>
				<FieldRow>
					<Spinner />
					<span>{t("display.feedback.working")}</span>
				</FieldRow>
				<br />
				<FieldRow>
					<Spinner size="large" label={t("display.feedback.busyLabel")} />
					<Spinner size={20} />
				</FieldRow>
			</Example>

			<T k="display.feedback.p2" as="p" />

			<Example
				code={`
					{/* Determinate */}
					<ProgressIndicator value={60} width={300} />

					{/* Indeterminate: the block sweeps inside the trough */}
					<ProgressIndicator width={300} aria-label="Formatting drive C:" />

					{/* Indeterminate and segmented: the blocks march in place */}
					<ProgressIndicator segmented width={300} aria-label="Formatting drive C:" />
				`}
			>
				<Text variant="small">{t("display.feedback.determinate")}</Text>
				<ProgressIndicator value={60} width={300} />
				<br />
				<Text variant="small">{t("display.feedback.indeterminate")}</Text>
				<ProgressIndicator width={300} aria-label={t("display.feedback.busyLabel")} />
				<br />
				<Text variant="small">{t("display.feedback.indeterminateSegmented")}</Text>
				<ProgressIndicator
					segmented
					width={300}
					aria-label={t("display.feedback.busyLabel")}
				/>
			</Example>
		</Component>
	);
}

export const displaySections: SectionDef[] = [
	{ id: "badge-avatar", titleKey: "nav.badgeAvatar", level: 3, body: <BadgeAvatarSection /> },
	{ id: "card", titleKey: "nav.card", level: 3, body: <CardSection /> },
	{ id: "typography", titleKey: "nav.typography", level: 3, body: <TypographySection /> },
	{ id: "empty", titleKey: "nav.empty", level: 3, body: <EmptySection /> },
	{ id: "spinner", titleKey: "nav.spinner", level: 3, body: <FeedbackSection /> },
];
