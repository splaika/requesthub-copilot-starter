"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  AnimatePresence,
  Reorder,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeJapaneseYen,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CirclePlus,
  Clock3,
  Cloud,
  Download,
  Eye,
  FilePlus2,
  FileSignature,
  Filter,
  GripVertical,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  MoreHorizontal,
  PanelsTopLeft,
  Plane,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UploadCloud,
  WalletCards,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type View = "dashboard" | "create" | "applications" | "approvals" | "management" | "form";
type Tone = "blue" | "amber" | "green" | "purple" | "red" | "slate";

type FormTemplate = {
  id: string;
  icon: string;
  name: string;
  description: string;
  category: string;
  tone: Tone;
  time: string;
  list: string;
  fields: number;
  route: string;
  published: boolean;
};

type RequestRecord = {
  id: string;
  type: string;
  title: string;
  applicant: string;
  department: string;
  date: string;
  updated: string;
  amount: string;
  status: string;
  tone: Tone;
};

const wait = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const templates: FormTemplate[] = [
  { id: "expense", icon: "receipt", name: "経費精算", description: "交通費・接待費・備品費などの精算", category: "経理", tone: "blue", time: "約3分", list: "SP_ExpenseRequests", fields: 12, route: "直属上長 → 経理", published: true },
  { id: "purchase", icon: "cart", name: "購買申請", description: "物品・ソフトウェア・サービスの購入", category: "購買", tone: "purple", time: "約5分", list: "SP_PurchaseRequests", fields: 15, route: "直属上長 → 購買 → 経理", published: true },
  { id: "leave", icon: "calendar", name: "休暇申請", description: "有給・特別休暇・振替休日の申請", category: "人事", tone: "green", time: "約2分", list: "SP_LeaveRequests", fields: 8, route: "直属上長", published: true },
  { id: "contract", icon: "contract", name: "契約締結申請", description: "新規契約・更新・解約の法務審査", category: "法務", tone: "amber", time: "約8分", list: "SP_ContractRequests", fields: 18, route: "直属上長 → 法務 → 管掌役員", published: true },
  { id: "trip", icon: "plane", name: "出張申請", description: "国内・海外出張の事前申請", category: "総務", tone: "red", time: "約4分", list: "SP_TripRequests", fields: 14, route: "直属上長 → 部門長", published: true },
  { id: "account", icon: "key", name: "アカウント発行", description: "社内システム・SaaSの利用申請", category: "IT", tone: "slate", time: "約3分", list: "SP_AccountRequests", fields: 10, route: "直属上長 → IT管理者", published: true },
];

const seedRequests: RequestRecord[] = [
  { id: "EXP-2026-0912", type: "経費精算", title: "大阪支社 出張交通費", applicant: "山田 太郎", department: "経営企画部", date: "9月10日", updated: "12分前", amount: "¥48,620", status: "承認待ち", tone: "amber" },
  { id: "PUR-2026-0341", type: "購買申請", title: "開発用モニター 3台", applicant: "佐藤 美咲", department: "プロダクト開発部", date: "9月10日", updated: "1時間前", amount: "¥186,000", status: "部長承認済", tone: "blue" },
  { id: "LEA-2026-0188", type: "休暇申請", title: "年次有給休暇", applicant: "鈴木 健", department: "営業第一部", date: "9月9日", updated: "昨日", amount: "—", status: "承認済み", tone: "green" },
  { id: "CON-2026-0063", type: "契約締結申請", title: "デザイン業務委託契約の更新", applicant: "高橋 葵", department: "ブランド戦略部", date: "9月9日", updated: "昨日", amount: "¥1,200,000", status: "法務確認中", tone: "purple" },
  { id: "TRP-2026-0109", type: "出張申請", title: "福岡顧客訪問（2泊3日）", applicant: "伊藤 翔", department: "営業第二部", date: "9月8日", updated: "2日前", amount: "¥82,000", status: "差し戻し", tone: "red" },
  { id: "ACC-2026-0287", type: "アカウント発行", title: "Figma Editor権限追加", applicant: "中村 凛", department: "UXデザイン部", date: "9月8日", updated: "2日前", amount: "¥24,000/年", status: "承認済み", tone: "green" },
  { id: "PUR-2026-0338", type: "購買申請", title: "採用イベント会場費", applicant: "小林 陽子", department: "人事部", date: "9月7日", updated: "3日前", amount: "¥320,000", status: "承認待ち", tone: "amber" },
];

const approvalTasks = [
  { ...seedRequests[0], due: "本日 17:00", age: "6時間", step: "1 / 2", note: "大阪支社での四半期レビュー参加に伴う交通費です。" },
  { ...seedRequests[6], due: "明日 12:00", age: "1日", step: "1 / 3", note: "10月開催のエンジニア採用イベント会場を予約します。" },
  { id: "CON-2026-0061", type: "契約締結申請", title: "マーケティング支援基本契約", applicant: "加藤 大地", department: "マーケティング部", date: "9月8日", updated: "2日前", amount: "¥2,400,000", status: "承認待ち", tone: "purple" as Tone, due: "9月13日", age: "2日", step: "2 / 3", note: "新製品ローンチに伴う6か月間のマーケティング支援契約です。" },
];

const initialFields: Record<string, string[]> = {
  expense: ["申請者", "所属部門", "利用日", "経費区分", "支払先・訪問先", "申請金額", "利用目的", "添付ファイル"],
  purchase: ["申請者", "所属部門", "購入品名", "数量", "単価", "希望納期", "購入先候補", "購入理由", "添付ファイル"],
  leave: ["申請者", "所属部門", "休暇種別", "開始日", "終了日", "引継ぎ事項"],
  contract: ["申請者", "所属部門", "契約先", "契約種別", "契約開始日", "契約終了日", "契約金額", "契約概要", "添付ファイル"],
  trip: ["申請者", "所属部門", "出張区分", "出張先", "出発日", "帰着日", "概算費用", "出張目的"],
  account: ["申請者", "所属部門", "対象システム", "希望権限", "利用開始日", "利用終了日", "利用目的"],
};

const iconMap: Record<string, LucideIcon> = {
  receipt: ReceiptText,
  cart: ShoppingCart,
  calendar: CalendarDays,
  contract: FileSignature,
  plane: Plane,
  key: KeyRound,
  custom: FilePlus2,
};

const navItems: { id: Exclude<View, "form">; label: string; icon: LucideIcon; count?: number; section?: string }[] = [
  { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { id: "create", label: "新規申請", icon: CirclePlus },
  { id: "applications", label: "申請一覧", icon: ReceiptText, count: 12 },
  { id: "approvals", label: "承認タスク", icon: ListChecks, count: 5 },
  { id: "management", label: "フォーム管理", icon: PanelsTopLeft, section: "管理" },
];

const pageCopy: Record<Exclude<View, "form">, { eyebrow: string; title: string; sub: string }> = {
  dashboard: { eyebrow: "2026年9月11日（金）", title: "おはようございます、山田さん", sub: "申請と承認の状況を、ひと目で確認できます。" },
  create: { eyebrow: "REQUEST CATALOG", title: "新しい申請を作成", sub: "目的に合ったフォームを選択してください。" },
  applications: { eyebrow: "REQUESTS", title: "申請一覧", sub: "自分と組織の申請状況を確認できます。" },
  approvals: { eyebrow: "APPROVAL INBOX", title: "承認タスク", sub: "あなたの判断を待っている申請です。" },
  management: { eyebrow: "FORM STUDIO", title: "申請フォーム管理", sub: "フォーム、保存先、承認ルートを一元管理します。" },
};

const requestSchema = z.object({
  applicant: z.string().min(1, "申請者を入力してください"),
  department: z.string().min(1, "所属部門を選択してください"),
  title: z.string().min(3, "件名は3文字以上で入力してください"),
  date: z.string().min(1, "日付を入力してください"),
  amount: z.string().min(1, "金額を入力してください"),
  purpose: z.string().min(8, "目的は8文字以上で入力してください"),
});
type RequestInput = z.infer<typeof requestSchema>;

const newFormSchema = z.object({
  name: z.string().min(2, "フォーム名は2文字以上で入力してください"),
  category: z.string().min(1),
  description: z.string().min(6, "説明は6文字以上で入力してください"),
  list: z.string().regex(/^SP_[A-Za-z0-9_]+$/, "SP_で始まる半角英数字名を入力してください"),
});
type NewFormInput = z.infer<typeof newFormSchema>;

async function getRequests() {
  await wait(420);
  return seedRequests;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [forms, setForms] = useState<FormTemplate[]>(templates);
  const [fieldsByForm, setFieldsByForm] = useState<Record<string, string[]>>(initialFields);
  const [activeTemplateId, setActiveTemplateId] = useState("expense");
  const [selectedFormId, setSelectedFormId] = useState("expense");
  const [selectedApproval, setSelectedApproval] = useState(0);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormTemplate | null>(null);
  const [requestDetail, setRequestDetail] = useState<RequestRecord | null>(null);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const requestQuery = useQuery({ queryKey: ["sharepoint-requests"], queryFn: getRequests });
  const activeTemplate = forms.find((form) => form.id === activeTemplateId) ?? forms[0];
  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? forms[0];

  const notify = (message: string) => {
    setToast(message);
    globalThis.setTimeout(() => setToast(""), 2800);
  };

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const openForm = (id: string) => {
    setActiveTemplateId(id);
    navigate("form");
  };

  const submitMutation = useMutation({
    mutationFn: async (input: RequestInput) => {
      await wait(850);
      return {
        id: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        type: activeTemplate.name,
        title: input.title,
        applicant: input.applicant,
        department: input.department,
        date: "本日",
        updated: "たった今",
        amount: `¥${Number(input.amount).toLocaleString("ja-JP")}`,
        status: "承認待ち",
        tone: "amber" as Tone,
      };
    },
    onSuccess: (record) => {
      queryClient.setQueryData<RequestRecord[]>(["sharepoint-requests"], (current = []) => [record, ...current]);
      notify(`${record.id} を申請しました。承認者へ通知済みです。`);
      navigate("applications");
    },
  });

  const refresh = async () => {
    setSyncing(true);
    await requestQuery.refetch();
    await wait(350);
    setSyncing(false);
    notify("SharePointと同期しました。最新の状態です。");
  };

  const createForm = (input: NewFormInput) => {
    const form: FormTemplate = {
      id: `custom-${Date.now()}`,
      icon: "custom",
      name: input.name,
      description: input.description,
      category: input.category,
      tone: "blue",
      time: "約3分",
      list: input.list,
      fields: 5,
      route: "直属上長",
      published: false,
    };
    setForms((current) => [...current, form]);
    setFieldsByForm((current) => ({ ...current, [form.id]: ["申請者", "所属部門", "件名", "申請内容", "添付ファイル"] }));
    setSelectedFormId(form.id);
    setNewFormOpen(false);
    notify(`${form.name}を下書きとして追加しました。`);
  };

  const updateRoute = (id: string, steps: string[]) => {
    setForms((current) => current.map((form) => form.id === id ? { ...form, route: steps.join(" → ") } : form));
  };

  return (
    <main className="app-shell">
      <Sidebar view={view} navigate={navigate} notify={notify} />
      <section className="workspace">
        <Topbar query={query} setQuery={setQuery} onSearchFocus={() => view === "dashboard" && navigate("applications")} notify={notify} syncing={syncing} refresh={refresh} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} className={clsx("page-stage", view === "form" && "form-stage")} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            {view === "form" ? (
              <RequestForm template={activeTemplate} pending={submitMutation.isPending} onBack={() => navigate("create")} onSubmit={(input) => submitMutation.mutate(input)} notify={notify} />
            ) : (
              <div className={clsx("content", view === "management" && "wide-content")}>
                <PageHeading view={view} onCreate={() => navigate("create")} onNewForm={() => setNewFormOpen(true)} />
                {view === "dashboard" && <Dashboard forms={forms} requests={requestQuery.data ?? []} loading={requestQuery.isLoading} onOpenForm={openForm} onShowAll={() => navigate("applications")} />}
                {view === "create" && <TemplateGallery forms={forms} onOpen={openForm} />}
                {view === "applications" && <Applications requests={requestQuery.data ?? []} loading={requestQuery.isLoading} query={query} onOpen={setRequestDetail} notify={notify} />}
                {view === "approvals" && <Approvals selected={selectedApproval} setSelected={setSelectedApproval} notify={notify} />}
                {view === "management" && <FormManagement forms={forms} selected={selectedForm} setSelected={setSelectedFormId} fieldsByForm={fieldsByForm} setFieldsByForm={setFieldsByForm} updateRoute={updateRoute} setForms={setForms} preview={() => setPreviewForm(selectedForm)} notify={notify} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
      <AnimatePresence>{newFormOpen && <NewFormModal close={() => setNewFormOpen(false)} create={createForm} />}</AnimatePresence>
      <AnimatePresence>{previewForm && <PreviewModal form={previewForm} fields={fieldsByForm[previewForm.id] ?? []} close={() => setPreviewForm(null)} useForm={() => { setPreviewForm(null); openForm(previewForm.id); }} />}</AnimatePresence>
      <AnimatePresence>{requestDetail && <RequestDrawer item={requestDetail} close={() => setRequestDetail(null)} notify={notify} />}</AnimatePresence>
    </main>
  );
}

function Sidebar({ view, navigate, notify }: { view: View; navigate: (view: View) => void; notify: (message: string) => void }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => navigate("dashboard")}><span className="brand-mark"><Workflow size={20} /></span><span><strong>RequestHub</strong><small>Workflows</small></span></button>
    <nav aria-label="メインメニュー">
      <p className="nav-label">ワークスペース</p>
      {navItems.map((item, index) => <div key={item.id}>{item.section && <p className="nav-label nav-section">{item.section}</p>}<button className={clsx("nav-item", (view === item.id || (view === "form" && item.id === "create")) && "active")} onClick={() => navigate(item.id)}><item.icon size={19} strokeWidth={1.9} /><span>{item.label}</span>{item.count && <b className={index === 3 ? "urgent" : ""}>{item.count}</b>}</button></div>)}
      <button className="nav-item" onClick={() => notify("Microsoft Graphの接続設定を開きました。")}><Settings2 size={19} /><span>接続設定</span></button>
    </nav>
    <button className="integration-card" onClick={() => notify("接続診断：すべて正常です。")}><span className="integration-icon"><Cloud size={18} /></span><span><strong>SharePoint Online</strong><small><i /> 接続済み</small></span><ChevronRight size={16} /></button>
    <div className="sidebar-profile"><div className="avatar">YT</div><span><strong>山田 太郎</strong><small>経営企画部・管理者</small></span><MoreHorizontal size={18} /></div>
  </aside>;
}

function Topbar({ query, setQuery, onSearchFocus, notify, syncing, refresh }: { query: string; setQuery: (value: string) => void; onSearchFocus: () => void; notify: (message: string) => void; syncing: boolean; refresh: () => void }) {
  return <header className="topbar"><label className="global-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={onSearchFocus} placeholder="申請番号、申請者、キーワードで検索" /><kbd>⌘ K</kbd></label><div className="top-actions"><button className="sync-button" onClick={refresh} disabled={syncing}><RefreshCw size={16} className={syncing ? "spinning" : ""} />{syncing ? "同期中" : "同期"}</button><button className="icon-button" aria-label="通知" onClick={() => notify("未読の通知が3件あります。")}><Bell size={19} /><i /></button><button className="help-chip" onClick={() => notify("RequestHubガイドを開きました。")}>?</button></div></header>;
}

function PageHeading({ view, onCreate, onNewForm }: { view: Exclude<View, "form">; onCreate: () => void; onNewForm: () => void }) {
  const copy = pageCopy[view];
  return <div className="page-heading"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.sub}</p></div>{view === "dashboard" && <button className="primary-button" onClick={onCreate}><Plus size={18} />新しい申請</button>}{view === "management" && <button className="primary-button" onClick={onNewForm}><Plus size={18} />新しいフォーム</button>}</div>;
}

function Dashboard({ forms, requests, loading, onOpenForm, onShowAll }: { forms: FormTemplate[]; requests: RequestRecord[]; loading: boolean; onOpenForm: (id: string) => void; onShowAll: () => void }) {
  const stats = [
    { label: "自分の申請", value: "12", note: "3件が処理中", icon: ReceiptText, tone: "blue", trend: "+8.2%" },
    { label: "承認待ち", value: "5", note: "本日期限 2件", icon: Clock3, tone: "amber", trend: "要確認" },
    { label: "今月の承認済み", value: "24", note: "平均 1.8日で完了", icon: CheckCircle2, tone: "green", trend: "+12%" },
    { label: "今月の申請金額", value: "¥2.48M", note: "予算消化率 68%", icon: WalletCards, tone: "purple", trend: "68%" },
  ];
  return <>
    <div className="stats-grid">{stats.map((stat, index) => <motion.article className="stat-card" key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .045 }}><div className={clsx("stat-icon", stat.tone)}><stat.icon size={21} /></div><span className={clsx("stat-trend", stat.tone)}>{stat.trend}</span><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.note}</small></motion.article>)}</div>
    <div className="dashboard-grid"><section className="panel recent-panel"><PanelHeader title="最近の申請" sub="SharePointで更新された申請" action={<button className="text-button" onClick={onShowAll}>すべて表示 <ArrowRight size={15} /></button>} />{loading ? <TableSkeleton /> : <SimpleRequestTable items={requests.slice(0, 5)} />}</section><section className="panel quick-panel"><PanelHeader title="よく使う申請" sub="ワンクリックで入力を開始" action={<Sparkles size={18} className="sparkle" />} /><div className="quick-list">{forms.slice(0, 4).map((form) => <button key={form.id} onClick={() => onOpenForm(form.id)}><TemplateIcon form={form} small /><span><strong>{form.name}</strong><small>{form.category} ・ {form.time}</small></span><ChevronRight size={17} /></button>)}</div></section></div>
    <section className="automation-banner"><span className="automation-icon"><Zap size={20} /></span><div><span className="eyebrow">POWER AUTOMATE INSIGHT</span><strong>今月の申請処理が12%スピードアップ</strong><p>平均承認時間は1.8日。先月より6時間短縮されています。</p></div><div className="automation-status"><i /><span>稼働率</span><strong>99.9%</strong></div></section>
  </>;
}

function PanelHeader({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return <div className="panel-header"><div><h2>{title}</h2><p>{sub}</p></div>{action}</div>;
}

function TemplateIcon({ form, small = false }: { form: FormTemplate; small?: boolean }) {
  const Icon = iconMap[form.icon] ?? FilePlus2;
  return <span className={clsx("template-icon", form.tone, small && "small")}><Icon size={small ? 18 : 23} /></span>;
}

function TemplateGallery({ forms, onOpen }: { forms: FormTemplate[]; onOpen: (id: string) => void }) {
  const [category, setCategory] = useState("すべて");
  const categories = ["すべて", "経理・購買", "人事・総務", "法務・IT"];
  const visible = forms.filter((form) => category === "すべて" || (category === "経理・購買" ? ["経理", "購買"].includes(form.category) : category === "人事・総務" ? ["人事", "総務"].includes(form.category) : ["法務", "IT"].includes(form.category)));
  return <>
    <div className="catalog-toolbar"><div className="segmented">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><span>{visible.length}件のフォーム</span></div>
    <motion.div layout className="template-grid"><AnimatePresence mode="popLayout">{visible.map((form, index) => <motion.button layout key={form.id} className="template-card" onClick={() => onOpen(form.id)} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .18 }}><div className="template-top"><TemplateIcon form={form} />{index < 2 && <span className="favorite"><Sparkles size={12} />よく使う</span>}</div><h2>{form.name}</h2><p>{form.description}</p><div className="template-meta"><span>{form.category}</span><small><Clock3 size={13} />{form.time}</small></div><div className="template-action">このフォームを開く <ArrowUpRight size={16} /></div></motion.button>)}</AnimatePresence></motion.div>
    <section className="guide-card"><span><Sparkles size={20} /></span><div><strong>どの申請を使えばよいですか？</strong><p>目的を選ぶだけで、適切なフォームと承認ルートをご案内します。</p></div><button>申請ガイドを開く <ArrowRight size={15} /></button></section>
  </>;
}

function Applications({ requests, loading, query, onOpen, notify }: { requests: RequestRecord[]; loading: boolean; query: string; onOpen: (item: RequestRecord) => void; notify: (message: string) => void }) {
  const [status, setStatus] = useState("すべて");
  const [sorting, setSorting] = useState<SortingState>([]);
  const filtered = useMemo(() => requests.filter((item) => {
    const text = `${item.id}${item.type}${item.title}${item.applicant}${item.department}`.toLowerCase();
    const statusMatch = status === "すべて" || (status === "処理中" ? ["承認待ち", "部長承認済", "法務確認中"].includes(item.status) : item.status === status);
    return text.includes(query.toLowerCase()) && statusMatch;
  }), [requests, query, status]);
  const columns = useMemo<ColumnDef<RequestRecord>[]>(() => [
    { accessorKey: "title", header: "申請内容", cell: ({ row }) => <div className="request-cell"><TemplateIcon form={{ ...templates[0], tone: row.original.tone, icon: templates.find((form) => form.name === row.original.type)?.icon ?? "custom" }} small /><span><strong>{row.original.title}</strong><small>{row.original.id} ・ {row.original.type}</small></span></div> },
    { accessorKey: "department", header: "部門" },
    { accessorKey: "applicant", header: "申請者" },
    { accessorKey: "date", header: "申請日" },
    { accessorKey: "amount", header: "申請金額", cell: ({ getValue }) => <strong className="amount">{String(getValue())}</strong> },
    { accessorKey: "status", header: "ステータス", cell: ({ row }) => <StatusBadge item={row.original} /> },
    { id: "actions", header: "", cell: ({ row }) => <button className="row-action" aria-label={`${row.original.id}の詳細`} onClick={(event) => { event.stopPropagation(); onOpen(row.original); }}><MoreHorizontal size={18} /></button> },
  ], [onOpen]);
  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const statuses = ["すべて", "処理中", "承認済み", "差し戻し"];
  return <section className="panel list-panel"><div className="list-toolbar"><div className="status-tabs">{statuses.map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item}{item === "すべて" && <span>{requests.length}</span>}</button>)}</div><div className="toolbar-actions"><button onClick={() => notify("詳細フィルターを開きました。")}><Filter size={15} />絞り込み</button><button onClick={() => notify("申請一覧をCSV形式で出力しました。")}><Download size={15} />エクスポート</button></div></div>{loading ? <TableSkeleton /> : <div className="table-wrap"><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}><button className="sort-head" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getCanSort() && <span>{header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : "↕"}</span>}</button></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} onClick={() => onOpen(row.original)}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><Search size={24} /><strong>該当する申請がありません</strong><p>検索条件やステータスを変更してください。</p></div>}</div>}<div className="pagination"><span>全 {filtered.length} 件を表示</span><div><button disabled>前へ</button><button className="active">1</button><button>次へ</button></div></div></section>;
}

function SimpleRequestTable({ items }: { items: RequestRecord[] }) {
  return <div className="table-wrap compact-table"><table><thead><tr><th>申請内容</th><th>申請者</th><th>申請金額</th><th>ステータス</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="request-cell"><TemplateIcon form={{ ...templates[0], tone: item.tone, icon: templates.find((form) => form.name === item.type)?.icon ?? "custom" }} small /><span><strong>{item.title}</strong><small>{item.id}</small></span></div></td><td>{item.applicant}</td><td><strong className="amount">{item.amount}</strong></td><td><StatusBadge item={item} /></td></tr>)}</tbody></table></div>;
}

function StatusBadge({ item }: { item: RequestRecord }) {
  return <span className={clsx("status-badge", item.tone)}><i />{item.status}</span>;
}

function Approvals({ selected, setSelected, notify }: { selected: number; setSelected: (index: number) => void; notify: (message: string) => void }) {
  const [comment, setComment] = useState("");
  const task = approvalTasks[selected];
  const act = (action: string) => { notify(`${task.id} を${action}しました。Power Automateへ送信済みです。`); setComment(""); };
  return <div className="approval-layout"><section className="panel approval-inbox"><div className="inbox-head"><div><strong>承認待ち</strong><span>{approvalTasks.length}</span></div><button><Filter size={16} /></button></div>{approvalTasks.map((item, index) => <button key={item.id} className={selected === index ? "selected" : ""} onClick={() => setSelected(index)}><div className="approval-row-head"><span>{item.type}</span><small><Clock3 size={12} />{item.age}</small></div><strong>{item.title}</strong><p>{item.applicant} ・ {item.department}</p><div><StatusBadge item={item} /><span className="due">期限 {item.due}</span></div></button>)}</section><motion.section key={task.id} className="panel approval-detail" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}><div className="detail-head"><div><span>{task.type}</span><h2>{task.title}</h2><p>{task.id} ・ {task.applicant}さんからの申請</p></div><button><MoreHorizontal size={20} /></button></div><div className="approval-progress"><div className="done"><Check size={13} /></div><span /><div className="current">{task.step.split(" /")[0]}</div><span /><div>✓</div><p><b>申請</b><b>あなたの承認</b><b>完了</b></p></div><div className="detail-grid"><div><small>申請者</small><strong>{task.applicant}</strong><span>{task.department}</span></div><div><small>申請日</small><strong>{task.date}</strong><span>{task.updated}</span></div><div><small>申請金額</small><strong>{task.amount}</strong><span>税込</span></div><div><small>回答期限</small><strong className="danger-text">{task.due}</strong><span>優先対応</span></div></div><div className="request-note"><span><ReceiptText size={18} /></span><div><small>申請内容</small><p>{task.note}</p></div></div><div className="comment-area"><label htmlFor="approval-comment">承認コメント <span>任意</span></label><textarea id="approval-comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="判断理由や申請者へのメッセージを入力" /></div><div className="approval-actions"><button className="secondary-button" onClick={() => act("差し戻し")}><CircleAlert size={17} />差し戻す</button><button className="approve-button" onClick={() => act("承認")}><Check size={17} />承認する</button></div></motion.section></div>;
}

function FormManagement({ forms, selected, setSelected, fieldsByForm, setFieldsByForm, updateRoute, setForms, preview, notify }: { forms: FormTemplate[]; selected: FormTemplate; setSelected: (id: string) => void; fieldsByForm: Record<string, string[]>; setFieldsByForm: React.Dispatch<React.SetStateAction<Record<string, string[]>>>; updateRoute: (id: string, steps: string[]) => void; setForms: React.Dispatch<React.SetStateAction<FormTemplate[]>>; preview: () => void; notify: (message: string) => void }) {
  const [tab, setTab] = useState("項目設定");
  const [newField, setNewField] = useState("");
  const [addingField, setAddingField] = useState(false);
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState("部門長");
  const fields = fieldsByForm[selected.id] ?? [];
  const steps = selected.route.split(" → ").filter(Boolean);
  const setFields = (next: string[]) => setFieldsByForm((current) => ({ ...current, [selected.id]: next }));
  const moveField = (from: number, to: number) => { if (to < 0 || to >= fields.length) return; const next = [...fields]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setFields(next); };
  const addField = () => { if (!newField.trim()) return; setFields([...fields, newField.trim()]); setNewField(""); setAddingField(false); notify("フォーム項目を追加しました。"); };
  const publish = () => { setForms((current) => current.map((form) => form.id === selected.id ? { ...form, published: true, fields: fields.length } : form)); notify(`${selected.name}の変更を公開しました。`); };
  return <div className="manager-layout"><section className="panel manager-list"><div className="manager-list-head"><div><strong>申請フォーム</strong><span>{forms.length}</span></div><Search size={17} /></div>{forms.map((form) => <button key={form.id} className={selected.id === form.id ? "selected" : ""} onClick={() => setSelected(form.id)}><TemplateIcon form={form} small /><span><strong>{form.name}</strong><small>{form.list}</small></span><ChevronRight size={16} /></button>)}</section><section className="panel builder-panel"><div className="builder-head"><div className="builder-title"><TemplateIcon form={selected} /><span><small className={clsx("publish-status", !selected.published && "draft")}><i />{selected.published ? "公開中" : "下書き"}</small><h2>{selected.name}</h2><p>最終更新：たった今 ・ バージョン 3.4</p></span></div><div><button className="secondary-button" onClick={preview}><Eye size={16} />プレビュー</button><button className="primary-button" onClick={publish}><UploadCloud size={16} />変更を公開</button></div></div><div className="builder-tabs">{["基本設定", "項目設定", "承認フロー", "権限・通知"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
      {tab === "基本設定" && <div className="builder-body"><SectionIntro title="基本情報" sub="申請者に表示する名称とSharePointの保存先を設定します。" /><div className="settings-grid"><label><span>フォーム名</span><input defaultValue={selected.name} /></label><label><span>カテゴリ</span><select defaultValue={selected.category}><option>{selected.category}</option><option>総務</option><option>経理</option><option>人事</option><option>法務</option><option>IT</option></select></label><label className="full"><span>説明</span><textarea defaultValue={selected.description} rows={3} /></label><label className="full"><span>SharePoint リスト</span><div className="connected-input"><Cloud size={17} /><input defaultValue={`contoso.sharepoint.com/RequestHub/Lists/${selected.list}`} /><b><Check size={12} />接続済み</b></div></label></div></div>}
      {tab === "項目設定" && <div className="builder-body"><div className="builder-body-head"><SectionIntro title="フォーム項目" sub="ドラッグして表示順を変更できます。" /><button className="outline-button" onClick={() => setAddingField(true)}><Plus size={16} />項目を追加</button></div><AnimatePresence>{addingField && <motion.div className="inline-composer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><label><span>項目名</span><input value={newField} onChange={(event) => setNewField(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addField()} placeholder="例：利用目的" /></label><button onClick={() => setAddingField(false)}>キャンセル</button><button className="primary-button" onClick={addField}>追加</button></motion.div>}</AnimatePresence><Reorder.Group axis="y" values={fields} onReorder={setFields} className="field-list">{fields.map((field, index) => <Reorder.Item key={field} value={field} className="field-row" whileDrag={{ scale: 1.015, boxShadow: "0 14px 34px rgba(24,39,75,.16)" }}><span className="drag-handle"><GripVertical size={19} /></span><span className="field-number">{String(index + 1).padStart(2, "0")}</span><span className="field-copy"><strong>{field}</strong><small>{field.includes("日") ? "日付" : field.includes("金額") ? "通貨" : field.includes("内容") || field.includes("目的") ? "複数行テキスト" : field.includes("添付") ? "ファイル" : "1行テキスト"}</small></span>{[0, 1, 2, 5].includes(index) && <b className="required-badge">必須</b>}<span className="field-controls"><button disabled={index === 0} onClick={() => moveField(index, index - 1)} aria-label="上へ"><ArrowUp size={15} /></button><button disabled={index === fields.length - 1} onClick={() => moveField(index, index + 1)} aria-label="下へ"><ArrowDown size={15} /></button><button onClick={() => setFields(fields.filter((_, itemIndex) => itemIndex !== index))} aria-label="削除"><X size={15} /></button></span></Reorder.Item>)}</Reorder.Group></div>}
      {tab === "承認フロー" && <div className="builder-body"><div className="builder-body-head"><SectionIntro title="承認フロー" sub="承認者を並べ替え、条件を設定できます。" /><button className="outline-button" onClick={() => setAddingStep(true)}><Plus size={16} />ステップを追加</button></div><AnimatePresence>{addingStep && <motion.div className="inline-composer" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><label><span>承認者・役割</span><select value={newStep} onChange={(event) => setNewStep(event.target.value)}><option>部門長</option><option>経理</option><option>法務</option><option>情報システム</option><option>管掌役員</option></select></label><button onClick={() => setAddingStep(false)}>キャンセル</button><button className="primary-button" onClick={() => { updateRoute(selected.id, [...steps, newStep]); setAddingStep(false); notify(`${newStep}を承認ステップに追加しました。`); }}>追加</button></motion.div>}</AnimatePresence><div className="workflow-canvas"><div className="flow-node start"><span><Send size={17} /></span><div><small>開始</small><strong>申請者が送信</strong></div></div><div className="flow-connector" /><Reorder.Group axis="y" values={steps} onReorder={(next) => updateRoute(selected.id, next)} className="workflow-list">{steps.map((step, index) => <Reorder.Item key={`${step}-${index}`} value={step} className="flow-node approval" whileDrag={{ scale: 1.02 }}><GripVertical size={18} /><span>{index + 1}</span><div><small>STEP {index + 1}</small><strong>{step}</strong><p>{index === 0 ? "申請者の直属上長" : `${step}グループ`}</p></div><button onClick={() => notify(`${step}の承認条件を開きました。`)}>条件設定</button></Reorder.Item>)}</Reorder.Group><div className="flow-connector" /><div className="flow-node finish"><span><Check size={17} /></span><div><small>完了</small><strong>結果を自動通知</strong><p>Teams・メール</p></div></div></div></div>}
      {tab === "権限・通知" && <div className="builder-body"><SectionIntro title="権限・通知" sub="Microsoft 365グループと通知ルールを設定します。" /><div className="toggle-list">{[["申請者へ受付通知", "申請受付時にTeamsで通知します。", true], ["承認者へリマインド", "24時間未処理の場合に通知します。", true], ["部門内の申請を閲覧可能", "部門管理者へ一覧を公開します。", false]].map(([title, note, checked], index) => <div className="toggle-row" key={String(title)}><label htmlFor={`notification-${index}`}><strong>{title}</strong><small>{note}</small></label><input id={`notification-${index}`} type="checkbox" defaultChecked={Boolean(checked)} /></div>)}</div></div>}
    </section></div>;
}

function SectionIntro({ title, sub }: { title: string; sub: string }) {
  return <div className="section-intro"><h3>{title}</h3><p>{sub}</p></div>;
}

function NewFormModal({ close, create }: { close: () => void; create: (input: NewFormInput) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewFormInput>({ resolver: zodResolver(newFormSchema), defaultValues: { category: "総務", list: "SP_CustomRequests" } });
  return <ModalShell close={close} label="新しい申請フォーム"><div className="modal-head"><div><span className="eyebrow">FORM STUDIO</span><h2>新しい申請フォーム</h2><p>基本情報を入力すると編集画面へ追加されます。</p></div><button onClick={close} aria-label="閉じる"><X size={20} /></button></div><form onSubmit={handleSubmit(create)}><div className="modal-fields"><FieldLabel label="フォーム名" error={errors.name?.message}><input {...register("name")} placeholder="例：押印申請" /></FieldLabel><FieldLabel label="カテゴリ"><select {...register("category")}><option>総務</option><option>経理</option><option>購買</option><option>人事</option><option>法務</option><option>IT</option></select></FieldLabel><FieldLabel label="説明" full error={errors.description?.message}><textarea {...register("description")} rows={3} placeholder="このフォームの利用目的を入力" /></FieldLabel><FieldLabel label="SharePoint リスト名" full error={errors.list?.message}><input {...register("list")} /><small>保存先リストとして使用します。</small></FieldLabel></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>キャンセル</button><button type="submit" className="primary-button"><Plus size={16} />フォームを追加</button></div></form></ModalShell>;
}

function ModalShell({ close, label, children, wide = false }: { close: () => void; label: string; children: React.ReactNode; wide?: boolean }) {
  return <motion.div className="modal-backdrop" onMouseDown={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className={clsx("modal-card", wide && "wide-modal")} role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => event.stopPropagation()} initial={{ opacity: 0, scale: .97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98, y: 8 }}>{children}</motion.section></motion.div>;
}

function FieldLabel({ label, error, full = false, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return <label className={clsx("field-label", full && "full", error && "has-error")}><span>{label} <b>*</b></span>{children}{error && <em>{error}</em>}</label>;
}

function PreviewModal({ form, fields, close, useForm }: { form: FormTemplate; fields: string[]; close: () => void; useForm: () => void }) {
  return <ModalShell close={close} label={`${form.name}のプレビュー`} wide><div className="preview-bar"><div><i /><i /><i /></div><span><Eye size={14} />申請者向けプレビュー</span><button onClick={close}><X size={18} /></button></div><div className="preview-content"><div className="preview-heading"><TemplateIcon form={form} /><div><span>{form.category}</span><h2>{form.name}</h2><p>{form.description}</p></div></div><div className="preview-fields">{fields.slice(0, 8).map((field, index) => <label key={`${field}-${index}`} className={field.includes("内容") || field.includes("目的") || field.includes("添付") ? "full" : ""}><span>{field}{index < 3 && <b>*</b>}</span>{field.includes("内容") || field.includes("目的") ? <textarea disabled placeholder="入力してください" /> : <input disabled placeholder={field.includes("日") ? "2026/09/11" : "入力してください"} />}</label>)}</div><div className="preview-route"><Workflow size={18} /><span><strong>承認ルート</strong><small>{form.route}</small></span></div></div><div className="modal-actions"><button className="secondary-button" onClick={close}>閉じる</button><button className="primary-button" onClick={useForm}>このフォームを試す <ArrowRight size={16} /></button></div></ModalShell>;
}

function RequestForm({ template, pending, onBack, onSubmit, notify }: { template: FormTemplate; pending: boolean; onBack: () => void; onSubmit: (input: RequestInput) => void; notify: (message: string) => void }) {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<string[]>([]);
  const [saveState, setSaveState] = useState("自動保存済み");
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RequestInput>({ resolver: zodResolver(requestSchema), defaultValues: { applicant: "山田 太郎", department: "経営企画部", title: sampleTitle(template.id), date: "2026-09-11", amount: template.id === "leave" ? "1" : "48620", purpose: samplePurpose(template.id) } });
  const validate = handleSubmit(() => setStep(2));
  const values = getValues();
  const changed = () => { setSaveState("保存中…"); globalThis.setTimeout(() => setSaveState("自動保存済み"), 700); };
  return <div className="form-page"><div className="form-topline"><button onClick={onBack}><ArrowLeft size={17} />フォーム一覧へ</button><span className={saveState === "保存中…" ? "saving" : ""}>{saveState === "保存中…" ? <LoaderCircle size={14} className="spinning" /> : <Cloud size={14} />}{saveState}</span></div><div className="form-layout"><aside className="form-summary"><TemplateIcon form={template} /><span className="category-tag">{template.category}</span><h1>{template.name}</h1><p>{template.description}</p><div className="form-facts"><span><small>入力項目</small><strong>{template.fields}項目</strong></span><span><small>目安時間</small><strong>{template.time}</strong></span></div><ol className="form-steps">{[["申請内容", "必要事項を入力"], ["内容確認", "承認ルートを確認"], ["申請完了", "受付番号を発行"]].map(([title, sub], index) => <li key={title} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><div><strong>{title}</strong><small>{sub}</small></div></li>)}</ol><div className="sharepoint-note"><Cloud size={17} /><span><strong>SharePointへ保存</strong><small>{template.list}</small></span><CheckCircle2 size={16} /></div></aside>{step === 1 ? <form className="application-form" onSubmit={validate} onChangeCapture={changed}><div className="form-header"><div><span className="draft-badge">下書き</span><h2>{template.name}</h2><p>必須項目を入力して、内容確認へ進んでください。</p></div><span>申請番号：自動採番</span></div><FormBlock title="申請者情報" sub="Microsoft 365のプロフィールから自動入力されています。"><div className="form-grid"><FieldLabel label="申請者" error={errors.applicant?.message}><input {...register("applicant")} /></FieldLabel><FieldLabel label="所属部門" error={errors.department?.message}><select {...register("department")}><option>経営企画部</option><option>営業第一部</option><option>プロダクト開発部</option><option>人事部</option></select></FieldLabel></div></FormBlock><FormBlock title="申請内容" sub={`${template.name}の内容を入力してください。`}><div className="form-grid"><FieldLabel label="件名" full error={errors.title?.message}><input {...register("title")} /></FieldLabel><FieldLabel label={template.id === "leave" ? "取得日" : "利用・希望日"} error={errors.date?.message}><input type="date" {...register("date")} /></FieldLabel><FieldLabel label={template.id === "leave" ? "日数（0.5 / 1）" : "申請金額（税込）"} error={errors.amount?.message}><div className="currency-input"><BadgeJapaneseYen size={16} /><input type="number" {...register("amount")} /></div></FieldLabel><FieldLabel label="申請目的・補足" full error={errors.purpose?.message}><textarea rows={5} {...register("purpose")} /></FieldLabel></div></FormBlock><FormBlock title="添付ファイル" sub="領収書や見積書など、根拠資料を添付できます。"><label className="dropzone"><input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))} /><UploadCloud size={25} /><strong>{files.length ? `${files.length}件のファイルを選択済み` : "ファイルをドラッグ＆ドロップ"}</strong><small>{files.length ? files.join(" ・ ") : "またはクリックして選択（最大10MB）"}</small></label></FormBlock><div className="form-actions"><button type="button" className="secondary-button" onClick={() => notify("下書きをSharePointへ保存しました。")}>下書き保存</button><button type="button" className="ghost-button" onClick={onBack}>キャンセル</button><button type="submit" className="primary-button">内容を確認 <ArrowRight size={17} /></button></div></form> : <section className="application-form confirmation-card"><div className="form-header"><div><span className="confirm-badge"><ShieldCheck size={14} />入力内容を確認</span><h2>この内容で申請しますか？</h2><p>送信後、承認者へTeamsとメールで通知されます。</p></div></div><div className="confirmation-grid"><div><small>申請者</small><strong>{values.applicant}</strong><span>{values.department}</span></div><div><small>件名</small><strong>{values.title}</strong><span>{values.date}</span></div><div><small>申請金額</small><strong>¥{Number(values.amount).toLocaleString("ja-JP")}</strong><span>税込</span></div><div className="full"><small>申請目的・補足</small><p>{values.purpose}</p></div></div><div className="route-confirm"><Workflow size={19} /><span><small>承認ルート</small><strong>{template.route}</strong></span></div><div className="form-actions"><button className="secondary-button" onClick={() => setStep(1)}><ArrowLeft size={16} />修正する</button><button className="primary-button" disabled={pending} onClick={handleSubmit(onSubmit)}>{pending ? <><LoaderCircle size={17} className="spinning" />SharePointへ送信中</> : <><Send size={17} />申請を送信</>}</button></div></section>}</div></div>;
}

function FormBlock({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return <section className="form-block"><SectionIntro title={title} sub={sub} />{children}</section>;
}

function RequestDrawer({ item, close, notify }: { item: RequestRecord; close: () => void; notify: (message: string) => void }) {
  return <motion.div className="drawer-backdrop" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.aside className="request-drawer" onClick={(event) => event.stopPropagation()} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}><div className="drawer-head"><span>申請詳細</span><button onClick={close}><X size={20} /></button></div><div className="drawer-body"><TemplateIcon form={{ ...templates[0], tone: item.tone, icon: templates.find((form) => form.name === item.type)?.icon ?? "custom" }} /><StatusBadge item={item} /><h2>{item.title}</h2><p>{item.id} ・ {item.type}</p><div className="drawer-grid"><div><small>申請者</small><strong>{item.applicant}</strong></div><div><small>所属部門</small><strong>{item.department}</strong></div><div><small>申請日</small><strong>{item.date}</strong></div><div><small>申請金額</small><strong>{item.amount}</strong></div></div><div className="timeline"><h3>処理履歴</h3><div className="done"><i><Check size={12} /></i><span><strong>申請を受付</strong><small>{item.date} 09:42</small></span></div><div className="current"><i /><span><strong>{item.status}</strong><small>Power Automateで処理中</small></span></div><div><i /><span><strong>処理完了</strong><small>承認後に更新</small></span></div></div></div><div className="drawer-actions"><button className="secondary-button" onClick={() => notify(`${item.id}を複製しました。`)}>複製</button><button className="primary-button" onClick={() => notify(`${item.id}の編集画面を開きました。`)}>申請を編集</button></div></motion.aside></motion.div>;
}

function Toast({ message }: { message: string }) {
  return <motion.div className="toast" initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }}><span><Check size={15} /></span>{message}</motion.div>;
}

function TableSkeleton() {
  return <div className="table-skeleton">{Array.from({ length: 5 }).map((_, index) => <div key={index}><i /><span /><b /><em /></div>)}</div>;
}

function sampleTitle(id: string) {
  return id === "purchase" ? "開発用モニター 3台" : id === "leave" ? "年次有給休暇" : id === "contract" ? "デザイン業務委託契約の更新" : id === "trip" ? "福岡顧客訪問（2泊3日）" : id === "account" ? "Figma Editor権限追加" : "大阪支社 出張交通費";
}

function samplePurpose(id: string) {
  return id === "purchase" ? "新規入社メンバーの開発環境を整備するため、既存機種と統一して購入します。" : id === "leave" ? "私用のため休暇を取得します。緊急対応は佐藤さんへ引継ぎ済みです。" : id === "contract" ? "新サービスのブランドデザインおよび運用支援業務を委託するためです。" : id === "trip" ? "次期契約更新に向けた要件ヒアリングおよび提案説明のためです。" : id === "account" ? "プロジェクトでの画面設計およびデザインレビューに使用します。" : "四半期事業レビューへの参加および大阪支社メンバーとの打ち合わせのためです。";
}
