import { assignmentColorClasses } from './colors';

/**
 * Built-in assignment color palettes available for custom role overrides.
 * Each palette has full dark-mode support via Tailwind assignment color utilities.
 */
export const assignmentColorPaletteKeys = [
  'competitor',
  'scrambler',
  'runner',
  'judge',
  'delegate',
  'stagelead',
  'announcer',
  'showrunner',
  'dataentry',
  'core',
  'stream',
  'photo',
  'other',
  'neutral',
] as const;

export type AssignmentColorPalette = (typeof assignmentColorPaletteKeys)[number];

export const assignmentColorPaletteLabels: Record<AssignmentColorPalette, string> = {
  competitor: 'Green',
  scrambler: 'Yellow',
  runner: 'Orange',
  judge: 'Blue',
  delegate: 'Purple',
  stagelead: 'Fuchsia',
  announcer: 'Violet',
  showrunner: 'Pink',
  dataentry: 'Cyan',
  core: 'Rose',
  stream: 'Indigo',
  photo: 'Amber',
  other: 'Slate',
  neutral: 'Gray',
};

/** Palettes grouped for the color picker UI (warm → cool → neutral). */
export const assignmentColorPaletteGroups: ReadonlyArray<{
  label: string;
  palettes: readonly AssignmentColorPalette[];
}> = [
  { label: 'Greens & yellows', palettes: ['competitor', 'scrambler', 'runner', 'photo'] },
  {
    label: 'Blues & purples',
    palettes: ['judge', 'dataentry', 'stream', 'delegate', 'announcer', 'showrunner', 'stagelead'],
  },
  { label: 'Warm accents', palettes: ['core'] },
  { label: 'Neutrals', palettes: ['other', 'neutral'] },
];

/** Hue-sorted flat list for compact single-row pickers. */
export const assignmentColorPalettePickerOrder: readonly AssignmentColorPalette[] =
  assignmentColorPaletteGroups.flatMap((group) => group.palettes);

export const defaultPaletteForCustomRole = (roleId: string): AssignmentColorPalette => {
  let hash = 0;
  for (let i = 0; i < roleId.length; i += 1) {
    hash = (hash + roleId.charCodeAt(i) * (i + 1)) % assignmentColorPaletteKeys.length;
  }
  return assignmentColorPaletteKeys[hash];
};

export const paletteToStaffAssignmentCode = (palette: AssignmentColorPalette): string => {
  if (palette === 'competitor') {
    return 'competitor';
  }
  return `staff-${palette}`;
};

export const getPaletteColorClasses = (palette: AssignmentColorPalette) => {
  const code = paletteToStaffAssignmentCode(palette);
  return assignmentColorClasses[code] ?? assignmentColorClasses['staff-other'];
};
