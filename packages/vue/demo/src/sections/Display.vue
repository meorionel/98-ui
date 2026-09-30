<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const displaySections: SectionMeta[] = [
	{ id: "badge-avatar", titleKey: "nav.badgeAvatar", level: 3 },
	{ id: "card", titleKey: "nav.card", level: 3 },
	{ id: "typography", titleKey: "nav.typography", level: 3 },
	{ id: "empty", titleKey: "nav.empty", level: 3 },
	{ id: "spinner", titleKey: "nav.spinner", level: 3 },
];
</script>

<script setup lang="ts">
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
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Display" });

const { t } = useI18n();

/* -------------------------------------------------------- badge and avatar */

const badgesCode = `
	<Badge>New</Badge>
	<Badge variant="success">Saved</Badge>
	<Badge variant="warning">Unsaved changes</Badge>
	<Badge variant="error">3 errors</Badge>
	<Badge variant="info">Beta</Badge>
`;

const avatarsCode = `
	<Avatar fallback="MO" />
	<Avatar src="/me.png" alt="Meorion" :size="48" shape="circle" fallback="MO" />
`;

/* -------------------------------------------------------------------- card */

const cardCode = `
	<Card :style="{ width: '280px' }">
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
`;

/* -------------------------------------------------------------- typography */

const typographyCode = `
	<Heading :level="2">Disk Defragmenter</Heading>
	<Text variant="lead">Rearranges the files on your disk.</Text>
	<Text>You do not need to defragment an NTFS drive.</Text>
	<Text variant="muted">C:\\Windows\\System</Text>
	<Text variant="small">Last run: never</Text>
`;

const proseCode = `
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
`;

/* ------------------------------------------------------------------- empty */

const emptyCode = `
	<SunkenPanel :style="{ height: '150px', width: '320px' }">
	  <Empty
	    title="This folder is empty"
	    description="Drag files here, or use File, New, Folder."
	  >
	    <Button variant="default">New folder</Button>
	  </Empty>
	</SunkenPanel>
`;

const emptyCompactCode = `
	<Card :style="{ width: '280px' }">
	  <Empty
	    compact
	    title="No devices found"
	    description="Plug a device in and choose Refresh."
	  />
	</Card>
`;

/* ---------------------------------------------------------------- feedback */

const feedbackCode = `
	<FieldRow>
	  <Spinner />
	  <span>Copying files…</span>
	</FieldRow>

	<FieldRow>
	  <Spinner size="large" label="Formatting drive C:" />
	  <Spinner :size="20" />
	</FieldRow>
`;

const progressCode = `
	<!-- Determinate -->
	<ProgressIndicator :value="60" :width="300" />

	<!-- Indeterminate: the block sweeps inside the trough -->
	<ProgressIndicator :width="300" aria-label="Formatting drive C:" />

	<!-- Indeterminate and segmented: the blocks march in place -->
	<ProgressIndicator segmented :width="300" aria-label="Formatting drive C:" />
`;
</script>

<template>
	<Section id="badge-avatar" title-key="nav.badgeAvatar" :level="3">
		<T k="display.badgeAvatar.p1" as="p" />

		<Example :code="badgesCode">
			<FieldRow>
				<Badge>{{ t("display.badgeAvatar.new") }}</Badge>
				<Badge variant="success">{{ t("display.badgeAvatar.saved") }}</Badge>
				<Badge variant="warning">{{ t("display.badgeAvatar.warning") }}</Badge>
				<Badge variant="error">{{ t("display.badgeAvatar.errors") }}</Badge>
				<Badge variant="info">{{ t("display.badgeAvatar.info") }}</Badge>
			</FieldRow>
		</Example>

		<T k="display.badgeAvatar.p2" as="p" />

		<Example :code="avatarsCode">
			<FieldRow>
				<Avatar fallback="MO" />
				<span>{{ t("display.badgeAvatar.initials") }}</span>
			</FieldRow>
			<br />
			<FieldRow>
				<Avatar
					src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
					alt=""
					:size="48"
					shape="circle"
					fallback="MO"
				/>
				<span>{{ t("display.badgeAvatar.circle") }}</span>
			</FieldRow>
		</Example>
	</Section>

	<Section id="card" title-key="nav.card" :level="3">
		<T k="display.card.p1" as="p" />

		<Example :code="cardCode">
			<Card :style="{ width: '280px' }">
				<CardHeader>
					<CardTitle>{{ t("display.card.title") }}</CardTitle>
					<CardDescription>{{ t("display.card.description") }}</CardDescription>
				</CardHeader>
				<CardContent>{{ t("display.card.content") }}</CardContent>
				<CardFooter>
					<Button variant="default">{{ t("display.card.properties") }}</Button>
					<Button>{{ t("display.card.disconnect") }}</Button>
				</CardFooter>
			</Card>
		</Example>
	</Section>

	<Section id="typography" title-key="nav.typography" :level="3">
		<T k="display.typography.p1" as="p" />

		<Example :code="typographyCode">
			<Heading :level="2">{{ t("display.typography.heading") }}</Heading>
			<Text variant="lead">{{ t("display.typography.lead") }}</Text>
			<Text>{{ t("display.typography.body") }}</Text>
			<Text variant="muted">{{ t("display.typography.muted") }}</Text>
			<Text variant="small">{{ t("display.typography.small") }}</Text>
		</Example>

		<T k="display.typography.p2" as="p" />

		<Example :code="proseCode">
			<Prose>
				<h3>{{ t("display.typography.heading") }}</h3>
				<p>{{ t("display.typography.body") }}</p>
				<ul>
					<li>{{ t("display.typography.list1") }}</li>
					<li>{{ t("display.typography.list2") }}</li>
				</ul>
				<blockquote>
					<p>{{ t("display.typography.quote") }}</p>
					<footer>{{ t("display.typography.quoteSource") }}</footer>
				</blockquote>
				<T k="display.typography.code" as="p" />
			</Prose>
		</Example>
	</Section>

	<Section id="empty" title-key="nav.empty" :level="3">
		<T k="display.empty.p1" as="p" />

		<Example :code="emptyCode">
			<SunkenPanel :style="{ height: '150px', width: '320px' }">
				<Empty
					:title="t('display.empty.title')"
					:description="t('display.empty.description')"
				>
					<Button variant="default">{{ t("display.empty.action") }}</Button>
				</Empty>
			</SunkenPanel>
		</Example>

		<T k="display.empty.p2" as="p" />

		<Example :code="emptyCompactCode">
			<Card :style="{ width: '280px' }">
				<Empty
					compact
					:title="t('display.empty.compactTitle')"
					:description="t('display.empty.compactDescription')"
				/>
			</Card>
		</Example>
	</Section>

	<Section id="spinner" title-key="nav.spinner" :level="3">
		<T k="display.feedback.p1" as="p" />

		<Example :code="feedbackCode">
			<FieldRow>
				<Spinner />
				<span>{{ t("display.feedback.working") }}</span>
			</FieldRow>
			<br />
			<FieldRow>
				<Spinner size="large" :label="t('display.feedback.busyLabel')" />
				<Spinner :size="20" />
			</FieldRow>
		</Example>

		<T k="display.feedback.p2" as="p" />

		<Example :code="progressCode">
			<Text variant="small">{{ t("display.feedback.determinate") }}</Text>
			<ProgressIndicator :value="60" :width="300" />
			<br />
			<Text variant="small">{{ t("display.feedback.indeterminate") }}</Text>
			<ProgressIndicator :width="300" :aria-label="t('display.feedback.busyLabel')" />
			<br />
			<Text variant="small">{{ t("display.feedback.indeterminateSegmented") }}</Text>
			<ProgressIndicator
				segmented
				:width="300"
				:aria-label="t('display.feedback.busyLabel')"
			/>
		</Example>
	</Section>
</template>
