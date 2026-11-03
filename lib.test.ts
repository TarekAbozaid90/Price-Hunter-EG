import { describe, expect, it } from 'vitest';
import type { Offer } from './types';
import { price, safeLink, stale, validateData, normalizeText, searchMatches, stores, categories } from './lib';
import empty from '../public/data/catalog.json';
describe('public data safeguards', () => {
  it('preserves unknown amounts and rejects untrusted links', () => { expect(price(null)).toBe('Неизвестно'); expect(safeLink('javascript:alert(1)')).toBeUndefined(); expect(safeLink('https://kaspi.kz.evil.example/a')).toBeUndefined(); expect(safeLink('https://user:pass@kaspi.kz/a')).toBeUndefined(); expect(safeLink('https://www.technodom.kz/astana/p/a')).toBeTruthy(); });
  it('reports never-run and old snapshots as stale', () => { expect(stale(validateData({ ...empty, last_success: null }))).toBe(true); expect(stale(validateData({ ...empty, last_success: '2025-01-01T00:00:00Z' }))).toBe(true); });
  it('rejects corrupted data rather than silently showing a false empty result', () => { expect(() => validateData({ ...empty, offers: null })).toThrow(); expect(() => validateData({ ...empty, currency: 'RUB' })).toThrow(); });
});

describe('search', () => {
  const offer = { ...empty.offers[0], name: 'Стиральная машина Samsung WW60', sku: '292523', brand: 'Samsung',
                  model: 'WW60AK4S00C', shop: 'technodom', category: 'appliances' } as unknown as Offer;
  const tokens = (text: string) => normalizeText(text).split(' ').filter(Boolean);
  it('finds by name, sku, brand, model, shop and category', () => {
    expect(searchMatches(offer, tokens('samsung'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('МАШИНА'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('292523'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('WW60AK4S00C'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('technodom'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('бытовая техника'), stores, categories)).toBe(true);
  });
  it('treats ё and е as the same letter and ignores punctuation', () => {
    expect(normalizeText('  Стиральная машина, ёлка!!! ')).toBe('стиральная машина елка');
    expect(searchMatches({ ...offer, name: 'Телевизор LG OLED' }, tokens('телевизор oled'), stores, categories)).toBe(true);
  });
  it('requires every word of the query to match', () => {
    expect(searchMatches(offer, tokens('samsung 292523'), stores, categories)).toBe(true);
    expect(searchMatches(offer, tokens('samsung asus'), stores, categories)).toBe(false);
  });
  it('keeps every offer when the query is empty', () => {
    expect(searchMatches(offer, [], stores, categories)).toBe(true);
  });
});
