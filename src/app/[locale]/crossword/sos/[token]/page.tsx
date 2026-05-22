"use client";

import { useEffect, useMemo, useState, use } from "react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// Firestore REST 헬퍼

const PROJECT_ID = "ullim-crossword-f9bc4";
const REST_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue?: { values?: FsValue[] } }
  | { mapValue?: { fields?: Record<string, FsValue> } };

function fromFs(v: FsValue | undefined): unknown {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v)
    return (v.arrayValue?.values ?? []).map(fromFs);
  if ("mapValue" in v) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.mapValue?.fields ?? {})) {
      out[k] = fromFs(val);
    }
    return out;
  }
  return undefined;
}

function toFs(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  }
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v))
    return { arrayValue: { values: v.map(toFs) } };
  if (typeof v === "object") {
    const fields: Record<string, FsValue> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      fields[k] = toFs(val);
    }
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported: ${typeof v}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 도메인 타입

interface WordMeta {
  number: number;
  direction: "across" | "down";
  startRow: number;
  startCol: number;
  length: number;
  hint: string;
}

interface GridSnapshot {
  gridSize: number;
  words: WordMeta[];
  blackCells: string[];
  solvedLetters: Record<string, string>;
  targetWordNumber: number;
  targetDirection: "across" | "down";
}

interface SosAnswer {
  wordNumber: number;
  direction: "across" | "down";
  text: string;
  answererNickname?: string;
  answeredAt?: string;
}

interface SosDoc {
  stageId: number;
  locale: string;
  createdAt: string;
  gridSnapshot: GridSnapshot;
  answers: SosAnswer[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 페이지

const APP_STORE_URL = "https://apps.apple.com/app/id6761682839";

export default function SosPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SosDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WordMeta | null>(null);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [recentlyAnswered, setRecentlyAnswered] = useState<string | null>(null);
  // 교차점 셀 클릭 시 가로/세로 중 어느 단어를 답할지 고르는 시트
  const [dirPicker, setDirPicker] = useState<WordMeta[] | null>(null);

  // Firestore에서 SOS doc 가져오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${REST_BASE}/sos/${encodeURIComponent(token)}`,
        );
        if (!res.ok) {
          setError(
            res.status === 404
              ? "이미 만료되었거나 잘못된 링크예요."
              : `오류가 발생했어요 (${res.status}).`,
          );
          return;
        }
        const json = await res.json();
        const parsed = fromFs({
          mapValue: { fields: json.fields },
        }) as SosDoc;
        if (!cancelled) setData(parsed);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // 답안 제출
  const submit = async () => {
    if (!data || !selected || !input.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newAnswer: SosAnswer = {
        wordNumber: selected.number,
        direction: selected.direction,
        text: input.trim(),
        answeredAt: new Date().toISOString(),
      };
      if (nickname.trim()) newAnswer.answererNickname = nickname.trim();

      const newAnswers = [...data.answers, newAnswer];
      const body = {
        fields: {
          answers: toFs(
            newAnswers.map((a) => ({
              wordNumber: a.wordNumber,
              direction: a.direction,
              text: a.text,
              ...(a.answererNickname && {
                answererNickname: a.answererNickname,
              }),
              answeredAt: { __ts: a.answeredAt }, // marker
            })),
          ),
        },
      };

      // timestampValue 변환: __ts marker → timestampValue
      const fixTimestamps = (v: FsValue): FsValue => {
        if (typeof v === "object" && v !== null) {
          if ("mapValue" in v && v.mapValue?.fields) {
            const fields = v.mapValue.fields;
            for (const key of Object.keys(fields)) {
              const child = fields[key];
              if (
                typeof child === "object" &&
                child !== null &&
                "mapValue" in child &&
                child.mapValue?.fields?.__ts &&
                "stringValue" in child.mapValue.fields.__ts
              ) {
                fields[key] = {
                  timestampValue: (
                    child.mapValue.fields.__ts as { stringValue: string }
                  ).stringValue,
                };
              } else {
                fields[key] = fixTimestamps(child);
              }
            }
          }
          if ("arrayValue" in v && v.arrayValue?.values) {
            v.arrayValue.values = v.arrayValue.values.map(fixTimestamps);
          }
        }
        return v;
      };
      body.fields.answers = fixTimestamps(body.fields.answers);

      const res = await fetch(
        `${REST_BASE}/sos/${encodeURIComponent(token)}?updateMask.fieldPaths=answers`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      // 로컬 상태 업데이트 + UI 리셋
      setData({ ...data, answers: newAnswers });
      const wordKey = `${selected.number}-${selected.direction}`;
      setSelected(null);
      setInput("");
      // 즉시 피드백: 토스트 + 답안 추가된 단어 잠시 강조
      setToast(`✓ ${input.trim()} — 친구한테 알림이 갈 거예요!`);
      setRecentlyAnswered(wordKey);
      setTimeout(() => setToast(null), 3500);
      setTimeout(() => setRecentlyAnswered(null), 2500);
    } catch (e) {
      alert("전송 실패: " + String(e));
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 렌더

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/70">{error}</p>
        <a
          href={APP_STORE_URL}
          className="mt-6 text-sm underline text-white/60"
        >
          낱말퀴즈 받기
        </a>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-sm">불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-10 pb-16 max-w-md mx-auto">
      <SosHeader data={data} />
      <SosGrid
        data={data}
        selected={selected}
        onSelect={setSelected}
        onMultiWord={setDirPicker}
      />
      <SosWordList
        data={data}
        onSelect={setSelected}
        recentlyAnswered={recentlyAnswered}
      />
      <SosDownloadCTA />

      {toast && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[60] pointer-events-none animate-[fadeInUp_0.25s_ease-out]">
          <div className="bg-emerald-500 text-stone-900 font-bold px-5 py-3 rounded-full shadow-xl text-sm whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {selected && (
        <SosAnswerForm
          word={selected}
          input={input}
          setInput={setInput}
          nickname={nickname}
          setNickname={setNickname}
          existingAnswers={data.answers.filter(
            (a) =>
              a.wordNumber === selected.number &&
              a.direction === selected.direction,
          )}
          submitting={submitting}
          onSubmit={submit}
          onCancel={() => {
            setSelected(null);
            setInput("");
          }}
        />
      )}

      {dirPicker && (
        <SosDirectionPicker
          words={dirPicker}
          onPick={(w) => {
            setDirPicker(null);
            setSelected(w);
          }}
          onCancel={() => setDirPicker(null)}
        />
      )}
    </main>
  );
}

function SosDirectionPicker({
  words,
  onPick,
  onCancel,
}: {
  words: WordMeta[];
  onPick: (w: WordMeta) => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md bg-stone-900 rounded-t-2xl sm:rounded-2xl p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-white/60 text-center">
          어느 문제를 도와줄까요?
        </p>
        {words.map((w) => (
          <button
            key={`${w.number}-${w.direction}`}
            onClick={() => onPick(w)}
            className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 flex items-start gap-2"
          >
            <span className="shrink-0 text-xs font-mono mt-0.5">
              {w.direction === "across" ? "가로" : "세로"} {w.number}번
            </span>
            <span className="flex-1 text-sm">
              ({w.length}글자) {w.hint}
            </span>
          </button>
        ))}
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-lg bg-white/10 text-white/70 mt-1"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 서브 컴포넌트

function SosHeader({ data }: { data: SosDoc }) {
  const target = data.gridSnapshot.words.find(
    (w) =>
      w.number === data.gridSnapshot.targetWordNumber &&
      w.direction === data.gridSnapshot.targetDirection,
  );
  return (
    <header className="mb-6">
      <p className="text-xs text-white/40">🆘 친구의 SOS · 제 {data.stageId}면</p>
      <h1 className="mt-1 text-xl font-bold text-white">
        친구가 이 문제를 어려워해요
      </h1>
      {target && (
        <p className="mt-2 text-sm text-white/70">
          {target.direction === "across" ? "가로" : "세로"}{" "}
          {target.number}번 ({target.length}글자): {target.hint}
        </p>
      )}
    </header>
  );
}

function SosGrid({
  data,
  onSelect,
  onMultiWord,
}: {
  data: SosDoc;
  selected: WordMeta | null;
  onSelect: (w: WordMeta) => void;
  onMultiWord: (words: WordMeta[]) => void;
}) {
  const g = data.gridSnapshot;
  const isBlack = (r: number, c: number) =>
    g.blackCells.includes(`${r},${c}`);

  // 셀이 어느 단어에 속하는지 (단어 번호 라벨용)
  const cellLabels = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of g.words) {
      const key = `${w.startRow},${w.startCol}`;
      if (!m.has(key)) m.set(key, w.number);
    }
    return m;
  }, [g.words]);

  // target word의 셀 집합 (강조용)
  const targetCells = useMemo(() => {
    const target = g.words.find(
      (w) =>
        w.number === g.targetWordNumber && w.direction === g.targetDirection,
    );
    if (!target) return new Set<string>();
    const cells = new Set<string>();
    for (let i = 0; i < target.length; i++) {
      const r = target.startRow + (target.direction === "down" ? i : 0);
      const c = target.startCol + (target.direction === "across" ? i : 0);
      cells.add(`${r},${c}`);
    }
    return cells;
  }, [g]);

  const onCellTap = (r: number, c: number) => {
    if (isBlack(r, c)) return;
    // 이 셀을 포함하는 단어 중 미해결 우선
    const wordsAtCell = g.words.filter((w) => {
      for (let i = 0; i < w.length; i++) {
        const rr = w.startRow + (w.direction === "down" ? i : 0);
        const cc = w.startCol + (w.direction === "across" ? i : 0);
        if (rr === r && cc === c) return true;
      }
      return false;
    });
    if (!wordsAtCell.length) return;
    // 교차점(가로+세로 동시) 셀은 어느 단어를 답할지 모호 → 선택 시트.
    // 단일 단어 셀은 바로 선택.
    if (wordsAtCell.length === 1) {
      onSelect(wordsAtCell[0]);
    } else {
      onMultiWord(wordsAtCell);
    }
  };

  return (
    <div
      className="grid gap-[2px] mb-6 mx-auto bg-white/10 p-[2px] rounded"
      style={{
        gridTemplateColumns: `repeat(${g.gridSize}, 1fr)`,
        maxWidth: 360,
      }}
    >
      {Array.from({ length: g.gridSize }).map((_, r) =>
        Array.from({ length: g.gridSize }).map((__, c) => {
          const key = `${r},${c}`;
          const black = isBlack(r, c);
          const letter = g.solvedLetters[key];
          const label = cellLabels.get(key);
          const isTarget = targetCells.has(key);
          return (
            <button
              key={key}
              disabled={black}
              onClick={() => onCellTap(r, c)}
              className={`relative aspect-square text-sm font-bold flex items-center justify-center ${
                black
                  ? "bg-black"
                  : isTarget
                  ? "bg-amber-200 text-stone-900"
                  : "bg-stone-100 text-stone-900"
              }`}
            >
              {label !== undefined && (
                <span className="absolute top-0 left-0.5 text-[8px] font-normal text-stone-500">
                  {label}
                </span>
              )}
              {letter || ""}
            </button>
          );
        }),
      )}
    </div>
  );
}

function SosWordList({
  data,
  onSelect,
  recentlyAnswered,
}: {
  data: SosDoc;
  onSelect: (w: WordMeta) => void;
  recentlyAnswered: string | null;
}) {
  const g = data.gridSnapshot;
  const isWordSolved = (w: WordMeta) => {
    for (let i = 0; i < w.length; i++) {
      const r = w.startRow + (w.direction === "down" ? i : 0);
      const c = w.startCol + (w.direction === "across" ? i : 0);
      if (!g.solvedLetters[`${r},${c}`]) return false;
    }
    return true;
  };
  const isTarget = (w: WordMeta) =>
    w.number === g.targetWordNumber && w.direction === g.targetDirection;
  const answeredCount = (w: WordMeta) =>
    data.answers.filter(
      (a) => a.wordNumber === w.number && a.direction === w.direction,
    ).length;

  const across = g.words.filter((w) => w.direction === "across");
  const down = g.words.filter((w) => w.direction === "down");

  const renderRow = (w: WordMeta) => {
    const solved = isWordSolved(w);
    const ac = answeredCount(w);
    const target = isTarget(w);
    const wordKey = `${w.number}-${w.direction}`;
    const isRecent = recentlyAnswered === wordKey;
    return (
      <li key={wordKey}>
        <button
          onClick={() => !solved && onSelect(w)}
          disabled={solved}
          className={`w-full text-left p-3 rounded-lg flex items-start gap-2 transition-colors duration-300 ${
            solved
              ? "bg-white/[0.03] text-white/30"
              : isRecent
              ? "bg-emerald-500/25 text-white ring-2 ring-emerald-400"
              : target
              ? "bg-amber-500/15 text-white hover:bg-amber-500/25"
              : "bg-white/5 text-white/80 hover:bg-white/10"
          }`}
        >
          <span className="shrink-0 text-xs font-mono mt-0.5">
            {w.number}.
          </span>
          <span className="flex-1 text-sm">
            ({w.length}글자) {w.hint}
            {target && (
              <span className="ml-1 text-amber-400">🆘</span>
            )}
            {ac > 0 && !solved && (
              <span className="ml-1 text-emerald-400">· 답안 {ac}</span>
            )}
          </span>
        </button>
      </li>
    );
  };

  return (
    <section className="space-y-4 mb-8">
      <div>
        <h2 className="text-xs font-bold text-white/50 mb-2">가로</h2>
        <ul className="space-y-1">{across.map(renderRow)}</ul>
      </div>
      <div>
        <h2 className="text-xs font-bold text-white/50 mb-2">세로</h2>
        <ul className="space-y-1">{down.map(renderRow)}</ul>
      </div>
    </section>
  );
}

function SosAnswerForm({
  word,
  input,
  setInput,
  nickname,
  setNickname,
  existingAnswers,
  submitting,
  onSubmit,
  onCancel,
}: {
  word: WordMeta;
  input: string;
  setInput: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
  existingAnswers: SosAnswer[];
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md bg-stone-900 rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs text-white/50">
            {word.direction === "across" ? "가로" : "세로"} {word.number}번 ({word.length}글자)
          </p>
          <p className="mt-1 text-sm text-white/90">{word.hint}</p>
        </div>

        {existingAnswers.length > 0 && (
          <div className="bg-white/5 rounded-lg p-3 space-y-1">
            <p className="text-[10px] text-white/40">먼저 도착한 답안</p>
            {existingAnswers.map((a, i) => (
              <p key={i} className="text-sm text-white/70">
                · {a.text}
                {a.answererNickname && (
                  <span className="text-white/40 ml-1">— {a.answererNickname}</span>
                )}
              </p>
            ))}
          </div>
        )}

        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`정답 ${word.length}글자`}
          maxLength={word.length + 2}
          className="w-full bg-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="내 이름 (선택)"
          maxLength={10}
          className="w-full bg-white/5 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10"
        />

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-white/10 text-white/70"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !input.trim()}
            className="flex-1 py-3 rounded-lg bg-amber-500 text-stone-900 font-bold disabled:opacity-40"
          >
            {submitting ? "전송 중…" : "친구한테 보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SosDownloadCTA() {
  return (
    <section className="mt-10 pt-6 border-t border-white/10 text-center">
      <p className="text-sm text-white/60 mb-3">
        나도 이 게임 한 판?
      </p>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Image
          src="/badges/app-store-ko.svg"
          alt="App Store에서 받기"
          width={140}
          height={47}
        />
      </a>
    </section>
  );
}
