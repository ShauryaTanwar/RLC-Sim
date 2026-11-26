import { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

export const colors = { blue: '#83cfff', orange: '#ffb573', green: '#7be7bf', grid: '#28363e', text: '#a4b6bf' };
export const baseLayout = {
  autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'Segoe UI, sans-serif', size: 13, color: colors.text },
  margin: { l: 50, r: 18, t: 16, b: 45 }, showlegend: false,
  hovermode: 'x unified', hoverlabel: { bgcolor: '#1b2b33', bordercolor: '#425860', font: { size: 13, color: '#e8f0f3' } },
};
export const axis = { gridcolor: colors.grid, zerolinecolor: '#42545d', tickfont: { size: 12 }, title: { font: { size: 13 } }, automargin: true, fixedrange: false };

export default function Plot({ data, layout, onHover, onClick, ariaLabel, className = '' }) {
  const ref = useRef(null);
  const callbacks = useRef({ onHover, onClick });
  const rendering = useRef(Promise.resolve());
  const [renderError, setRenderError] = useState(null);
  callbacks.current = { onHover, onClick };
  useEffect(() => {
    const element = ref.current;
    const observer = new ResizeObserver(() => { if (element._fullLayout) Plotly.Plots.resize(element); });
    observer.observe(element);
    return () => { observer.disconnect(); rendering.current = rendering.current.catch(() => {}).then(() => Plotly.purge(element)); };
  }, []);
  useEffect(() => {
    const element = ref.current;
    let cancelled = false;
    // Serialize updates and cleanup, including React StrictMode's mount cycle.
    rendering.current = rendering.current.catch(() => {}).then(async () => {
      if (cancelled) return;
      await Plotly.react(element, data, { ...baseLayout, ...layout }, { responsive: true, displayModeBar: false, scrollZoom: false, displaylogo: false });
      element.removeAllListeners('plotly_hover');
      element.removeAllListeners('plotly_click');
      element.on('plotly_hover', e => callbacks.current.onHover?.(e));
      element.on('plotly_click', e => callbacks.current.onClick?.(e));
      if (!cancelled) setRenderError(null);
    }).catch(error => {
      if (!cancelled) setRenderError(error.message || 'Rendering failed');
    });
    return () => { cancelled = true; };
  }, [data, layout]);
  return <div className="plot-frame"><div ref={ref} className={`plot ${className}`} role="img" aria-label={ariaLabel}/>{renderError && <div className="plot-error" role="alert">This instrument could not render: {renderError}. Reload the page to try again.</div>}</div>;
}
