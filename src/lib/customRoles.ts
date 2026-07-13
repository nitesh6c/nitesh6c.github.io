import type { Competition } from '@wca/helpers';
import {
  getCustomRoleDefinitionById,
  getCustomRoleDefinitionsExtensionData,
} from '@/extensions/delegateDashboard/customRoles';
import { GroupAssignmentCodeRank } from './constants';

export function isCustomRoleAssignmentCode(assignmentCode: string): boolean {
  return assignmentCode.startsWith('custom-');
}

export function isStaffLikeAssignmentCode(assignmentCode: string): boolean {
  return (
    assignmentCode !== 'competitor' &&
    (assignmentCode.startsWith('staff-') || isCustomRoleAssignmentCode(assignmentCode))
  );
}

export function getDefinedCustomRoleIds(wcif: Competition | undefined): string[] {
  if (!wcif) {
    return [];
  }

  return getCustomRoleDefinitionsExtensionData(wcif).roles.map((role) => role.id);
}

export function getAssignmentDisplayName(
  assignmentCode: string,
  wcif: Competition | undefined,
): string {
  if (isCustomRoleAssignmentCode(assignmentCode)) {
    return (
      getCustomRoleDefinitionById(wcif, assignmentCode)?.name ??
      assignmentCode.replace(/^custom-/, '')
    );
  }

  return assignmentCode.replace(/^staff-/, '');
}

export function getStaffAssignmentShortLabel(
  assignmentCode: string,
  wcif: Competition | undefined,
): string {
  if (isCustomRoleAssignmentCode(assignmentCode)) {
    const letter = getCustomRoleDefinitionById(wcif, assignmentCode)?.assignmentLetter;
    if (letter) {
      return letter[0].toUpperCase();
    }

    const slug = assignmentCode.replace(/^custom-/, '');
    return slug[0]?.toUpperCase() ?? 'C';
  }

  return assignmentCode.split('-')[1]?.[0]?.toUpperCase() ?? '?';
}

export function getDisplayAssignmentCodes(
  wcif: Competition | undefined,
  assignmentCodesInUse: Array<string | undefined | null>,
): string[] {
  const inUse = new Set(
    assignmentCodesInUse.filter(
      (code): code is string => !!code && code !== 'competitor' && isStaffLikeAssignmentCode(code),
    ),
  );

  if (inUse.size === 0) {
    return [];
  }

  const rankedBuiltIn = GroupAssignmentCodeRank.filter((code) => inUse.has(code));
  const customRoleIds = (wcif ? getCustomRoleDefinitionsExtensionData(wcif).roles : [])
    .filter((role) => role.assignPerGroup !== false)
    .map((role) => role.id)
    .filter((roleId) => inUse.has(roleId));

  const remainingCustom = [...inUse].filter(
    (code) =>
      isCustomRoleAssignmentCode(code) &&
      !rankedBuiltIn.includes(code as (typeof GroupAssignmentCodeRank)[number]) &&
      !customRoleIds.includes(code),
  );

  return [...rankedBuiltIn, ...customRoleIds, ...remainingCustom];
}
