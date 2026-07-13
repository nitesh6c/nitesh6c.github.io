import type { Competition } from '@wca/helpers';
import {
  applyCustomRoleAssignmentsToPersons,
  getCustomRoleDefinitionsExtensionData,
} from './customRoles';

const baseWcif = (): Competition =>
  ({
    id: 'Test2025',
    name: 'Test Comp',
    shortName: 'Test',
    formatVersion: '1.0',
    events: [],
    schedule: { numberOfDays: 1, venues: [] },
    competitorLimit: 0,
    persons: [
      {
        registrantId: 1,
        name: 'Alice Example',
        wcaUserId: null,
        countryIso2: 'US',
        roles: [],
        assignments: [],
        extensions: [],
        registration: { eventIds: [], status: 'accepted' },
      },
    ],
    extensions: [],
  }) as unknown as Competition;

describe('delegateDashboard custom roles', () => {
  it('restores per-group custom assignments from the competition extension backup', () => {
    const wcif = baseWcif();
    wcif.extensions = [
      {
        id: 'delegateDashboard.customRoleDefinitions',
        specUrl: '',
        data: {
          roles: [
            {
              id: 'custom-commentator',
              name: 'Commentator',
              assignPerGroup: true,
              assignmentLetter: 'CO',
            },
          ],
        },
      },
      {
        id: 'delegateDashboard.customRoleAssignments',
        specUrl: '',
        data: {
          groupAssignments: [{ registrantId: 1, activityId: 101, roleId: 'custom-commentator' }],
          rolesByRegistrantId: {},
        },
      },
    ];

    const hydrated = applyCustomRoleAssignmentsToPersons(wcif);
    const person = hydrated.persons[0];

    expect(person.assignments).toEqual([
      {
        activityId: 101,
        assignmentCode: 'custom-commentator',
        stationNumber: null,
      },
    ]);
    expect(person.roles).toContain('custom-commentator');
  });

  it('restores competition-wide custom roles from rolesByRegistrantId backup', () => {
    const wcif = baseWcif();
    wcif.extensions = [
      {
        id: 'delegateDashboard.customRoleDefinitions',
        specUrl: '',
        data: {
          roles: [
            {
              id: 'custom-emcee',
              name: 'Emcee',
              exportStrategy: 'extension',
            },
          ],
        },
      },
      {
        id: 'delegateDashboard.customRoleAssignments',
        specUrl: '',
        data: {
          groupAssignments: [],
          rolesByRegistrantId: {
            '1': ['custom-emcee'],
          },
        },
      },
    ];

    const hydrated = applyCustomRoleAssignmentsToPersons(wcif);
    const person = hydrated.persons[0];

    expect(getCustomRoleDefinitionsExtensionData(hydrated).roles).toHaveLength(1);
    expect(
      person.extensions?.find((ext) => ext.id === 'delegateDashboard.customRoles')?.data,
    ).toEqual({
      roles: ['custom-emcee'],
    });
  });
});
