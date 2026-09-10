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

function Upload({ label, url, onFile }) {
  return (
    <label className={'layerUpload ' + (url ? 'hasLayer' : '')}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {url ? (
        <img src={url} alt={label} />
      ) : (
        <>
          <strong>＋ {label}</strong>
          <small>PNG transparente recomendado</small>
        </>
      )}
    </label>
  );
}

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
            onChange={(e) => onChange(i, 'effect', e.target.value)}
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
            onChange={(e) => onChange(i, 'speed', e.target.value)}
          />
        </label>

        <label>
          Intensidade <span>{s.intensity}%</span>
          <input
            type="range"
            min="2"
            max="20"
            value={s.intensity}
            onChange={(e) => onChange(i, 'intensity', e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function NormalAnimated({ s, i }) {
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

      setProgress(
        Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)))
      );
    };

    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
    };
  }, [visible, s.effect]);

  return (
    <section
      ref={ref}
      className={`visual fx-${s.effect} ${
        visible ? 'is-visible' : ''
      }`}
      style={{
        '--speed': `${s.speed}s`,
        '--power': s.intensity / 100,
        '--scroll': progress,
      }}
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

function LayerHero({ layers }) {
  return (
    <section className="visual layerHero">
      {layers.background ? (
        <img
          className="heroBackground"
          src={layers.background}
          alt=""
        />
      ) : (
        <div className="empty">
          HERO EM CAMADAS
          <small>Adicione fundo, personagem e placa</small>
        </div>
      )}

      {layers.person && (
        <div className="personMotion">
          <img
            className="heroPerson"
            src={layers.person}
            alt=""
          />

          {layers.sign && (
            <div className="signMotion">
              <img
                className="heroSign"
                src={layers.sign}
                alt=""
              />
            </div>
          )}
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
  const [layerMode, setLayerMode] = useState(false);

  const [layers, setLayers] = useState({
    background: '',
    person: '',
    sign: '',
  });

  const urls = useRef([]);

  const filled = useMemo(
    () => sections.filter((s) => s.url).length,
    [sections]
  );

  useEffect(() => {
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function makeURL(file) {
    if (!file) return '';
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    return url;
  }

  function setLayer(name, file) {
    if (!file) return;

    setLayers((old) => ({
      ...old,
      [name]: makeURL(file),
    }));
  }

  function file(i, f) {
    if (!f) return;

    const url = makeURL(f);

    setSections((old) =>
      old.map((s, n) =>
        n === i ? { ...s, url } : s
      )
    );
  }

  function change(i, key, value) {
    setSections((old) =>
      old.map((s, n) =>
        n === i ? { ...s, [key]: value } : s
      )
    );
  }

  function remove(i) {
    setSections((old) =>
      old.map((s, n) =>
        n === i ? { ...s, url: '' } : s
      )
    );
  }

  const heroReady =
    layerMode &&
    (layers.background || layers.person || layers.sign);

  if (preview) {
    return (
      <main className="previewPage">
        <div className="previewBar">
          <button onClick={() => setPreview(false)}>
            ← Editor
          </button>

          <span>Preview V3 • Motion Layers</span>
        </div>

        <div className="phone">
          {heroReady ? (
            <LayerHero layers={layers} />
          ) : (
            <NormalAnimated s={sections[0]} i={0} />
          )}

          {sections.slice(1).map((s, index) => (
            <NormalAnimated
              key={index + 1}
              s={s}
              i={index + 1}
            />
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
            Landing pages visuais com movimento por camadas.
          </p>
        </div>

        <button
          className="primary"
          disabled={!filled && !heroReady}
          onClick={() => setPreview(true)}
        >
          Visualizar landing →
        </button>
      </header>

      <div className="layerPanel">
        <div className="layerTitle">
          <div>
            <b>V3 • MOTION LAYERS</b>
            <h2>Hero animada por camadas</h2>
            <p>
              Separe fundo, personagem e texto/placa.
            </p>
          </div>

          <button
            className={`modeButton ${
              layerMode ? 'active' : ''
            }`}
            onClick={() => setLayerMode(!layerMode)}
          >
            {layerMode
              ? '✓ Camadas ativadas'
              : 'Ativar camadas'}
          </button>
        </div>

        {layerMode && (
          <div className="layerGrid">
            <Upload
              label="Fundo"
              url={layers.background}
              onFile={(f) => setLayer('background', f)}
            />

            <Upload
              label="Personagem"
              url={layers.person}
              onFile={(f) => setLayer('person', f)}
            />

            <Upload
              label="Texto / placa"
              url={layers.sign}
              onFile={(f) => setLayer('sign', f)}
            />
          </div>
        )}
      </div>

      <div className="status">
        <span>{filled}/8 artes adicionadas</span>
        <div>
          <i style={{ width: `${(filled / 8) * 100}%` }} />
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
        V3 • Motion Layers • Fundo + personagem + elemento
      </footer>
    </main>
  );
                  }
