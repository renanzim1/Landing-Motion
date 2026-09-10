'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || s.effect !== 'parallax') return;

    let frame;

    const update = () => {
      if (!ref.current) return;

      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const p = Math.max(
        0,
        Math.min(1, (vh - r.top) / (vh + r.height))
      );

      setProgress(p);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [visible, s.effect]);

  const style = {
    '--speed': `${s.speed}s`,
    '--power': s.intensity / 100,
    '--scroll': progress,
  };

  return (
    <section
      ref={ref}
      className={`visual fx-${s.effect} ${
        visible ? 'is-visible' : ''
      }`}
      style={style}
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

  const urlsRef = useRef([]);

  const filled = useMemo(
    () => sections.filter((s) => s.url).length,
    [sections]
  );

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);

  function file(i, f) {
    if (!f) return;

    const url = URL.createObjectURL(f);
    urlsRef.current.push(url);

    setSections((a) =>
      a.map((s, n) => {
        if (n !== i) return s;

        if (s.url) URL.revokeObjectURL(s.url);

        return { ...s, url };
      })
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
      a.map((s, n) => {
        if (n !== i) return s;

        if (s.url) URL.revokeObjectURL(s.url);

        return { ...s, url: '' };
      })
    );
  }

  if (preview) {
    return (
      <main className="previewPage">
        <div className="previewBar">
          <button onClick={() => setPreview(false)}>
            ← Editor
          </button>

          <span>Preview V2 • {filled}/8 artes</span>
        </div>

        <div className="phone">
          {sections.map((s, i) => (
            <Animated key={i} s={s} i={i} />
          ))}
        </div>
      </main>
    );
  }

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
        V2 • Mobile 9:16 • Scroll real + transições contínuas.
      </footer>
    </main>
  );
}
