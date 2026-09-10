'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

function Upload({
  label,
  url,
  onFile,
  transparent = true,
}) {
  return (
    <label
      className={
        'layerUpload ' +
        (url ? 'hasLayer' : '')
      }
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const selected =
            e.target.files?.[0];

          if (selected) {
            onFile(selected);
          }
        }}
      />

      {url ? (
        <img src={url} alt={label} />
      ) : (
        <>
          <strong>＋ {label}</strong>

          <small>
            {transparent
              ? 'PNG transparente recomendado'
              : 'PNG, JPG ou WebP'}
          </small>
        </>
      )}
    </label>
  );
}

function Slider({
  title,
  value,
  min,
  max,
  onChange,
  suffix = '%',
}) {
  return (
    <label className="motionSlider">
      <div>
        <span>{title}</span>

        <b>
          {value}
          {suffix}
        </b>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(
            Number(e.target.value)
          )
        }
      />
    </label>
  );
}

function Section({
  s,
  i,
  onFile,
  onChange,
  onRemove,
}) {
  return (
    <div className="card">
      <div className="cardTop">
        <div>
          <b>
            {String(i + 1).padStart(
              2,
              '0'
            )}
          </b>

          <span>{names[i]}</span>
        </div>

        {s.url && (
          <button
            className="ghost danger"
            onClick={() =>
              onRemove(i)
            }
          >
            Remover
          </button>
        )}
      </div>

      <label
        className={
          'drop ' +
          (s.url ? 'has' : '')
        }
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const selected =
              e.target.files?.[0];

            if (selected) {
              onFile(i, selected);
            }
          }}
        />

        {s.url ? (
          <img
            src={s.url}
            alt="prévia"
          />
        ) : (
          <>
            <strong>
              ＋ Selecionar arte 9:16
            </strong>

            <small>
              PNG, JPG ou WebP
            </small>
          </>
        )}
      </label>

      <div className="controls">
        <label>
          Animação

          <select
            value={s.effect}
            onChange={(e) =>
              onChange(
                i,
                'effect',
                e.target.value
              )
            }
          >
            {effects.map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Velocidade{' '}
          <span>{s.speed}s</span>

          <input
            type="range"
            min="4"
            max="20"
            value={s.speed}
            onChange={(e) =>
              onChange(
                i,
                'speed',
                Number(
                  e.target.value
                )
              )
            }
          />
        </label>

        <label>
          Intensidade{' '}
          <span>
            {s.intensity}%
          </span>

          <input
            type="range"
            min="2"
            max="20"
            value={s.intensity}
            onChange={(e) =>
              onChange(
                i,
                'intensity',
                Number(
                  e.target.value
                )
              )
            }
          />
        </label>
      </div>
    </div>
  );
}

function NormalAnimated({
  s,
  i,
}) {
  const ref = useRef(null);

  const [visible, setVisible] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setVisible(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.12,
        }
      );

    observer.observe(el);

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !visible ||
      s.effect !== 'parallax'
    ) {
      return;
    }

    let frame;

    const update = () => {
      if (!ref.current) return;

      const rect =
        ref.current.getBoundingClientRect();

      const vh =
        window.innerHeight;

      const next = Math.max(
        0,
        Math.min(
          1,
          (vh - rect.top) /
            (vh + rect.height)
        )
      );

      setProgress(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(
        frame
      );

      frame =
        requestAnimationFrame(
          update
        );
    };

    update();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );

      cancelAnimationFrame(
        frame
      );
    };
  }, [visible, s.effect]);

  return (
    <section
      ref={ref}
      className={
        `visual fx-${s.effect} ` +
        (visible
          ? 'is-visible'
          : '')
      }
      style={{
        '--speed': `${s.speed}s`,
        '--power':
          s.intensity / 100,
        '--scroll': progress,
      }}
    >
      {s.url ? (
        <img
          src={s.url}
          alt={`Seção ${i + 1}`}
        />
      ) : (
        <div className="empty">
          SEÇÃO {i + 1}

          <small>
            {names[i]}
          </small>
        </div>
      )}
    </section>
  );
}

function LayerHero({
  layers,
  person,
  sign,
  generatedMotion,
  replayKey,
}) {
  const handX =
    generatedMotion.hand ===
    'left'
      ? person.x - 14
      : person.x + 14;

  const handY =
    person.y + 6;

  return (
    <section className="visual layerHero">
      {layers.background ? (
        <img
          className="heroBackground"
          src={
            layers.background
          }
          alt=""
        />
      ) : layers.original ? (
        <img
          className="heroBackground"
          src={layers.original}
          alt=""
        />
      ) : (
        <div className="empty">
          HERO MOTION

          <small>
            Adicione o fundo
          </small>
        </div>
      )}

      {layers.person && (
        <div
          className="personPosition"
          style={{
            left: `${person.x}%`,
            top: `${person.y}%`,
            width: `${person.size}%`,
          }}
        >
          <div
            className={
              generatedMotion.personClass ||
              'personMotion'
            }
          >
            <img
              className="heroPerson"
              src={layers.person}
              alt=""
            />
          </div>
        </div>
      )}

      {layers.sign && (
        <div
          key={replayKey}
          className={
            `signPosition ` +
            (generatedMotion.className ||
              '')
          }
          style={{
            left: `${sign.x}%`,
            top: `${sign.y}%`,
            width: `${sign.size}%`,

            '--final-x':
              `${sign.x}%`,

            '--final-y':
              `${sign.y}%`,

            '--hand-x':
              `${handX}%`,

            '--hand-y':
              `${handY}%`,

            '--motion-duration':
              `${generatedMotion.duration}s`,
          }}
        >
          <div className="signMotion">
            <img
              className="heroSign"
              src={layers.sign}
              alt=""
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default function Page() {
  const fresh = () =>
    Array.from(
      { length: 8 },
      () => ({
        url: '',
        effect: 'none',
        speed: 10,
        intensity: 8,
      })
    );

  const [
    sections,
    setSections,
  ] = useState(fresh);

  const [
    preview,
    setPreview,
  ] = useState(false);

  const [
    layerMode,
    setLayerMode,
  ] = useState(false);

  const [
    layers,
    setLayers,
  ] = useState({
    original: '',
    background: '',
    person: '',
    sign: '',
  });

  const [
    person,
    setPerson,
  ] = useState({
    x: 50,
    y: 50,
    size: 100,
  });

  const [
    sign,
    setSign,
  ] = useState({
    x: 68,
    y: 48,
    size: 42,
  });

  const [
    motionPrompt,
    setMotionPrompt,
  ] = useState('');

  const [
    motionMessage,
    setMotionMessage,
  ] = useState('');

  const [
    replayKey,
    setReplayKey,
  ] = useState(0);

  const [
    generatedMotion,
    setGeneratedMotion,
  ] = useState({
    type: 'none',
    className: '',
    personClass:
      'personMotion',
    hand: 'right',
    duration: 4,
  });

  const urls =
    useRef([]);

  const filled = useMemo(
    () =>
      sections.filter(
        (s) => s.url
      ).length,
    [sections]
  );

  const heroReady =
    layerMode &&
    Boolean(
      layers.original ||
        layers.background ||
        layers.person ||
        layers.sign
    );

  useEffect(() => {
    return () => {
      urls.current.forEach(
        (url) => {
          URL.revokeObjectURL(
            url
          );
        }
      );
    };
  }, []);

  function makeURL(file) {
    if (!file) return '';

    const url =
      URL.createObjectURL(
        file
      );

    urls.current.push(url);

    return url;
  }

  function setLayer(
    name,
    file
  ) {
    if (!file) return;

    const url =
      makeURL(file);

    setLayers((old) => ({
      ...old,
      [name]: url,
    }));
  }

  function file(i, f) {
    if (!f) return;

    const url =
      makeURL(f);

    setSections((old) =>
      old.map((s, n) =>
        n === i
          ? {
              ...s,
              url,
            }
          : s
      )
    );
  }

  function change(
    i,
    key,
    value
  ) {
    setSections((old) =>
      old.map((s, n) =>
        n === i
          ? {
              ...s,
              [key]: value,
            }
          : s
      )
    );
  }

  function remove(i) {
    setSections((old) =>
      old.map((s, n) =>
        n === i
          ? {
              ...s,
              url: '',
            }
          : s
      )
    );
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  function generateMotion() {
    const text =
      normalize(
        motionPrompt
      );

    if (!text.trim()) {
      setMotionMessage(
        'Escreva o movimento que você quer.'
      );

      return;
    }

    let next = {
      type: 'none',
      className: '',
      personClass:
        'personMotion',
      hand: 'right',
      duration: 4,
    };

    if (
      text.includes(
        'mao esquerda'
      )
    ) {
      next.hand = 'left';
    }

    if (
      text.includes(
        'mao direita'
      )
    ) {
      next.hand = 'right';
    }

    if (
      text.includes('pega') ||
      text.includes('segura') ||
      text.includes('mao') ||
      text.includes(
        'coloca no lugar'
      )
    ) {
      next = {
        ...next,
        type: 'hold',
        className:
          'motionHoldToPlace',
        personClass:
          'personMotionAlive',
        duration: 4.2,
      };

      setMotionMessage(
        '✓ Movimento criado: objeto vai para a mão, fica segurado e depois vai para a posição final.'
      );
    } else if (
      text.includes(
        'entra pela esquerda'
      ) ||
      text.includes(
        'vem da esquerda'
      )
    ) {
      next = {
        ...next,
        type: 'left',
        className:
          'motionEnterLeft',
        duration: 2.2,
      };

      setMotionMessage(
        '✓ Movimento criado: entrada pela esquerda.'
      );
    } else if (
      text.includes(
        'entra pela direita'
      ) ||
      text.includes(
        'vem da direita'
      )
    ) {
      next = {
        ...next,
        type: 'right',
        className:
          'motionEnterRight',
        duration: 2.2,
      };

      setMotionMessage(
        '✓ Movimento criado: entrada pela direita.'
      );
    } else if (
      text.includes('cai') ||
      text.includes(
        'cair'
      ) ||
      text.includes(
        'vem de cima'
      )
    ) {
      next = {
        ...next,
        type: 'fall',
        className:
          'motionFall',
        duration: 2.3,
      };

      setMotionMessage(
        '✓ Movimento criado: objeto cai e encaixa.'
      );
    } else if (
      text.includes('sobe') ||
      text.includes(
        'vem de baixo'
      )
    ) {
      next = {
        ...next,
        type: 'rise',
        className:
          'motionRise',
        duration: 2.3,
      };

      setMotionMessage(
        '✓ Movimento criado: objeto sobe e encaixa.'
      );
    } else if (
      text.includes('gira') ||
      text.includes(
        'rodopia'
      )
    ) {
      next = {
        ...next,
        type: 'spin',
        className:
          'motionSpin',
        duration: 2.4,
      };

      setMotionMessage(
        '✓ Movimento criado: giro com encaixe.'
      );
    } else if (
      text.includes(
        'flutua'
      ) ||
      text.includes(
        'flutuando'
      )
    ) {
      next = {
        ...next,
        type: 'float',
        className:
          'motionFloatPrompt',
        duration: 4,
      };

      setMotionMessage(
        '✓ Movimento criado: flutuação contínua.'
      );
    } else if (
      text.includes(
        'aparece'
      ) ||
      text.includes(
        'surge'
      )
    ) {
      next = {
        ...next,
        type: 'appear',
        className:
          'motionAppear',
        duration: 1.8,
      };

      setMotionMessage(
        '✓ Movimento criado: aparição suave.'
      );
    } else {
      next = {
        ...next,
        type: 'soft',
        className:
          'motionSoft',
        duration: 3,
      };

      setMotionMessage(
        '✓ Interpretei como um movimento suave.'
      );
    }

    setGeneratedMotion(
      next
    );

    setReplayKey(
      (old) => old + 1
    );
  }

  function resetMotion() {
    setPerson({
      x: 50,
      y: 50,
      size: 100,
    });

    setSign({
      x: 68,
      y: 48,
      size: 42,
    });

    setGeneratedMotion({
      type: 'none',
      className: '',
      personClass:
        'personMotion',
      hand: 'right',
      duration: 4,
    });

    setMotionPrompt('');

    setMotionMessage('');
  }

  if (preview) {
    return (
      <main className="previewPage">
        <div className="previewBar">
          <button
            onClick={() =>
              setPreview(false)
            }
          >
            ← Editor
          </button>

          <span>
            Preview • Prompt
            Motion
          </span>
        </div>

        <div className="phone">
          {heroReady ? (
            <LayerHero
              layers={layers}
              person={person}
              sign={sign}
              generatedMotion={
                generatedMotion
              }
              replayKey={
                replayKey
              }
            />
          ) : (
            <NormalAnimated
              s={sections[0]}
              i={0}
            />
          )}

          {sections
            .slice(1)
            .map(
              (
                s,
                index
              ) => (
                <NormalAnimated
                  key={
                    index + 1
                  }
                  s={s}
                  i={
                    index + 1
                  }
                />
              )
            )}
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <div>
          <div className="brand">
            LANDING{' '}
            <i>MOTION</i>
          </div>

          <p>
            Crie movimentos
            usando comandos em
            texto.
          </p>
        </div>

        <button
          className="primary"
          disabled={
            !filled &&
            !heroReady
          }
          onClick={() =>
            setPreview(true)
          }
        >
          Visualizar landing →
        </button>
      </header>

      <div className="layerPanel">
        <div className="layerTitle">
          <div>
            <b>
              PROMPT MOTION
            </b>

            <h2>
              Hero animada
            </h2>

            <p>
              Suba as camadas em
              PNG e descreva o
              movimento.
            </p>
          </div>

          <button
            className={
              `modeButton ` +
              (layerMode
                ? 'active'
                : '')
            }
            onClick={() =>
              setLayerMode(
                !layerMode
              )
            }
          >
            {layerMode
              ? '✓ Camadas ativadas'
              : 'Ativar camadas'}
          </button>
        </div>

        {layerMode && (
          <>
            <div className="layerDivider">
              <span>
                CAMADAS
              </span>
            </div>

            <div className="layerGrid">
              <Upload
                label="Fundo"
                url={
                  layers.background
                }
                transparent={
                  false
                }
                onFile={(f) =>
                  setLayer(
                    'background',
                    f
                  )
                }
              />

              <Upload
                label="Personagem"
                url={
                  layers.person
                }
                onFile={(f) =>
                  setLayer(
                    'person',
                    f
                  )
                }
              />

              <Upload
                label="Texto / objeto"
                url={
                  layers.sign
                }
                onFile={(f) =>
                  setLayer(
                    'sign',
                    f
                  )
                }
              />
            </div>

            <div className="promptMotionBox">
              <b>
                ✨ DESCREVA O
                MOVIMENTO
              </b>

              <h3>
                O que deve
                acontecer?
              </h3>

              <textarea
                value={
                  motionPrompt
                }
                onChange={(e) =>
                  setMotionPrompt(
                    e.target.value
                  )
                }
                placeholder="Exemplo: Ela pega o texto na mão direita, segura por um instante e coloca no lugar."
              />

              <button
                className="generateMotionButton"
                disabled={
                  !motionPrompt.trim() ||
                  !layers.sign
                }
                onClick={
                  generateMotion
                }
              >
                ✨ Gerar movimento
              </button>

              {motionMessage && (
                <p className="motionResult">
                  {
                    motionMessage
                  }
                </p>
              )}

              {generatedMotion.type !==
                'none' && (
                <button
                  className="replayButton"
                  onClick={() =>
                    setReplayKey(
                      (old) =>
                        old + 1
                    )
                  }
                >
                  ↻ Repetir
                  animação
                </button>
              )}
            </div>

            <div className="motionEditor">
              <div className="motionEditorTitle">
                <div>
                  <b>
                    AJUSTE OPCIONAL
                  </b>

                  <h3>
                    Posição final
                  </h3>
                </div>

                <button
                  className="ghost"
                  onClick={
                    resetMotion
                  }
                >
                  Restaurar
                </button>
              </div>

              {layers.person && (
                <div className="motionGroup">
                  <strong>
                    👤 Personagem
                  </strong>

                  <Slider
                    title="Horizontal"
                    value={
                      person.x
                    }
                    min={0}
                    max={100}
                    onChange={(x) =>
                      setPerson(
                        (old) => ({
                          ...old,
                          x,
                        })
                      )
                    }
                  />

                  <Slider
                    title="Vertical"
                    value={
                      person.y
                    }
                    min={0}
                    max={100}
                    onChange={(y) =>
                      setPerson(
                        (old) => ({
                          ...old,
                          y,
                        })
                      )
                    }
                  />

                  <Slider
                    title="Tamanho"
                    value={
                      person.size
                    }
                    min={30}
                    max={180}
                    onChange={(
                      size
                    ) =>
                      setPerson(
                        (old) => ({
                          ...old,
                          size,
                        })
                      )
                    }
                  />
                </div>
              )}

              {layers.sign && (
                <div className="motionGroup">
                  <strong>
                    💬 Texto /
                    objeto
                  </strong>

                  <Slider
                    title="Horizontal final"
                    value={
                      sign.x
                    }
                    min={0}
                    max={100}
                    onChange={(x) =>
                      setSign(
                        (old) => ({
                          ...old,
                          x,
                        })
                      )
                    }
                  />

                  <Slider
                    title="Vertical final"
                    value={
                      sign.y
                    }
                    min={0}
                    max={100}
                    onChange={(y) =>
                      setSign(
                        (old) => ({
                          ...old,
                          y,
                        })
                      )
                    }
                  />

                  <Slider
                    title="Tamanho"
                    value={
                      sign.size
                    }
                    min={10}
                    max={100}
                    onChange={(
                      size
                    ) =>
                      setSign(
                        (old) => ({
                          ...old,
                          size,
                        })
                      )
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="status">
        <span>
          {filled}/8 artes
          adicionadas
        </span>

        <div>
          <i
            style={{
              width:
                `${
                  (filled / 8) *
                  100
                }%`,
            }}
          />
        </div>
      </div>

      <section className="grid">
        {sections.map(
          (s, i) => (
            <Section
              key={i}
              s={s}
              i={i}
              onFile={file}
              onChange={
                change
              }
              onRemove={
                remove
              }
            />
          )
        )}
      </section>

      <footer>
        Prompt Motion •
        Animação por camadas
      </footer>
    </main>
  );
}
