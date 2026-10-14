import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    // Dvě volání bez čekání simulují souběžné požadavky na inicializaci.
    await Promise.all([service.initialize(), service.initialize()]);

    // Další volání proběhne až po dokončení první inicializace.
    await service.initialize();

    // Všechna volání musí sdílet jedinou operaci načtení Preferences.
    expect(getMock).toHaveBeenCalledTimes(1);

    // Služba dokončila inicializaci a při value: null má prázdnou historii.
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // 1. Načtení uložených dat
  it('should load saved counters from preferences', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();

    expect(service.counters()).toEqual([first, second]);
    expect(getMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  // 2. Přidání záznamu
  it('should add a new counter and persist it', async () => {
    await service.add(first);

    expect(service.counters()).toEqual([first]);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([first]),
    });
  });

  // 3. Odstranění jednoho záznamu
  it('should remove a single counter by id and persist updated state', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });
    await service.initialize();

    await service.remove('first');

    expect(service.counters()).toEqual([second]);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  // 4. Vymazání historie
  it('should clear all history and remove storage key', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });
    await service.initialize();

    await service.clear();

    expect(service.counters()).toEqual([]);
    expect(removeMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  // 5. Poškozená uložená hodnota (invalidní JSON)
  it('should recover from invalid JSON in preferences', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await service.initialize();

    expect(service.counters()).toEqual([]);
    expect(service.initialized()).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith(
      'Historii počítadel se nepodařilo načíst.',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
  // zadani Načtení uložených dat – JSON obsahující pole SavedCounter se po initialize() objeví v counters().
//Přidání záznamu – add() vloží nový záznam na začátek a zavolá Preferences.set() se správným klíčem a JSON hodnotou.
//Odstranění jednoho záznamu – remove(id) odstraní pouze odpovídající objekt a nový stav uloží.
//Vymazání historie – clear() vyprázdní signal a zavolá Preferences.remove() pouze pro klíč saved-counters.
//Poškozená uložená hodnota – neplatný JSON nezpůsobí pád testu; služba nastaví prázdnou historii, dokončí inicializaci a zapíše chybu do konzole.

