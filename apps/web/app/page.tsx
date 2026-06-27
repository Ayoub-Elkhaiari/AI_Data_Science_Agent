'use client';

import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  UploadCloud,
} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Theme = 'light' | 'dark';

type Analysis = {
  id: string;
  filename?: string;
  status: string;
  timeline: string[];
  profile: {
    rows: number;
    columns: number;
    missing_values: number;
    duplicate_rows: number;
    numeric_columns: string[];
    categorical_columns: string[];
  };
  plan: {
    summary?: string;
    quality_issues: string[];
    cleaning_plan: Array<{action: string; column?: string; enabled: boolean}>;
  };
  charts: Array<{title: string; url: string}>;
  ml: {
    detected_task: string;
    recommended_models: Array<{
      name: string;
      expected_performance: string;
      strengths?: string[];
      weaknesses?: string[];
    }>;
  };
};

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('theme') as Theme | null;
    const nextTheme = saved === 'dark' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  async function upload(file: File) {
    setBusy(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);

      const uploadResponse = await fetch(`${API}/upload`, {method: 'POST', body: form});
      if (!uploadResponse.ok) throw new Error(await readApiError(uploadResponse, 'Upload failed'));
      const uploaded = await uploadResponse.json();

      const analyzeResponse = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({analysis_id: uploaded.id}),
      });
      if (!analyzeResponse.ok) throw new Error(await readApiError(analyzeResponse, 'Analysis failed'));

      setAnalysis(await analyzeResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while analyzing the dataset.');
    } finally {
      setBusy(false);
    }
  }

  const topStats = useMemo(
    () => [
      {label: 'Analyses', value: analysis ? '1' : '0', icon: Activity},
      {label: 'Rows', value: analysis ? formatNumber(analysis.profile.rows) : 'Ready', icon: Database},
      {label: 'Reports', value: analysis ? '1' : 'None', icon: FileText},
      {label: 'Status', value: busy ? 'Running' : analysis?.status || 'Idle', icon: CheckCircle2},
    ],
    [analysis, busy],
  );

  return (
    <main className="min-h-screen bg-app text-app">
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-5 py-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 border-r border-line pr-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Data Science</p>
              <p className="text-xs text-muted">Agent Platform</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1 text-sm">
            {['Overview', 'Data quality', 'Cleaning', 'Visuals', 'ML advice', 'Reports'].map((item, index) => (
              <a
                className={`flex items-center justify-between rounded-md px-3 py-2 font-medium ${
                  index === 0 ? 'bg-soft text-app' : 'text-muted hover:bg-soft hover:text-app'
                }`}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                key={item}
              >
                {item}
                {index === 0 ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
              </a>
            ))}
          </nav>

          <div className="mt-10 rounded-lg border border-line bg-panel p-4">
            <ShieldCheck className="text-accent" size={20} />
            <p className="mt-3 text-sm font-semibold">Deterministic execution</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              The planner explains the work. Python services handle the data operations.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Analytics workspace</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">Automated data science review</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Upload a CSV or Excel file to profile quality, generate a cleaning plan, create charts, get ML guidance,
                and export a report.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="icon-button" onClick={toggleTheme} title="Toggle theme" type="button">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <label className="primary-button cursor-pointer">
                <UploadCloud size={18} />
                Upload dataset
                <input
                  accept=".csv,.xlsx"
                  className="sr-only"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.currentTarget.value = '';
                  }}
                  type="file"
                />
              </label>
            </div>
          </header>

          {error ? (
            <div className="error-banner mt-6">
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">Analysis could not finish</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          ) : null}

          {busy ? (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-line bg-panel p-4">
              <Loader2 className="animate-spin text-accent" size={20} />
              <p className="text-sm font-medium">Running profiling, planning, cleaning, visualization, ML advice, and report generation.</p>
            </div>
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" id="overview">
            {topStats.map((item) => (
              <div className="metric-card" key={item.label}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{item.label}</p>
                  <item.icon className="text-accent" size={18} />
                </div>
                <p className="mt-4 text-2xl font-semibold capitalize">{item.value}</p>
              </div>
            ))}
          </section>

          {analysis ? <AnalysisView analysis={analysis} /> : <EmptyState />}
        </div>
      </div>
    </main>
  );
}

function AnalysisView({analysis}: {analysis: Analysis}) {
  const profileStats = [
    ['Rows', formatNumber(analysis.profile.rows)],
    ['Columns', formatNumber(analysis.profile.columns)],
    ['Missing values', formatNumber(analysis.profile.missing_values)],
    ['Duplicates', formatNumber(analysis.profile.duplicate_rows)],
    ['Numeric fields', formatNumber(analysis.profile.numeric_columns.length)],
    ['Categorical fields', formatNumber(analysis.profile.categorical_columns.length)],
  ];

  return (
    <div className="mt-8 space-y-10">
      <section>
        <SectionHeader kicker="Dataset overview" title="Profile summary" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {profileStats.map(([label, value]) => (
            <div className="metric-card compact" key={label}>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="data-quality">
        <SectionHeader kicker="Data quality" title="Findings and risks" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(analysis.plan.quality_issues.length ? analysis.plan.quality_issues : ['No major quality issues were detected.']).map((issue) => (
            <div className="result-row" key={issue}>
              <AlertCircle size={18} />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="cleaning">
        <SectionHeader kicker="Cleaning" title="Approved deterministic actions" />
        <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
          {analysis.plan.cleaning_plan.length ? (
            analysis.plan.cleaning_plan.map((action, index) => (
              <label className="table-row" key={`${action.action}-${action.column || index}`}>
                <input className="h-4 w-4 accent-checkbox" defaultChecked={action.enabled} type="checkbox" />
                <span className="font-medium">{prettyAction(action.action)}</span>
                <span className="text-muted">{action.column || 'All columns'}</span>
              </label>
            ))
          ) : (
            <p className="p-4 text-sm text-muted">No cleaning actions were recommended.</p>
          )}
        </div>
      </section>

      <section id="visuals">
        <SectionHeader kicker="Visualization center" title="Generated charts" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analysis.charts.map((chart) => (
            <a className="chart-card" href={chartSrc(chart.url)} key={chart.url} rel="noreferrer" target="_blank">
              <div className="chart-image-wrap">
                <img alt={chart.title} className="chart-image" loading="lazy" src={chartSrc(chart.url)} />
              </div>
              <div className="chart-meta">
                <p className="font-semibold">{chart.title}</p>
                <p className="mt-1 text-sm text-muted">Open full chart</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="ml-advice">
        <SectionHeader kicker="ML advice" title={`Detected task: ${analysis.ml.detected_task}`} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {analysis.ml.recommended_models.map((model) => (
            <div className="metric-card" key={model.name}>
              <p className="font-semibold">{model.name}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{model.expected_performance}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader kicker="Timeline" title="Pipeline run" />
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.timeline.map((step) => (
            <span className="status-pill" key={step}>
              {step}
            </span>
          ))}
        </div>
      </section>

      <section id="reports" className="rounded-lg border border-line bg-ink p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Report</p>
            <h2 className="mt-1 text-2xl font-semibold">Export analysis outputs</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="light-button" href={`${API}/report/${analysis.id}`}>
              <FileText size={18} />
              Export HTML
            </a>
            <a className="light-button" href={`${API}/download/${analysis.id}`}>
              <ArrowDownToLine size={18} />
              Clean CSV
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="mt-8 rounded-lg border border-dashed border-line bg-panel p-8">
      <div className="flex max-w-2xl flex-col gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-soft text-accent">
          <RotateCcw size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Ready for a dataset</h2>
          <p className="mt-2 leading-7 text-muted">
            The workspace will populate with profile metrics, quality findings, cleaning actions, generated chart links,
            model recommendations, and report exports after upload.
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({kicker, title}: {kicker: string; title: string}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">{kicker}</p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
    </div>
  );
}

async function readApiError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.detail || fallback;
  } catch {
    return fallback;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function prettyAction(action: string) {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function chartSrc(url: string) {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API}${url}`;
  return `${API}/${url}`;
}
