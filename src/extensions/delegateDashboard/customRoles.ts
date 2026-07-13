import type { Competition, Person } from '@wca/helpers';
import type {
  CustomRoleAssignmentRecord,
  CustomRoleAssignmentsExtensionData,
  CustomRoleDefinition,
  CustomRoleDefinitionsExtensionData,
  CustomRoleExportStrategy,
  PersonCustomRolesExtensionData,
} from './types';

export const DD_NAMESPACE = 'delegateDashboard';

const CUSTOM_ROLE_DEFINITIONS_EXTENSION = 'customRoleDefinitions';
const CUSTOM_ROLE_ASSIGNMENTS_EXTENSION = 'customRoleAssignments';
const PERSON_CUSTOM_ROLES_EXTENSION = 'customRoles';

const DEFAULT_EXPORT_STRATEGY: CustomRoleExportStrategy = 'both';

function getExtensionId(extensionName: string): string {
  return `${DD_NAMESPACE}.${extensionName}`;
}

export function getCustomRoleDefinitionsExtensionData(
  wcif: Competition,
): CustomRoleDefinitionsExtensionData {
  const extension = wcif.extensions?.find(
    (ext) => ext.id === getExtensionId(CUSTOM_ROLE_DEFINITIONS_EXTENSION),
  );

  if (!extension?.data || typeof extension.data !== 'object') {
    return { roles: [] };
  }

  const data = extension.data as Partial<CustomRoleDefinitionsExtensionData>;
  if (!Array.isArray(data.roles)) {
    return { roles: [] };
  }

  return {
    roles: data.roles.filter(
      (role): role is CustomRoleDefinition =>
        !!role &&
        typeof role === 'object' &&
        typeof role.id === 'string' &&
        typeof role.name === 'string',
    ),
  };
}

export function getCustomRoleDefinitionById(
  wcif: Competition | undefined,
  roleId: string,
): CustomRoleDefinition | undefined {
  if (!wcif) {
    return undefined;
  }

  return getCustomRoleDefinitionsExtensionData(wcif).roles.find((role) => role.id === roleId);
}

export function getPersonCustomRolesExtensionData(person: Person): PersonCustomRolesExtensionData {
  const extension = person.extensions?.find(
    (ext) => ext.id === getExtensionId(PERSON_CUSTOM_ROLES_EXTENSION),
  );

  if (!extension?.data || typeof extension.data !== 'object') {
    return { roles: [] };
  }

  const data = extension.data as Partial<PersonCustomRolesExtensionData>;
  if (!Array.isArray(data.roles)) {
    return { roles: [] };
  }

  return {
    roles: data.roles.filter((role): role is string => typeof role === 'string'),
  };
}

function setPersonCustomRolesExtensionData(
  person: Person,
  data: PersonCustomRolesExtensionData,
): Person {
  const extensionId = getExtensionId(PERSON_CUSTOM_ROLES_EXTENSION);
  const otherExtensions = (person.extensions ?? []).filter((ext) => ext.id !== extensionId);

  if (data.roles.length === 0) {
    return {
      ...person,
      extensions: otherExtensions,
    };
  }

  return {
    ...person,
    extensions: [
      ...otherExtensions,
      {
        id: extensionId,
        specUrl: '',
        data,
      },
    ],
  };
}

function getExportStrategyForRole(
  roleId: string,
  customRoleDefinitions: CustomRoleDefinition[],
): CustomRoleExportStrategy {
  const customRole = customRoleDefinitions.find((role) => role.id === roleId);
  return customRole?.exportStrategy ?? DEFAULT_EXPORT_STRATEGY;
}

function shouldExportRoleToPersonRoles(
  roleId: string,
  customRoleDefinitions: CustomRoleDefinition[],
): boolean {
  const strategy = getExportStrategyForRole(roleId, customRoleDefinitions);
  return strategy === 'roles' || strategy === 'both';
}

function shouldExportRoleToExtension(
  roleId: string,
  customRoleDefinitions: CustomRoleDefinition[],
): boolean {
  const strategy = getExportStrategyForRole(roleId, customRoleDefinitions);
  return strategy === 'extension' || strategy === 'both';
}

function applyRoleChangeToPerson(
  person: Person,
  roleId: string,
  enabled: boolean,
  customRoleDefinitions: CustomRoleDefinition[],
): Person {
  const currentRoles = person.roles ?? [];
  const extensionRoles = getPersonCustomRolesExtensionData(person).roles;

  const addToRoles = shouldExportRoleToPersonRoles(roleId, customRoleDefinitions);
  const addToExtension = shouldExportRoleToExtension(roleId, customRoleDefinitions);

  const nextRoles = addToRoles
    ? enabled
      ? currentRoles.includes(roleId)
        ? currentRoles
        : [...currentRoles, roleId]
      : currentRoles.filter((role) => role !== roleId)
    : currentRoles;

  const nextExtensionRoles = addToExtension
    ? enabled
      ? extensionRoles.includes(roleId)
        ? extensionRoles
        : [...extensionRoles, roleId]
      : extensionRoles.filter((role) => role !== roleId)
    : extensionRoles;

  return setPersonCustomRolesExtensionData(
    {
      ...person,
      roles: nextRoles,
    },
    { roles: nextExtensionRoles },
  );
}

export function getEffectivePersonRoles(
  person: Person,
  customRoleDefinitions: CustomRoleDefinition[] = [],
): string[] {
  const rolesFromField = person.roles ?? [];
  const rolesFromExtension = getPersonCustomRolesExtensionData(person).roles;

  const extensionOnlyRoleIds = new Set(
    customRoleDefinitions
      .filter((role) => role.exportStrategy === 'extension')
      .map((role) => role.id),
  );

  const merged = new Set([...rolesFromField, ...rolesFromExtension]);

  extensionOnlyRoleIds.forEach((roleId) => {
    if (rolesFromExtension.includes(roleId)) {
      merged.add(roleId);
    } else {
      merged.delete(roleId);
    }
  });

  return Array.from(merged);
}

function syncCustomRolesFromAssignments(
  person: Person,
  customRoleDefinitions: CustomRoleDefinition[],
): Person {
  const perGroupRoleIds = customRoleDefinitions
    .filter((role) => role.assignPerGroup)
    .map((role) => role.id);

  return perGroupRoleIds.reduce((updatedPerson, roleId) => {
    const hasAssignment =
      updatedPerson.assignments?.some((assignment) => assignment.assignmentCode === roleId) ??
      false;

    return applyRoleChangeToPerson(updatedPerson, roleId, hasAssignment, customRoleDefinitions);
  }, person);
}

export function getCustomRoleAssignmentsExtensionData(
  wcif: Competition,
): CustomRoleAssignmentsExtensionData {
  const extension = wcif.extensions?.find(
    (ext) => ext.id === getExtensionId(CUSTOM_ROLE_ASSIGNMENTS_EXTENSION),
  );

  if (!extension?.data || typeof extension.data !== 'object') {
    return { groupAssignments: [], rolesByRegistrantId: {} };
  }

  const data = extension.data as Partial<CustomRoleAssignmentsExtensionData>;
  const groupAssignments = Array.isArray(data.groupAssignments)
    ? data.groupAssignments.filter(
        (record): record is CustomRoleAssignmentRecord =>
          !!record &&
          typeof record === 'object' &&
          typeof record.registrantId === 'number' &&
          typeof record.activityId === 'number' &&
          typeof record.roleId === 'string',
      )
    : [];

  const rolesByRegistrantId: Record<string, string[]> = {};
  if (data.rolesByRegistrantId && typeof data.rolesByRegistrantId === 'object') {
    Object.entries(data.rolesByRegistrantId).forEach(([registrantId, roles]) => {
      if (Array.isArray(roles)) {
        rolesByRegistrantId[registrantId] = roles.filter(
          (role): role is string => typeof role === 'string',
        );
      }
    });
  }

  return { groupAssignments, rolesByRegistrantId };
}

export function applyCustomRoleAssignmentsToPersons(wcif: Competition): Competition {
  const customRoleDefinitions = getCustomRoleDefinitionsExtensionData(wcif).roles;
  const { groupAssignments, rolesByRegistrantId } = getCustomRoleAssignmentsExtensionData(wcif);

  const wcifWithAssignments =
    groupAssignments.length === 0 && Object.keys(rolesByRegistrantId).length === 0
      ? wcif
      : {
          ...wcif,
          persons: wcif.persons.map((person) => {
            const backupRoles = rolesByRegistrantId[String(person.registrantId)] ?? [];
            let updatedPerson = { ...person };

            backupRoles.forEach((roleId) => {
              updatedPerson = applyRoleChangeToPerson(
                updatedPerson,
                roleId,
                true,
                customRoleDefinitions,
              );
            });

            const backupAssignments = groupAssignments.filter(
              (record) => record.registrantId === person.registrantId,
            );

            if (backupAssignments.length === 0) {
              return updatedPerson;
            }

            const otherAssignments = (updatedPerson.assignments ?? []).filter(
              (assignment) =>
                !backupAssignments.some((record) => record.activityId === assignment.activityId),
            );

            updatedPerson = {
              ...updatedPerson,
              assignments: [
                ...otherAssignments,
                ...backupAssignments.map((record) => ({
                  activityId: record.activityId,
                  assignmentCode: record.roleId,
                  stationNumber: null,
                })),
              ],
            };

            return syncCustomRolesFromAssignments(updatedPerson, customRoleDefinitions);
          }),
        };

  return mergeExtensionRolesIntoPersons(wcifWithAssignments);
}

function mergeExtensionRolesIntoPersons(wcif: Competition): Competition {
  const customRoleDefinitions = getCustomRoleDefinitionsExtensionData(wcif).roles;

  return {
    ...wcif,
    persons: wcif.persons.map((person) => {
      const effectiveRoles = getEffectivePersonRoles(person, customRoleDefinitions);
      const extensionRoles = getPersonCustomRolesExtensionData(person).roles;

      const rolesForField = effectiveRoles.filter((roleId) =>
        shouldExportRoleToPersonRoles(roleId, customRoleDefinitions),
      );

      const rolesForExtension = effectiveRoles.filter((roleId) =>
        shouldExportRoleToExtension(roleId, customRoleDefinitions),
      );

      return setPersonCustomRolesExtensionData(
        {
          ...person,
          roles: rolesForField,
        },
        { roles: [...new Set([...extensionRoles, ...rolesForExtension])] },
      );
    }),
  };
}

export function hydrateWcifWithDelegateDashboardCustomRoles(wcif: Competition): Competition {
  return applyCustomRoleAssignmentsToPersons(wcif);
}
