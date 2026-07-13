import { useCallback, useSyncExternalStore } from 'react';
import { AssignmentColorPalette, getPaletteColorClasses } from '@/lib/assignmentColorPalettes';
import { AssignmentColorClasses, getAssignmentColorClasses } from '@/lib/colors';
import {
  customRoleColorStorageKey,
  getAllCustomRoleColorPreferences,
  getCustomRoleColorPalette,
  setCustomRoleColorPalette,
} from '@/lib/customRoleColorPreferences';
import { isCustomRoleAssignmentCode } from '@/lib/customRoles';
import { useWCIF } from '@/providers/WCIFProvider';

const subscribeToCustomRoleColors = (onStoreChange: () => void) => {
  const handler = (event: StorageEvent) => {
    if (event.key === customRoleColorStorageKey()) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handler);
  window.addEventListener('customRoleColorsChanged', onStoreChange);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('customRoleColorsChanged', onStoreChange);
  };
};

let cachedSnapshotJson = '';
let cachedSnapshot = getAllCustomRoleColorPreferences();

const getCustomRoleColorSnapshot = () => {
  const next = getAllCustomRoleColorPreferences();
  const nextJson = JSON.stringify(next);

  if (nextJson !== cachedSnapshotJson) {
    cachedSnapshotJson = nextJson;
    cachedSnapshot = next;
  }

  return cachedSnapshot;
};

export const useCustomRoleColorPreferences = () => {
  const preferences = useSyncExternalStore(
    subscribeToCustomRoleColors,
    getCustomRoleColorSnapshot,
    getCustomRoleColorSnapshot,
  );

  const setColor = useCallback((roleId: string, palette: AssignmentColorPalette) => {
    setCustomRoleColorPalette(roleId, palette);
    window.dispatchEvent(new Event('customRoleColorsChanged'));
  }, []);

  const getColor = useCallback((roleId: string) => {
    return getCustomRoleColorPalette(roleId);
  }, []);

  return { preferences, setColor, getColor };
};

export const useAssignmentColorClasses = (assignmentCode: string): AssignmentColorClasses => {
  const { wcif } = useWCIF();
  const { getColor } = useCustomRoleColorPreferences();

  if (isCustomRoleAssignmentCode(assignmentCode)) {
    return getPaletteColorClasses(getColor(assignmentCode));
  }

  return getAssignmentColorClasses(assignmentCode, wcif);
};
