import { AssignmentColorPalette, defaultPaletteForCustomRole } from './assignmentColorPalettes';
import { getLocalStorage, localStorageKey, setLocalStorage } from './localStorage';

const STORAGE_KEY = 'customRoleColors';

type CustomRoleColorMap = Record<string, AssignmentColorPalette>;

const readMap = (): CustomRoleColorMap => {
  const raw = getLocalStorage(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as CustomRoleColorMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeMap = (map: CustomRoleColorMap) => {
  setLocalStorage(STORAGE_KEY, JSON.stringify(map));
};

/** Client-side color preference for a custom role (localStorage only). */
export const getCustomRoleColorPalette = (roleId: string): AssignmentColorPalette => {
  const map = readMap();
  return map[roleId] ?? defaultPaletteForCustomRole(roleId);
};

export const setCustomRoleColorPalette = (roleId: string, palette: AssignmentColorPalette) => {
  const map = readMap();
  map[roleId] = palette;
  writeMap(map);
};

export const getAllCustomRoleColorPreferences = (): CustomRoleColorMap => readMap();

export const clearCustomRoleColorPalette = (roleId: string) => {
  const map = readMap();
  delete map[roleId];
  writeMap(map);
};

export const customRoleColorStorageKey = () => localStorageKey(STORAGE_KEY);
