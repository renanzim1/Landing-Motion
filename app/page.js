'use client';

import { useEffect, useMemo, useState } from 'react';

const effects = [
  ['none', 'Sem animação'],
  ['zoom', 'Zoom suave'],
  ['parallax', 'Parallax vertical'],
  ['float', 'Flutuação'],
  ['fade', 'Fade no scroll'],
  ['reveal', 'Revelação'],
  ['drift', 'Movimento contínuo'],
];

const names = [
  'Hero',
  'Dor',
  'Solução',
  'Benefícios',
  'Como funciona',
  'Prova / Autoridade',
  'Oferta',
  'CTA Final',
];

function Section({ s, i, onFile, onChange, onRemove }) {
  return (
    <div className="card">
      <div className="cardTop">
        <div>
          <b>{String(i + 1).padStart(2, '0')}</b>
          <span>{names[i]}</span>
        </div>

        {s.url && (
          <button
            className="ghost danger"
            onClick={() => onRemove(i)}
          >
            Remover
          </button>
        )}
      </div>

      <label className={'drop ' + (s.url ? 'has' : '')}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(i, e.target.files?.[0])}
        />

        {s.url ? (
          <img src={s.url} alt="prévia" />
        ) : (
          <>
            <strong>＋ Selecionar arte 9:16</strong>
            <small>PNG, JPG ou WebP</small>
          </>
        )}
      </label>

      <div className="controls">
        <label>
          Animação

          <select
            value={s.effect}
            onChange={(e) =>
              onChange(i, 'effect', e.target.value)
            }
          >
            {effects.map((x) => (
              <option key={x[0]} value={x[0]}>
                {x[1]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Velocidade <span>{s.speed}s</span>

          <input
            type="range"
            min="4"
            max="20"
            value={s.speed}
            onChange={(e) =>
              onChange(i, 'speed', e.target.value)
            }
          />
        </label>

        <label>
          Intensidade <span>{s.intensity}%</span>

          <input
            type="range"
            min="2"
            max="20"
            value={s.intensity}
            onChange={(e) =>
              onChange(i, 'intensity', e.target.value)
            }
          />
        </label>
      </div>
    </div>
  );
}

function Animated({ s, i }) {
  const st = {
    '--speed': `${s.speed}s`,
    '--power': `${s.intensity / 100}`,
  };

  return (
    <section
      className={`visual fx-${s.effect}`}
      style={st}
    >
      {s.url ? (
        <img src={s.url} alt={`Seção ${i + 1}`} />
      ) : (
        <div className="empty">
          SEÇÃO {i + 1}
          <small>{names[i]}</small>
        </div>
      )}
    </section>
  );
}

export default function Page() {
  const fresh = () =>
    Array.from({ length: 8 }, () => ({
      url: '',
      effect: 'none',
      speed: 10,
      intensity: 8,
    }));

  const [sections, setSections] = useState(fresh);
  const [preview, setPreview] = useState(false);

  const filled = useMemo(
    () => sections.filter((s) => s.url).length,
    [sections]
  );

  useEffect(
    () => () =>
      sections.forEach(
        (s) => s.url && URL.revokeObjectURL(s.url)
      ),
    []
  );

  function file(i, f) {
    if (!f) return;

    setSections((a) =>
      a.map((s, n) =>
        n === i
          ? { ...s, url: URL.createObjectURL(f) }
          : s
      )
    );
  }

  function change(i, k, v) {
    setSections((a) =>
      a.map((s, n) =>
        n === i ? { ...s, [k]: v } : s
      )
    );
  }

  function remove(i) {
    setSections((a) =>
      a.map((s, n) =>
        n === i ? { ...s, url: '' } : s
      )
    );
  }

  if (preview)
    return (
      <main className="previewPage">
        <div className="previewBar">
          <button onClick={() => setPreview(false)}>
            ← Editor
          </button>

          <span>Preview • {filled}/8 artes</span>
        </div>

        <div className="phone">
          {sections.map((s, i) => (
            <Animated key={i} s={s} i={i} />
          ))}
        </div>
      </main>
    );

  return (
    <main>
      <header>
        <div>
          <div className="brand">
            LANDING <i>MOTION</i>
          </div>

          <p>
            Transforme suas artes em uma landing page
            visual com movimento.
          </p>
        </div>

        <button
          className="primary"
          disabled={!filled}
          onClick={() => setPreview(true)}
        >
          Visualizar landing →
        </button>
      </header>

      <div className="status">
        <span>{filled}/8 artes adicionadas</span>

        <div>
          <i
            style={{
              width: `${(filled / 8) * 100}%`,
            }}
          />
        </div>
      </div>

      <section className="grid">
        {sections.map((s, i) => (
          <Section
            key={i}
            s={s}
            i={i}
            onFile={file}
            onChange={change}
            onRemove={remove}
          />
        ))}
      </section>

      <footer>
        V1 • Mobile 9:16 • As artes são exibidas sem
        espaço entre as seções.
      </footer>
    </main>
  );
             }
