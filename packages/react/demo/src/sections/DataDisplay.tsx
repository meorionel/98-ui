import { useState, type Key } from "react";
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
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

function TreeViewSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="data.treeView.quote" />
				<footer>{t("data.treeView.quoteSource")}</footer>
			</blockquote>

			<Example
				code={`
					<TreeView>
					  <TreeViewItem>We can put</TreeViewItem>
					  <TreeViewItem>
					    <strong style={{ color: "purple" }}>✨ Whatever ✨</strong>
					  </TreeViewItem>
					  <TreeViewItem>We want in here</TreeViewItem>
					</TreeView>
				`}
			>
				<TreeView>
					<TreeViewItem>{t("data.treeView.weCanPut")}</TreeViewItem>
					<TreeViewItem>
						<strong style={{ color: "purple" }}>{t("data.treeView.whatever")}</strong>
					</TreeViewItem>
					<TreeViewItem>{t("data.treeView.weWantInHere")}</TreeViewItem>
				</TreeView>
			</Example>

			<T k="data.treeView.branchNote" as="p" />

			<Example
				code={`
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
					  <TreeViewBranch label="JavaScript" defaultOpen>
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
				`}
			>
				<TreeView>
					<TreeViewItem>{t("data.treeView.tableOfContents")}</TreeViewItem>
					<TreeViewItem>{t("data.treeView.whatIsWebDevelopment")}</TreeViewItem>
					<TreeViewItem>
						{t("data.treeView.css")}
						<ul>
							<li>{t("data.treeView.selectors")}</li>
							<li>{t("data.treeView.specificity")}</li>
							<li>{t("data.treeView.properties")}</li>
						</ul>
					</TreeViewItem>
					<TreeViewBranch label={t("data.treeView.javascript")} defaultOpen>
						<TreeViewItem>{t("data.treeView.avoidAtAllCosts")}</TreeViewItem>
						<TreeViewBranch label={t("data.treeView.unless")}>
							<TreeViewItem>{t("data.treeView.avoid")}</TreeViewItem>
							<TreeViewBranch label={t("data.treeView.at")}>
								<TreeViewItem>{t("data.treeView.avoid")}</TreeViewItem>
								<TreeViewItem>{t("data.treeView.at")}</TreeViewItem>
								<TreeViewItem>{t("data.treeView.all")}</TreeViewItem>
								<TreeViewItem>{t("data.treeView.cost")}</TreeViewItem>
							</TreeViewBranch>
							<TreeViewItem>{t("data.treeView.all")}</TreeViewItem>
							<TreeViewItem>{t("data.treeView.cost")}</TreeViewItem>
						</TreeViewBranch>
					</TreeViewBranch>
					<TreeViewItem>{t("data.treeView.html")}</TreeViewItem>
					<TreeViewItem>{t("data.treeView.specialThanks")}</TreeViewItem>
				</TreeView>
			</Example>

			<T k="data.treeView.linkNote" as="p" />

			<Example
				code={`
					<TreeView>
					  <TreeViewItem><TreeViewLink href="#tree-view">C:\\</TreeViewLink></TreeViewItem>
					  <TreeViewItem><TreeViewLink href="#tree-view">C:\\WINDOWS</TreeViewLink></TreeViewItem>
					</TreeView>
				`}
			>
				<TreeView>
					<TreeViewItem>
						<TreeViewLink href="#tree-view">C:\</TreeViewLink>
					</TreeViewItem>
					<TreeViewItem>
						<TreeViewLink href="#tree-view">C:\WINDOWS</TreeViewLink>
					</TreeViewItem>
				</TreeView>
			</Example>
		</Component>
	);
}

function TabsSection() {
	const { t } = useI18n();
	const [tab, setTab] = useState("desktop");

	return (
		<Component>
			<blockquote>
				<T k="data.tabs.quote" />
				<footer>{t("data.tabs.quoteSource")}</footer>
			</blockquote>

			<T k="data.tabs.p2" as="p" />

			<Example
				code={`
					<Tabs defaultValue="desktop">
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
				`}
			>
				<Window title={t("data.tabs.windowTitle")} width={420}>
					<Tabs defaultValue="desktop">
						<TabList label={t("data.tabs.controlPanel")}>
							<Tab value="desktop">{t("data.tabs.desktop")}</Tab>
							<Tab value="computer">{t("data.tabs.myComputer")}</Tab>
							<Tab value="panel">{t("data.tabs.controlPanel")}</Tab>
							<Tab value="devices">{t("data.tabs.devicesManager")}</Tab>
						</TabList>
						<TabPanel value="desktop">
							<p>{t("data.tabs.desktopSettings")}</p>
						</TabPanel>
						<TabPanel value="computer">
							<p>{t("data.tabs.myComputer")}</p>
						</TabPanel>
						<TabPanel value="panel">
							<p>{t("data.tabs.controlPanel")}</p>
						</TabPanel>
						<TabPanel value="devices">
							<p>{t("data.tabs.devicesManager")}</p>
						</TabPanel>
					</Tabs>
				</Window>
			</Example>

			<T k="data.tabs.controlledIntro" as="p" />

			<Example
				code={`
					const [tab, setTab] = useState("desktop");

					<Tabs value={tab} onChange={setTab}>
					  <TabList multirows>
					    <Tab value="desktop">Desktop</Tab>
					    <Tab value="computer">My computer</Tab>
					    <Tab value="panel">Control panel</Tab>
					  </TabList>
					  <TabPanel value="desktop"><p>Selected: desktop</p></TabPanel>
					  <TabPanel value="computer"><p>Selected: computer</p></TabPanel>
					  <TabPanel value="panel"><p>Selected: panel</p></TabPanel>
					</Tabs>
				`}
			>
				<Window title={t("data.tabs.multirowTitle")} width={460}>
					<Tabs value={tab} onChange={setTab}>
						<TabList multirows label={t("data.tabs.settingsLabel")}>
							<Tab value="desktop">{t("data.tabs.desktop")}</Tab>
							<Tab value="computer">{t("data.tabs.myComputer")}</Tab>
							<Tab value="panel">{t("data.tabs.controlPanel")}</Tab>
						</TabList>
						<TabPanel value="desktop">
							<p>{t("data.tabs.selected", { value: "desktop" })}</p>
						</TabPanel>
						<TabPanel value="computer">
							<p>{t("data.tabs.selected", { value: "computer" })}</p>
						</TabPanel>
						<TabPanel value="panel">
							<p>{t("data.tabs.selected", { value: "panel" })}</p>
						</TabPanel>
					</Tabs>
				</Window>
			</Example>
		</Component>
	);
}

const DRIVERS = [
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

function TableViewSection() {
	const { t } = useI18n();
	const [selected, setSelected] = useState<Key | null>("sqlserver");

	return (
		<Component>
			<T k="data.tableView.p1" as="p" />

			<Example
				code={`
					const [selected, setSelected] = useState("sqlserver");

					<TableView
					  selectable
					  height={140}
					  width={300}
					  selectedKey={selected}
					  onSelect={(row, key) => setSelected(key)}
					  getRowKey={(row) => row.id}
					  columns={[
					    { key: "name", header: "Name" },
					    { key: "version", header: "Version" },
					    { key: "company", header: "Company" },
					  ]}
					  data={drivers}
					/>
					<p>Selected: {selected}</p>
				`}
			>
				<TableView
					selectable
					height={140}
					width={300}
					selectedKey={selected}
					onSelect={(_row, key) => setSelected(key)}
					getRowKey={(row) => row.id}
					columns={[
						{ key: "name", header: t("data.tableView.columnName") },
						{ key: "version", header: t("data.tableView.columnVersion") },
						{ key: "company", header: t("data.tableView.columnCompany") },
					]}
					data={DRIVERS}
				/>
				<p>{t("data.tableView.selected", { value: String(selected) })}</p>
			</Example>

			<T k="data.tableView.p3" as="p" />

			<Example
				code={`
					<TableView
					  sortable
					  defaultSortKey="name"
					  pageSize={3}
					  height={140}
					  width={320}
					  columns={[
					    { key: "name", header: "Name" },
					    { key: "version", header: "Version" },
					    { key: "company", header: "Company" },
					  ]}
					  data={drivers}
					/>
				`}
			>
				<TableView
					sortable
					defaultSortKey="company"
					pageSize={3}
					height={140}
					width={320}
					pagerLabel={t("common.pagination")}
					pagerLabels={{
						first: t("common.firstPage"),
						previous: t("common.previousPage"),
						next: t("common.nextPage"),
						last: t("common.lastPage"),
					}}
					renderPageStatus={(page, count) => t("common.pageStatus", { page, count })}
					columns={[
						{ key: "name", header: t("data.tableView.columnName") },
						{ key: "version", header: t("data.tableView.columnVersion") },
						{ key: "company", header: t("data.tableView.columnCompany") },
					]}
					data={DRIVERS}
					getRowKey={(row) => row.id}
				/>
			</Example>

			<T k="data.tableView.p2" as="p" />

			<Example
				code={`
					<SunkenPanel style={{ height: 90, width: 300 }}>
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
				`}
			>
				<SunkenPanel style={{ height: 90, width: 300 }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableHeaderCell>{t("data.tableView.columnName")}</TableHeaderCell>
								<TableHeaderCell>
									{t("data.tableView.columnVersion")}
								</TableHeaderCell>
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
		</Component>
	);
}

function ProgressIndicatorSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="data.progress.quote" />
				<footer>{t("data.progress.quoteSource")}</footer>
			</blockquote>

			<T k="data.progress.p1" as="p" />

			<Example
				code={`
					<ProgressIndicator value={40} width={320} />
					<ProgressIndicator value={40} segmented width={320} />
					<ProgressIndicator value={85} max={100} width={320} />
				`}
			>
				<ProgressIndicator value={40} width={320} />
				<ProgressIndicator value={40} segmented width={320} />
				<ProgressIndicator value={85} width={320} />
			</Example>

			<T k="data.progress.liveIntro" as="p" />

			<Example code={`<ProgressIndicator value={progress} width={320} />`}>
				<LiveProgress />
			</Example>
		</Component>
	);
}

function LiveProgress() {
	const { t } = useI18n();
	const [progress, setProgress] = useState(20);
	return (
		<>
			<ProgressIndicator value={progress} width={320} />
			<div className="row" style={{ marginTop: 8, alignItems: "center" }}>
				<Slider
					min={0}
					max={100}
					value={progress}
					onChange={(event) => setProgress(Number(event.target.value))}
					style={{ width: 220 }}
					aria-label={t("data.progress.sliderLabel")}
				/>
				<span>{progress}%</span>
			</div>
		</>
	);
}

export const dataDisplaySections: SectionDef[] = [
	{ id: "tree-view", titleKey: "nav.treeView", level: 3, body: <TreeViewSection /> },
	{ id: "tabs", titleKey: "nav.tabs", level: 3, body: <TabsSection /> },
	{ id: "table-view", titleKey: "nav.tableView", level: 3, body: <TableViewSection /> },
	{
		id: "progress-indicator",
		titleKey: "nav.progressIndicator",
		level: 3,
		body: <ProgressIndicatorSection />,
	},
];
