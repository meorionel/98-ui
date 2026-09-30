<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const dataDisplaySections: SectionMeta[] = [
	{ id: "tree-view", titleKey: "nav.treeView", level: 3 },
	{ id: "tabs", titleKey: "nav.tabs", level: 3 },
	{ id: "table-view", titleKey: "nav.tableView", level: 3 },
	{ id: "progress-indicator", titleKey: "nav.progressIndicator", level: 3 },
];

/** One row of the ODBC driver sample data — deliberately untranslated. */
interface Driver {
	id: string;
	name: string;
	version: string;
	company: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
	ProgressIndicator,
	Slider,
	SunkenPanel,
	Tab,
	TabList,
	TabPanel,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
	TableView,
	Tabs,
	TreeView,
	TreeViewBranch,
	TreeViewItem,
	TreeViewLink,
	Window,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "DataDisplay" });

const { t } = useI18n();

/* --------------------------------------------------------------- tree view */

const treeViewCode = `
	<TreeView>
	  <TreeViewItem>We can put</TreeViewItem>
	  <TreeViewItem>
	    <strong style="color: purple">✨ Whatever ✨</strong>
	  </TreeViewItem>
	  <TreeViewItem>We want in here</TreeViewItem>
	</TreeView>
`;

const treeBranchCode = `
	<TreeView>
	  <TreeViewItem>Table of Contents</TreeViewItem>
	  <TreeViewItem>What is web development?</TreeViewItem>
	  <TreeViewItem>
	    CSS
	    <ul>
	      <li>Selectors</li>
	      <li>Specificity</li>
	      <li>Properties</li>
	    </ul>
	  </TreeViewItem>
	  <TreeViewBranch label="JavaScript" default-open>
	    <TreeViewItem>Avoid at all costs</TreeViewItem>
	    <TreeViewBranch label="Unless">
	      <TreeViewItem>Avoid</TreeViewItem>
	      <TreeViewBranch label="At">
	        <TreeViewItem>Avoid</TreeViewItem>
	        <TreeViewItem>At</TreeViewItem>
	        <TreeViewItem>All</TreeViewItem>
	        <TreeViewItem>Cost</TreeViewItem>
	      </TreeViewBranch>
	      <TreeViewItem>All</TreeViewItem>
	      <TreeViewItem>Cost</TreeViewItem>
	    </TreeViewBranch>
	  </TreeViewBranch>
	  <TreeViewItem>HTML</TreeViewItem>
	  <TreeViewItem>Special Thanks</TreeViewItem>
	</TreeView>
`;

const treeLinkCode = `
	<TreeView>
	  <TreeViewItem><TreeViewLink href="#tree-view">C:\\</TreeViewLink></TreeViewItem>
	  <TreeViewItem><TreeViewLink href="#tree-view">C:\\WINDOWS</TreeViewLink></TreeViewItem>
	</TreeView>
`;

/* ------------------------------------------------------------------- tabs */

const tab = ref("desktop");

const tabsDefaultCode = `
	<Tabs default-value="desktop">
	  <TabList label="Control panel">
	    <Tab value="desktop">Desktop</Tab>
	    <Tab value="computer">My computer</Tab>
	    <Tab value="panel">Control panel</Tab>
	    <Tab value="devices">Devices manager</Tab>
	  </TabList>
	  <TabPanel value="desktop"><p>Desktop settings</p></TabPanel>
	  <TabPanel value="computer"><p>My computer</p></TabPanel>
	  <TabPanel value="panel"><p>Control panel</p></TabPanel>
	  <TabPanel value="devices"><p>Devices manager</p></TabPanel>
	</Tabs>
`;

const tabsControlledCode = `
	const tab = ref("desktop");

	<Tabs :value="tab" @change="tab = $event">
	  <TabList multirows>
	    <Tab value="desktop">Desktop</Tab>
	    <Tab value="computer">My computer</Tab>
	    <Tab value="panel">Control panel</Tab>
	  </TabList>
	  <TabPanel value="desktop"><p>Selected: desktop</p></TabPanel>
	  <TabPanel value="computer"><p>Selected: computer</p></TabPanel>
	  <TabPanel value="panel"><p>Selected: panel</p></TabPanel>
	</Tabs>
`;

/* -------------------------------------------------------------- table view */

/**
 * Sample data for the driver tables. Deliberately untranslated: it documents the
 * API with the kind of rows a real list view holds.
 */
const DRIVERS: Driver[] = [
	{ id: "mysql", name: "MySQL ODBC 3.51 Driver", version: "3.51.11.00", company: "MySQL AB" },
	{
		id: "sqlserver",
		name: "SQL Server",
		version: "3.70.06.23",
		company: "Microsoft Corporation",
	},
	{
		id: "oracle",
		name: "Oracle in OraClient11g_home1",
		version: "11.02.00.01",
		company: "Oracle",
	},
	{
		id: "access",
		name: "Microsoft Access Driver (*.mdb)",
		version: "4.00.6019.00",
		company: "Microsoft Corporation",
	},
	{
		id: "excel",
		name: "Microsoft Excel Driver (*.xls)",
		version: "4.00.6019.00",
		company: "Microsoft Corporation",
	},
	{
		id: "dbf",
		name: "Microsoft dBase Driver (*.dbf)",
		version: "4.00.6019.00",
		company: "Microsoft Corporation",
	},
];

const selected = ref<string | number | null>("sqlserver");

const driverColumns = computed(() => [
	{ key: "name", header: t("data.tableView.columnName") },
	{ key: "version", header: t("data.tableView.columnVersion") },
	{ key: "company", header: t("data.tableView.columnCompany") },
]);

const getDriverKey = (row: Driver) => row.id;

const selectDriver = (_row: Driver, key: string | number) => {
	selected.value = key;
};

/** React's `renderPageStatus={(page, count) => t("common.pageStatus", …)}`. */
const renderPageStatus = (page: number, count: number) =>
	t("common.pageStatus", { page, count });

const tableViewCode = `
	const selected = ref("sqlserver");

	<TableView
	  selectable
	  :height="140"
	  :width="300"
	  :selected-key="selected"
	  @select="(_row, key) => (selected = key)"
	  :get-row-key="(row) => row.id"
	  :columns="[
	    { key: 'name', header: 'Name' },
	    { key: 'version', header: 'Version' },
	    { key: 'company', header: 'Company' },
	  ]"
	  :data="drivers"
	/>
	<p>Selected: {{ selected }}</p>
`;

const tableViewSortCode = `
	<TableView
	  sortable
	  default-sort-key="name"
	  :page-size="3"
	  :height="140"
	  :width="320"
	  :columns="[
	    { key: 'name', header: 'Name' },
	    { key: 'version', header: 'Version' },
	    { key: 'company', header: 'Company' },
	  ]"
	  :data="drivers"
	/>
`;

const tablePrimitivesCode = `
	<SunkenPanel :style="{ height: '90px', width: '300px' }">
	  <Table>
	    <TableHead>
	      <TableRow>
	        <TableHeaderCell>Name</TableHeaderCell>
	        <TableHeaderCell>Version</TableHeaderCell>
	      </TableRow>
	    </TableHead>
	    <TableBody>
	      <TableRow highlighted>
	        <TableCell>SQL Server</TableCell>
	        <TableCell>3.70.06.23</TableCell>
	      </TableRow>
	      <TableRow>
	        <TableCell>MySQL ODBC 3.51 Driver</TableCell>
	        <TableCell>3.51.11.00</TableCell>
	      </TableRow>
	    </TableBody>
	  </Table>
	</SunkenPanel>
`;

/* ------------------------------------------------------- progress indicator */

const progress = ref(20);

const progressCode = `
	<ProgressIndicator :value="40" :width="320" />
	<ProgressIndicator :value="40" segmented :width="320" />
	<ProgressIndicator :value="85" :max="100" :width="320" />
`;

const progressLiveCode = `<ProgressIndicator :value="progress" :width="320" />`;

const onProgressChange = (event: Event) => {
	progress.value = Number((event.target as HTMLInputElement).value);
};
</script>

<template>
	<Section id="tree-view" title-key="nav.treeView" :level="3">
		<blockquote>
			<T k="data.treeView.quote" />
			<footer>{{ t("data.treeView.quoteSource") }}</footer>
		</blockquote>

		<Example :code="treeViewCode">
			<TreeView>
				<TreeViewItem>{{ t("data.treeView.weCanPut") }}</TreeViewItem>
				<TreeViewItem>
					<strong style="color: purple">{{ t("data.treeView.whatever") }}</strong>
				</TreeViewItem>
				<TreeViewItem>{{ t("data.treeView.weWantInHere") }}</TreeViewItem>
			</TreeView>
		</Example>

		<T k="data.treeView.branchNote" as="p" />

		<Example :code="treeBranchCode">
			<TreeView>
				<TreeViewItem>{{ t("data.treeView.tableOfContents") }}</TreeViewItem>
				<TreeViewItem>{{ t("data.treeView.whatIsWebDevelopment") }}</TreeViewItem>
				<TreeViewItem>
					{{ t("data.treeView.css") }}
					<ul>
						<li>{{ t("data.treeView.selectors") }}</li>
						<li>{{ t("data.treeView.specificity") }}</li>
						<li>{{ t("data.treeView.properties") }}</li>
					</ul>
				</TreeViewItem>
				<TreeViewBranch :label="t('data.treeView.javascript')" default-open>
					<TreeViewItem>{{ t("data.treeView.avoidAtAllCosts") }}</TreeViewItem>
					<TreeViewBranch :label="t('data.treeView.unless')">
						<TreeViewItem>{{ t("data.treeView.avoid") }}</TreeViewItem>
						<TreeViewBranch :label="t('data.treeView.at')">
							<TreeViewItem>{{ t("data.treeView.avoid") }}</TreeViewItem>
							<TreeViewItem>{{ t("data.treeView.at") }}</TreeViewItem>
							<TreeViewItem>{{ t("data.treeView.all") }}</TreeViewItem>
							<TreeViewItem>{{ t("data.treeView.cost") }}</TreeViewItem>
						</TreeViewBranch>
						<TreeViewItem>{{ t("data.treeView.all") }}</TreeViewItem>
						<TreeViewItem>{{ t("data.treeView.cost") }}</TreeViewItem>
					</TreeViewBranch>
				</TreeViewBranch>
				<TreeViewItem>{{ t("data.treeView.html") }}</TreeViewItem>
				<TreeViewItem>{{ t("data.treeView.specialThanks") }}</TreeViewItem>
			</TreeView>
		</Example>

		<T k="data.treeView.linkNote" as="p" />

		<Example :code="treeLinkCode">
			<TreeView>
				<TreeViewItem>
					<TreeViewLink href="#tree-view">C:\</TreeViewLink>
				</TreeViewItem>
				<TreeViewItem>
					<TreeViewLink href="#tree-view">C:\WINDOWS</TreeViewLink>
				</TreeViewItem>
			</TreeView>
		</Example>
	</Section>

	<Section id="tabs" title-key="nav.tabs" :level="3">
		<blockquote>
			<T k="data.tabs.quote" />
			<footer>{{ t("data.tabs.quoteSource") }}</footer>
		</blockquote>

		<T k="data.tabs.p2" as="p" />

		<Example :code="tabsDefaultCode">
			<Window :title="t('data.tabs.windowTitle')" :width="420">
				<Tabs default-value="desktop">
					<TabList :label="t('data.tabs.controlPanel')">
						<Tab value="desktop">{{ t("data.tabs.desktop") }}</Tab>
						<Tab value="computer">{{ t("data.tabs.myComputer") }}</Tab>
						<Tab value="panel">{{ t("data.tabs.controlPanel") }}</Tab>
						<Tab value="devices">{{ t("data.tabs.devicesManager") }}</Tab>
					</TabList>
					<TabPanel value="desktop">
						<p>{{ t("data.tabs.desktopSettings") }}</p>
					</TabPanel>
					<TabPanel value="computer">
						<p>{{ t("data.tabs.myComputer") }}</p>
					</TabPanel>
					<TabPanel value="panel">
						<p>{{ t("data.tabs.controlPanel") }}</p>
					</TabPanel>
					<TabPanel value="devices">
						<p>{{ t("data.tabs.devicesManager") }}</p>
					</TabPanel>
				</Tabs>
			</Window>
		</Example>

		<T k="data.tabs.controlledIntro" as="p" />

		<Example :code="tabsControlledCode">
			<Window :title="t('data.tabs.multirowTitle')" :width="460">
				<Tabs :value="tab" @change="tab = $event">
					<TabList multirows :label="t('data.tabs.settingsLabel')">
						<Tab value="desktop">{{ t("data.tabs.desktop") }}</Tab>
						<Tab value="computer">{{ t("data.tabs.myComputer") }}</Tab>
						<Tab value="panel">{{ t("data.tabs.controlPanel") }}</Tab>
					</TabList>
					<TabPanel value="desktop">
						<p>{{ t("data.tabs.selected", { value: "desktop" }) }}</p>
					</TabPanel>
					<TabPanel value="computer">
						<p>{{ t("data.tabs.selected", { value: "computer" }) }}</p>
					</TabPanel>
					<TabPanel value="panel">
						<p>{{ t("data.tabs.selected", { value: "panel" }) }}</p>
					</TabPanel>
				</Tabs>
			</Window>
		</Example>
	</Section>

	<Section id="table-view" title-key="nav.tableView" :level="3">
		<T k="data.tableView.p1" as="p" />

		<Example :code="tableViewCode">
			<TableView
				selectable
				:height="140"
				:width="300"
				:selected-key="selected"
				@select="selectDriver"
				:get-row-key="getDriverKey"
				:columns="driverColumns"
				:data="DRIVERS"
			/>
			<p>{{ t("data.tableView.selected", { value: String(selected) }) }}</p>
		</Example>

		<T k="data.tableView.p3" as="p" />

		<Example :code="tableViewSortCode">
			<TableView
				sortable
				default-sort-key="company"
				:page-size="3"
				:height="140"
				:width="320"
				:pager-label="t('common.pagination')"
				:pager-labels="{
					first: t('common.firstPage'),
					previous: t('common.previousPage'),
					next: t('common.nextPage'),
					last: t('common.lastPage'),
				}"
				:render-page-status="renderPageStatus"
				:columns="driverColumns"
				:data="DRIVERS"
				:get-row-key="getDriverKey"
			/>
		</Example>

		<T k="data.tableView.p2" as="p" />

		<Example :code="tablePrimitivesCode">
			<SunkenPanel :style="{ height: '90px', width: '300px' }">
				<Table>
					<TableHead>
						<TableRow>
							<TableHeaderCell>{{ t("data.tableView.columnName") }}</TableHeaderCell>
							<TableHeaderCell>{{ t("data.tableView.columnVersion") }}</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow highlighted>
							<TableCell>SQL Server</TableCell>
							<TableCell>3.70.06.23</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>MySQL ODBC 3.51 Driver</TableCell>
							<TableCell>3.51.11.00</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</SunkenPanel>
		</Example>
	</Section>

	<Section id="progress-indicator" title-key="nav.progressIndicator" :level="3">
		<blockquote>
			<T k="data.progress.quote" />
			<footer>{{ t("data.progress.quoteSource") }}</footer>
		</blockquote>

		<T k="data.progress.p1" as="p" />

		<Example :code="progressCode">
			<ProgressIndicator :value="40" :width="320" />
			<ProgressIndicator :value="40" segmented :width="320" />
			<ProgressIndicator :value="85" :width="320" />
		</Example>

		<T k="data.progress.liveIntro" as="p" />

		<Example :code="progressLiveCode">
			<ProgressIndicator :value="progress" :width="320" />
			<div class="row" :style="{ marginTop: '8px', alignItems: 'center' }">
				<Slider
					:min="0"
					:max="100"
					:value="progress"
					:style="{ width: '220px' }"
					:aria-label="t('data.progress.sliderLabel')"
					@change="onProgressChange"
				/>
				<span>{{ progress }}%</span>
			</div>
		</Example>
	</Section>
</template>
