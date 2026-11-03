import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './main';

describe('интерфейс', () => {
  it('рендерится без ошибок и показывает основные разделы', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Price Hunter');
    expect(html).toContain('Находки');
    expect(html).toContain('Наблюдение');
    expect(html).toContain('Источники');
  });
});
