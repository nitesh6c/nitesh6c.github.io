import { EventId, Person, Room } from '@wca/helpers';

export const hasAssignmentInStage = (stage: Room, person: Person) => {
  const roundActivities = stage.activities.flatMap((ra) => ra.childActivities);
  const childActivityIds = roundActivities.map((a) => a.id);
  return person.assignments?.some((a) => childActivityIds.includes(a.activityId));
};

export const acceptedRegistration = ({ registration }: Person): boolean =>
  registration?.status === 'accepted';

export const isRegisteredForEvent =
  (eventId: EventId) =>
  ({ registration }: Person): boolean =>
    !!registration && registration.eventIds.includes(eventId);

export const isDelegate = ({ roles }: Person): boolean =>
  !!roles?.some((i) => i.includes('delegate'));

export const isOrganizer = ({ roles }: Person): boolean =>
  !!roles?.some((i) => i.includes('organizer'));

const getDelegateDashboardExtensionRoles = (person: Person): string[] => {
  const extension = person.extensions?.find((ext) => ext.id === 'delegateDashboard.customRoles');
  if (!extension?.data || typeof extension.data !== 'object') {
    return [];
  }

  const roles = (extension.data as { roles?: unknown }).roles;
  return Array.isArray(roles)
    ? roles.filter((role): role is string => typeof role === 'string')
    : [];
};

export const isStaff = (person: Person): boolean =>
  isDelegate(person) ||
  isOrganizer(person) ||
  !!person?.roles?.some((role) => role.includes('staff-') || role.startsWith('custom-')) ||
  getDelegateDashboardExtensionRoles(person).some(
    (role) => role.includes('staff-') || role.startsWith('custom-'),
  );
