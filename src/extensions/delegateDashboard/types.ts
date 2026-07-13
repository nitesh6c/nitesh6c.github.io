export type CustomRoleExportStrategy = 'roles' | 'extension' | 'both';

export interface CustomRoleDefinition {
  id: string;
  name: string;
  exportStrategy?: CustomRoleExportStrategy;
  showOnStaffPage?: boolean;
  assignPerGroup?: boolean;
  assignmentKey?: string;
  assignmentLetter?: string;
}

export interface CustomRoleDefinitionsExtensionData {
  roles: CustomRoleDefinition[];
}

export interface PersonCustomRolesExtensionData {
  roles: string[];
}

export interface CustomRoleAssignmentRecord {
  registrantId: number;
  activityId: number;
  roleId: string;
}

export interface CustomRoleAssignmentsExtensionData {
  groupAssignments: CustomRoleAssignmentRecord[];
  rolesByRegistrantId: Record<string, string[]>;
}
