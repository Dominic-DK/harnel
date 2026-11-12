// README에 넣는 정적 도식을 한글(assets/)과 영어(assets/en/)로 생성한다.
// 배치도의 좌표와 구성 요소 목록은 docs/index.html 한 곳에만 두고 여기서 읽는다.
// 실행: node tools/build-assets.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'docs/index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const data = script.split('// ── 화면 ──')[0].replace('(function () {', '');
const { IC, H, N, Z, RAIL, E } = new Function(data + '; return { IC, H, N, Z, RAIL, E };')();

const C = {
  bg: '#081b31', panel: '#0c2543', ink: '#e9f1fc', soft: '#9db5d0', rule: '#22436a', line: '#5a7fa8',
  u: '#72aaff', c: '#b79bff', r: '#4ddcbd', x: '#94a7ba', o: '#ff7fc2', hot: '#ffb23f',
};
const FONT = `-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Segoe UI', sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

// 언어별 문구
const T = {
  ko: {
    nodes: {}, zones: null,
    rail: '관측 탭 ▸ Langfuse', kNew: '신규', kMod: '수정',
    edges: { a_gw: '요청 · 사용자 키', trig_ledger: '예약 → 작업', gw_ledger: '작업 기록', gw_appr: '승인 대기', mg_tc: '전달', tc_api: '계정 토큰 주입', mg_lf: '호출 기록',
      sup1_ledger: '작업 가져오기', sup2_ledger: '작업 가져오기', sup3_ledger: '이벤트 보고', host1_mg: '단기 키', host1_repo: 'PR', host2_docs: '읽기 전용', host3_logs: '패턴 감지', loop_wiki: '규칙' },
    floorAlt: 'Harnel 배치도: 위에 사용자 PC 3대와 슬랙, 가운데 중앙 서버의 게이트웨이·작업 원장·모델 게이트웨이·관측, 아래에 클라우드 VM 2대와 사내 서버 1대. 모든 장비는 중앙 서버로만 연결된다',
    zUser: '사용자 영역', zCore: '중앙 서버', zRun: '실행 장비 · 클라우드 VM과 사내 서버',
    l1: ['사용자 접점', ['데스크톱 앱과 메신저. 요청, 승인, 결과 확인.', '사용자 PC의 파일 작업은 해당 PC에서 실행한다.']],
    api: ['모델 API', ['외부 제공자']],
    l2: ['중앙 게이트웨이', ['사용자를 인증하고 작업을 원장에 기록한다.']],
    chips: ['작업 원장', '호스트 등록부', '위임 토큰', '트리거', '승인 대기열', '정책 등록부'],
    l3: ['모델 게이트웨이', ['계정 키는 이 서버에만 보관한다.', '에이전트는 단기 키만 사용한다.']],
    pool: '계정 풀',
    l4: ['관측', ['게이트웨이가 처리한 요청을', '모두 기록한다 (예: Langfuse).'], 950],
    l5: ['감독 프로세스', ['실행 장비마다 1개가 상시 실행된다.', '모델 접근 권한과 계정 키가 없다.', '아웃바운드 연결만 사용한다.']],
    l6: ['에이전트 호스트', ['격리된 컨테이너. 인터넷 접근과 계정 키가 없다.', '허용 목록에 없는 요청은 거부한다.', '파일 변경은 사용자 승인 후 적용한다.']],
    l7: ['지식 위키', ['결정 사항, 규칙, 작업 기록을 보관한다.', '사람과 에이전트가 같은 문서를 읽는다.', '필수 규칙은 훅으로 강제한다.']],
    aUser: '요청 · 도구 호출 · 승인', aFetch: '작업 가져오기 · 결과 보고 (아웃바운드 연결)', aModel: '단기 키로 모델 호출', aStart: '기동 · 전달', aWiki: '규칙 읽기 · 보고', aToken: '계정 토큰 주입', tap: '관측 탭',
    layersAlt: 'Harnel의 7개 계층: 사용자 접점, 중앙 게이트웨이, 모델 게이트웨이, 관측, 감독 프로세스, 에이전트 호스트, 지식 위키',
    heroSub: ['사용자 PC, 중앙 서버, 실행 장비에 걸친 사내 에이전트 배치 구조'], heroTag: '설계 초안 · 7개 계층 · 유즈케이스 5개', heroCore: '게이트웨이 · 작업 원장',
    heroAlt: 'Harnel: 사용자 PC, 중앙 서버, 실행 장비에 걸친 사내 에이전트 배치 구조',
  },
  en: {
    nodes: {
      pcA: ['PC-A developer', 'Desktop app · local run'], pcB: ['PC-B site engineer', 'Desktop app · local run'], pcC: ['PC-C operator', 'Desktop app · approver'],
      slack: ['Slack', 'Requests · approvals'], api: ['Model API', 'Model provider'],
      trig: ['Trigger', 'Schedule · event'], gw: ['Gateway', 'Auth · delegation · tap'], appr: ['Approval queue', 'Items to approve'],
      mg: ['Model gateway', 'Key check · budget'], tc: ['Account pool', 'Accounts · rotation'],
      pol: ['Policy registry', 'Hashes · scopes'], ledger: ['Task ledger', 'Owner · state · trace'], reg: ['Host registry', 'Keys · heartbeat'], lf: ['Langfuse', 'Traces · usage'],
      sup1: ['Supervisor', 'Always on, no model'], host1: ['Write host', 'Code-change profile'], wiki: ['Wiki', 'Rules'], loop: ['Work split', 'Roles'], repo: ['Repo', 'PR · CI'],
      sup2: ['Supervisor', 'Always on, no model'], host2: ['Read host', 'Document profile'], docs: ['Document folder', 'Read-only mount'],
      sup3: ['Supervisor', 'Always on, no model'], host3: ['Resident agent', 'Watches build log'], logs: ['Build log', 'Read-only'],
    },
    zones: [['User PCs · entry', 'Desktop app and Slack'], ['External', ''], ['Central server', ''], ['VM-1 code VM', 'Cloud'], ['SV-1 on-prem', 'Corporate network'], ['VM-2 monitor VM', 'Cloud']],
    rail: 'Tap ▸ Langfuse', kNew: 'new', kMod: 'adapt',
    edges: { a_gw: 'Request · user key', trig_ledger: 'Schedule → task', gw_ledger: 'Record task', gw_appr: 'Awaiting', mg_tc: 'Forward', tc_api: 'Inject account token', mg_lf: 'Record call',
      sup1_ledger: 'Fetch task', sup2_ledger: 'Fetch task', sup3_ledger: 'Report event', host1_mg: 'Short-lived key', host1_repo: 'PR', host2_docs: 'Read-only', host3_logs: 'Pattern found', loop_wiki: 'Rules' },
    floorAlt: 'Harnel floor plan: three user PCs and Slack at the top; the gateway, task ledger, model gateway, and observability on the central server in the middle; two cloud VMs and one on-premises server at the bottom. Every machine connects only to the central server',
    zUser: 'User side', zCore: 'Central server', zRun: 'Execution machines · cloud VMs and on-premises servers',
    l1: ['User entry', ['Desktop app and messenger. Requests, approvals, results.', "File operations on a user's PC run on that PC."]],
    api: ['Model API', ['External provider']],
    l2: ['Central gateway', ['Authenticates users and records tasks in the ledger.']],
    chips: ['Task ledger', 'Host registry', 'Delegation token', 'Trigger', 'Approval queue', 'Policy registry'],
    l3: ['Model gateway', ['Account keys stay on this server.', 'Agents use short-lived keys.']],
    pool: 'Account pool',
    l4: ['Observability', ['Records every', 'gateway request.'], 1018],
    l5: ['Supervisor', ['One always-on process per machine.', 'No model access, no account keys.', 'Outbound connections only.']],
    l6: ['Agent host', ['Isolated container. No internet, no account keys.', 'Requests outside the allowlist are rejected.', 'File changes apply after user approval.']],
    l7: ['Knowledge wiki', ['Decisions, rules, and work records.', 'People and agents read the same documents.', 'Mandatory rules are enforced by hooks.']],
    aUser: 'Requests · tool calls · approvals', aFetch: 'Fetch tasks · report results (outbound connection)', aModel: 'Model call with short-lived key', aStart: 'Start · pass task', aWiki: 'Read rules · report', aToken: 'Inject account token', tap: 'Observability tap',
    layersAlt: 'The seven layers of Harnel: user entry, central gateway, model gateway, observability, supervisor, agent host, knowledge wiki',
    heroSub: ['A deployment layout for company-internal agents:', 'user PCs, a central server, and execution machines.'], heroTag: 'DESIGN DRAFT · 7 LAYERS · 5 USE CASES', heroCore: 'Gateway · task ledger',
    heroAlt: 'Harnel: a deployment layout for company-internal agents across user PCs, a central server, and execution machines',
  },
};

const mix = (hex, pct) => {            // 패널 색 위에 hex 를 pct 만큼 섞는다
  const p = [0x0c, 0x25, 0x43], h = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return '#' + h.map((v, i) => Math.round(p[i] + (v - p[i]) * pct).toString(16).padStart(2, '0')).join('');
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const frame = (w, h, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" font-family="${FONT}">`
  + `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24,0 H0 V24" fill="none" stroke="#a9c8ff" stroke-opacity="0.06" stroke-width="1"/></pattern>`
  + `<marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="${C.line}"/></marker>`
  + `<marker id="arh" viewBox="0 0 8 8" refX="7" refY="4" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="${C.hot}"/></marker></defs>`
  + `<rect width="${w}" height="${h}" rx="18" fill="${C.bg}"/><rect width="${w}" height="${h}" rx="18" fill="url(#grid)"/>${body}</svg>\n`;

// ── 배치도 (정적) ──
function floorplan(t) {
  let s = '<g transform="translate(20,20)">';
  Z.forEach((z, i) => {
    const [zt, zs] = t.zones ? t.zones[i] : [z.t, z.s];
    s += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="14" fill="${mix(C[z.g], 0.06)}" stroke="${mix(C[z.g], 0.42)}"/>`
      + `<rect x="${z.x + 14}" y="${z.y + 14}" width="9" height="9" rx="2.5" fill="${C[z.g]}"/>`
      + `<text x="${z.x + 30}" y="${z.y + 23}" font-size="12.5" font-weight="800" fill="${C.ink}">${esc(zt)}</text>`
      + (zs ? `<text x="${z.x + 14}" y="${z.y + 39}" font-size="10.5" fill="${C.soft}">${esc(zs)}</text>` : '');
  });
  for (const k in RAIL) s += `<path d="${RAIL[k].d}" fill="none" stroke="${C.o}" stroke-width="1.6" stroke-dasharray="3 5" opacity="0.9"/>`
    + `<text x="24" y="${RAIL[k].y + 4}" font-size="9.5" font-weight="600" font-family="${MONO}" fill="${C.o}">${esc(t.rail)}</text>`;
  for (const id in E) s += `<path d="${E[id].d}" fill="none" stroke="${C.line}" stroke-width="1.3" marker-end="url(#ar)"/>`;
  for (const id in E) if (E[id].tap) s += `<circle cx="${E[id].tap[1]}" cy="${RAIL[E[id].tap[0]].y}" r="4.5" fill="${C.o}"/>`;
  for (const id in N) {
    const n = N[id], zc = C[n.g], [nt, ns] = t.nodes[id] || [n.t, n.s];
    s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${H}" rx="10" fill="${C.panel}" stroke="${mix(zc, 0.75)}" stroke-width="1.3"${n.k === 'new' ? ' stroke-dasharray="5 3"' : ''}/>`
      + `<rect x="${n.x + 9}" y="${n.y + 13}" width="28" height="28" rx="8" fill="${mix(zc, 0.2)}"/>`
      + `<g transform="translate(${n.x + 15},${n.y + 19})" fill="none" stroke="${zc}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${IC[n.i]}</g>`
      + `<text x="${n.x + 45}" y="${n.y + 25}" font-size="12.5" font-weight="700" fill="${C.ink}">${esc(nt)}</text>`
      + `<text x="${n.x + 45}" y="${n.y + 41}" font-size="10.5" fill="${C.soft}">${esc(ns)}</text>`
      + (n.k !== 'old' ? `<text x="${n.x + n.w - 8}" y="${n.y + 13}" text-anchor="end" font-size="8.5" font-weight="600" font-family="${MONO}" fill="${n.k === 'new' ? zc : C.soft}">${n.k === 'new' ? t.kNew : t.kMod}</text>` : '');
  }
  for (const id in t.edges) {
    const l = E[id].l;
    s += `<text x="${l[0]}" y="${l[1]}" text-anchor="${l[2]}" font-size="11" font-weight="700" fill="${C.hot}" stroke="${C.bg}" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${esc(t.edges[id])}</text>`;
  }
  return frame(1280, 852, s + '</g>', t.floorAlt);
}

// ── 7개 계층 ──
function layers(t) {
  const box = (x, y, w, h, g, num, name, lines, dashed) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.panel}" stroke="${C[g]}" stroke-width="1.6"${dashed ? ' stroke-dasharray="6 4"' : ''}/>`;
    if (num) s += `<circle cx="${x + 26}" cy="${y + 27}" r="14" fill="${C[g]}"/><text x="${x + 26}" y="${y + 32.5}" text-anchor="middle" font-size="15" font-weight="800" fill="${C.bg}">${num}</text>`;
    s += `<text x="${x + (num ? 50 : 16)}" y="${y + 33}" font-size="16.5" font-weight="800" fill="${C.ink}">${esc(name)}</text>`;
    lines.forEach((l, i) => { s += `<text x="${x + 16}" y="${y + 58 + i * 18}" font-size="12.5" fill="${C.soft}">${esc(l)}</text>`; });
    return s;
  };
  const zone = (y, h, g, name, right) => `<rect x="30" y="${y}" width="1140" height="${h}" rx="16" fill="${mix(C[g], 0.06)}" stroke="${mix(C[g], 0.4)}"/><text x="${right ? 1152 : 48}" y="${y + 22}"${right ? ' text-anchor="end"' : ''} font-size="12" font-weight="800" fill="${C[g]}" letter-spacing="0.5">${esc(name)}</text>`;
  const lab = (x, y, text, a = 'start') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="12" font-weight="700" fill="${C.hot}" stroke="${C.bg}" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${esc(text)}</text>`;
  const arrow = (d, both) => `<path d="${d}" fill="none" stroke="${C.hot}" stroke-width="2" marker-end="url(#arh)"${both ? ' marker-start="url(#arh)"' : ''}/>`;
  const tap = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.o}"/>`;
  let s = zone(24, 132, 'u', t.zUser) + zone(186, 262, 'c', t.zCore) + zone(474, 184, 'r', t.zRun, true);
  s += `<path d="M60,214 H1150 V356 H1126" fill="none" stroke="${C.o}" stroke-width="1.8" stroke-dasharray="3 5"/><path d="M60,424 H1150 V356" fill="none" stroke="${C.o}" stroke-width="1.8" stroke-dasharray="3 5"/>`;
  s += arrow('M200,134 V238', true) + arrow('M200,512 V382', true) + arrow('M540,512 V268 H566') + arrow('M344,568 H376') + arrow('M764,568 H796') + arrow('M806,268 H836') + arrow('M920,238 V132');
  s += tap(200, 214) + tap(200, 424) + tap(540, 424);
  s += box(60, 50, 460, 84, 'u', '1', t.l1[0], t.l1[1]);
  s += box(840, 62, 160, 70, 'x', '', t.api[0], t.api[1], true);
  s += box(60, 238, 460, 144, 'c', '2', t.l2[0], t.l2[1]);
  t.chips.forEach((c, i) => { const cx = 76 + (i % 3) * 146, cy = 312 + Math.floor(i / 3) * 30; s += `<rect x="${cx}" y="${cy}" width="134" height="24" rx="6" fill="${mix(C.c, 0.16)}" stroke="${mix(C.c, 0.5)}"/><text x="${cx + 67}" y="${cy + 16.5}" text-anchor="middle" font-size="12" font-weight="600" fill="${C.ink}">${esc(c)}</text>`; });
  s += box(566, 238, 240, 84, 'c', '3', t.l3[0], t.l3[1]);
  s += box(836, 238, 164, 60, 'c', '', t.pool, []);
  s += box(836, 326, 290, 60, 'o', '4', t.l4[0], []);
  t.l4[1].forEach((l, i) => { s += `<text x="${t.l4[2]}" y="${352 + i * 18}" font-size="12.5" fill="${C.soft}">${esc(l)}</text>`; });
  s += box(60, 512, 284, 112, 'r', '5', t.l5[0], t.l5[1]);
  s += box(376, 512, 388, 112, 'r', '6', t.l6[0], t.l6[1]);
  s += box(796, 512, 344, 112, 'r', '7', t.l7[0], t.l7[1]);
  s += lab(212, 176, t.aUser) + lab(212, 462, t.aFetch) + lab(552, 462, t.aModel) + lab(360, 646, t.aStart, 'middle') + lab(780, 646, t.aWiki, 'middle') + lab(932, 176, t.aToken);
  s += `<text x="1138" y="206" text-anchor="end" font-size="10.5" font-weight="700" font-family="${MONO}" fill="${C.o}">${esc(t.tap)}</text><text x="1138" y="441" text-anchor="end" font-size="10.5" font-weight="700" font-family="${MONO}" fill="${C.o}">${esc(t.tap)}</text>`;
  return frame(1200, 682, s, t.layersAlt);
}

// ── 머리 그림 ──
function hero(t) {
  const two = t.heroSub.length > 1;
  let s = `<text x="64" y="${two ? 138 : 150}" font-size="104" font-weight="800" fill="${C.ink}" letter-spacing="-2">Harnel</text>`;
  t.heroSub.forEach((l, i) => { s += `<text x="68" y="${(two ? 186 : 198) + i * 28}" font-size="${two ? 20 : 22}" font-weight="600" fill="${C.soft}">${esc(l)}</text>`; });
  s += `<text x="68" y="${two ? 254 : 240}" font-size="14" font-family="${MONO}" fill="${C.o}" letter-spacing="1.5">${esc(t.heroTag)}</text>`;
  const xs = [760, 880, 1000];
  s += `<rect x="830" y="118" width="250" height="64" rx="14" fill="none" stroke="${C.o}" stroke-width="1.6" stroke-dasharray="3 5"/>`;
  xs.forEach(x => { s += `<path d="M${x + 45},78 V96 H955 V128" fill="none" stroke="${C.line}" stroke-width="1.4"/><path d="M${x + 45},222 V204 H955 V172" fill="none" stroke="${C.line}" stroke-width="1.4"/>`; });
  xs.forEach(x => { s += `<rect x="${x}" y="42" width="90" height="36" rx="9" fill="${C.panel}" stroke="${C.u}" stroke-width="1.6"/><g transform="translate(${x + 37},52)" fill="none" stroke="${C.u}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${IC.laptop}</g>`; });
  s += `<rect x="850" y="128" width="210" height="44" rx="11" fill="${C.panel}" stroke="${C.c}" stroke-width="1.8"/><g transform="translate(866,142)" fill="none" stroke="${C.c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${IC.hub}</g><text x="892" y="155.5" font-size="14" font-weight="700" fill="${C.ink}">${esc(t.heroCore)}</text>`;
  xs.forEach((x, i) => { s += `<rect x="${x}" y="222" width="90" height="36" rx="9" fill="${C.panel}" stroke="${C.r}" stroke-width="1.6"/><g transform="translate(${x + 37},232)" fill="none" stroke="${C.r}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${i === 1 ? IC.server : IC.box}</g>`; });
  return frame(1200, 300, s, t.heroAlt);
}

mkdirSync(join(root, 'assets/en'), { recursive: true });
for (const [lang, dir] of [['ko', 'assets'], ['en', 'assets/en']]) {
  writeFileSync(join(root, dir, 'floorplan.svg'), floorplan(T[lang]));
  writeFileSync(join(root, dir, 'layers.svg'), layers(T[lang]));
  writeFileSync(join(root, dir, 'hero.svg'), hero(T[lang]));
}
console.log('assets/*.svg, assets/en/*.svg');
