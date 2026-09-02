import re

with open('/home/joshua/code/model_insider/qwen3.8/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update react imports
content = re.sub(r'import {([^}]+)} from \'react\';', lambda m: f"import {{{m.group(1)}, lazy, Suspense}} from 'react';" if 'lazy' not in m.group(1) else m.group(0), content)

# 2. Add lazy imports
lazy_imports = """
const GDNDeepDive = lazy(() => import('./components/qwen/GDNDeepDive').then(m => ({ default: m.GDNDeepDive })));
const AttentionDeepDive = lazy(() => import('./components/qwen/AttentionDeepDive').then(m => ({ default: m.AttentionDeepDive })));
const MoEDeepDive = lazy(() => import('./components/qwen/MoEDeepDive').then(m => ({ default: m.MoEDeepDive })));
const GatedResidualDeepDive = lazy(() => import('./components/qwen/GatedResidualDeepDive').then(m => ({ default: m.GatedResidualDeepDive })));
const NgramDeepDive = lazy(() => import('./components/qwen/NgramDeepDive').then(m => ({ default: m.NgramDeepDive })));
"""
content = content.replace("import { AttentionFlowVisual", lazy_imports.strip() + "\nimport { AttentionFlowVisual")

# 3. Replace PageId with Tab and add navSections
page_id_pattern = r"type PageId = [^;]+;\n"
content = re.sub(page_id_pattern, "type Tab = 'overview' | 'architecture' | 'op_gdn' | 'op_attention' | 'op_moe' | 'op_gated_res' | 'op_ngram' | 'op_rope' | 'op_unembed' | 'operators' | 'training' | 'sources';\n", content)

nav_items_pattern = r"const pageIds: PageId\[\] = [^;]+;\nconst navItems: [^\]]+\];\n"
nav_sections = """type NavSection = { title: string; items: Array<{ id: Tab; label: string }> };
const navSections: NavSection[] = [
  { title: 'Chapter 1: 全局概览', items: [{ id: 'overview', label: '系列总览' }] },
  { title: 'Chapter 2: 架构拓扑', items: [{ id: 'architecture', label: '层级与循环' }] },
  { title: 'Chapter 3: 算子深潜', items: [
    { id: 'op_gdn', label: '§3.1 ⭐ Gated DeltaNet' },
    { id: 'op_attention', label: '§3.2 ⭐ 门控注意力 / QSA' },
    { id: 'op_moe', label: '§3.3 SwiGLU / MoE 路由' },
    { id: 'op_gated_res', label: '§3.4 ⭐ 4-Way Gated Residual' },
    { id: 'op_ngram', label: '§3.5 ⭐ N-gram Embedding' },
    { id: 'op_rope', label: '§3.6 RoPE 位置编码' },
    { id: 'op_unembed', label: '§3.7 LM Head + MTP' },
  ]},
  { title: 'Chapter 4: 算子实验室', items: [{ id: 'operators', label: '交互式算子演示' }] },
  { title: 'Chapter 5: 训练与推理', items: [{ id: 'training', label: '训练流程与推理控制' }] },
  { title: 'Chapter 6: 源码边界', items: [{ id: 'sources', label: '官方来源与边界' }] },
];
"""
content = re.sub(nav_items_pattern, nav_sections, content)

# 4. Remove readRoute and navigate functions
read_route_pattern = r"function readRoute\(\).*?return \{ page, model:[^\}]+\};\n\}\n\nfunction navigate.*?\}\n"
content = re.sub(read_route_pattern, "", content, flags=re.DOTALL)

# 5. Add OperatorPlaceholder and LazyWrap
wrappers = """
function OperatorPlaceholder({ name }: { name: string }) {
  return <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}><h2 style={{ color: '#e8edf7', marginBottom: '16px' }}>{name}</h2><p>此算子深潜模块正在构建中...</p></div>;
}

function LazyWrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#67e8f9' }}>加载中...</div>}>{children}</Suspense>;
}
"""
content = content.replace("function Badge({", wrappers + "\nfunction Badge({")

# 6. Update App component state and methods
app_state_old = r"const initialRoute = useMemo\(\(\) => readRoute\(\), \[\]\); const \[activePage, setActivePage\] = useState<PageId>\(initialRoute.page\); const \[modelId, setModelId\] = useState<ModelId>\(initialRoute.model\); const model = models\[modelId\]; const hasMounted = useRef\(false\);\n  useEffect\(\(\) => \{ const syncRoute = \(\) => \{ const route = readRoute\(\); setActivePage\(route.page\); setModelId\(route.model\); \}; window.addEventListener\('popstate', syncRoute\); window.addEventListener\('hashchange', syncRoute\); return \(\) => \{ window.removeEventListener\('popstate', syncRoute\); window.removeEventListener\('hashchange', syncRoute\); \}; \}, \[\]\);\n  useEffect\(\(\) => \{ if \(!hasMounted.current\) \{ hasMounted.current = true; return; \} document.getElementById\('page-heading'\)\?\.focus\(\{ preventScroll: true \}\); \}, \[activePage, modelId\]\);\n  const changeModel = \(id: ModelId\) => \{ setModelId\(id\); navigate\(activePage, id\); \}; const changePage = \(page: PageId\) => \{ setActivePage\(page\); navigate\(page, modelId\); const reducedMotion = window.matchMedia\('\(prefers-reduced-motion: reduce\)'\).matches; window.scrollTo\(\{ top: 0, behavior: reducedMotion \? 'auto' : 'smooth' \}\); \};\n  const content = activePage === 'overview' \? <OverviewPage model=\{model\} /> : activePage === 'architecture' \? <ArchitecturePage key=\{model.id\} model=\{model\} /> : activePage === 'operators' \? <OperatorsPage key=\{model.id\} model=\{model\} /> : activePage === 'training' \? <TrainingPage model=\{model\} /> : <SourcesPage />;"

app_state_new = """const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [modelId, setModelId] = useState<ModelId>('27b');
  const model = models[modelId];
  const hasMounted = useRef(false);

  useEffect(() => { if (!hasMounted.current) { hasMounted.current = true; return; } document.getElementById('page-heading')?.focus({ preventScroll: true }); }, [activeTab, modelId]);

  const changeModel = (id: ModelId) => { setModelId(id); };
  const changeTab = (tab: Tab) => { setActiveTab(tab); const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); };

  const content = (() => {
    switch(activeTab) {
      case 'overview': return <OverviewPage model={model} />;
      case 'architecture': return <ArchitecturePage key={model.id} model={model} />;
      case 'op_gdn': return <LazyWrap><GDNDeepDive /></LazyWrap>;
      case 'op_attention': return <LazyWrap><AttentionDeepDive /></LazyWrap>;
      case 'op_moe': return <LazyWrap><MoEDeepDive /></LazyWrap>;
      case 'op_gated_res': return <LazyWrap><GatedResidualDeepDive /></LazyWrap>;
      case 'op_ngram': return <LazyWrap><NgramDeepDive /></LazyWrap>;
      case 'op_rope': return <OperatorPlaceholder name="RoPE 旋转位置编码" />;
      case 'op_unembed': return <OperatorPlaceholder name="LM Head + MTP" />;
      case 'operators': return <OperatorsPage key={model.id} model={model} />;
      case 'training': return <TrainingPage model={model} />;
      case 'sources': return <SourcesPage />;
      default: return <OverviewPage model={model} />;
    }
  })();"""
content = re.sub(app_state_old, app_state_new, content)

# 7. Update Navigation rendering in sidebar
sidebar_nav_old = r"<nav aria-label=\"Main navigation\">\{navItems.map\(\(item, index\) => <button type=\"button\" key=\{item.id\} className=\{activePage === item.id \? 'active' : ''\} onClick=\{\(\) => changePage\(item.id\)\} aria-current=\{activePage === item.id \? 'page' : undefined\}><span className=\"nav-number\">\{String\(index \+ 1\).padStart\(2, '0'\)\}</span><span><b>\{item.label\}</b><small>\{item.hint\}</small></span></button>\)\}</nav>"
sidebar_nav_new = """<nav aria-label="Main navigation">
  {navSections.map((section) => (
    <div key={section.title} className="nav-group">
      <div className="nav-section-title" style={{ padding: '12px 16px 4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>{section.title}</div>
      {section.items.map((item) => (
        <button type="button" key={item.id} className={activeTab === item.id ? 'active' : ''}
          onClick={() => changeTab(item.id)} aria-current={activeTab === item.id ? 'page' : undefined}>
          <span className="nav-number" style={{ minWidth: '24px' }}>
            <svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor" /></svg>
          </span>
          <span><b>{item.label}</b></span>
        </button>
      ))}
    </div>
  ))}
</nav>"""
content = content.replace(sidebar_nav_old, sidebar_nav_new)

# 8. Update mobile nav rendering
mobile_nav_old = r"<div className=\"mobile-nav\" aria-label=\"Mobile navigation\">\{navItems.map\(\(item\) => <button type=\"button\" key=\{item.id\} className=\{activePage === item.id \? 'active' : ''\} onClick=\{\(\) => changePage\(item.id\)\} aria-current=\{activePage === item.id \? 'page' : undefined\}>\{item.label\}</button>\)\}</div>"
mobile_nav_new = """<div className="mobile-nav" aria-label="Mobile navigation">
  {navSections.map((section) => {
    const isActive = section.items.some(item => item.id === activeTab);
    return (
      <button type="button" key={section.title} className={isActive ? 'active' : ''} onClick={() => changeTab(section.items[0].id)}>
        {section.title.split(': ')[1] || section.title}
      </button>
    );
  })}
</div>"""
content = content.replace(mobile_nav_old, mobile_nav_new)

with open('/home/joshua/code/model_insider/qwen3.8/src/App.tsx', 'w') as f:
    f.write(content)
