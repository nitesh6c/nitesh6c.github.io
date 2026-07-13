import {
  getAssignmentDisplayName,
  getDisplayAssignmentCodes,
  getStaffAssignmentShortLabel,
  isStaffLikeAssignmentCode,
} from './customRoles';

describe('customRoles display helpers', () => {
  const wcif = {
    extensions: [
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
    ],
  } as Parameters<typeof getAssignmentDisplayName>[1];

  it('detects staff-like assignment codes', () => {
    expect(isStaffLikeAssignmentCode('staff-judge')).toBe(true);
    expect(isStaffLikeAssignmentCode('custom-commentator')).toBe(true);
    expect(isStaffLikeAssignmentCode('competitor')).toBe(false);
  });

  it('uses custom role definitions for labels', () => {
    expect(getAssignmentDisplayName('custom-commentator', wcif)).toBe('Commentator');
    expect(getStaffAssignmentShortLabel('custom-commentator', wcif)).toBe('C');
  });

  it('includes custom assignment codes in display order', () => {
    expect(
      getDisplayAssignmentCodes(wcif, ['staff-judge', 'custom-commentator', 'competitor']),
    ).toEqual(['staff-judge', 'custom-commentator']);
  });
});
