import { Person } from '@wca/helpers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclaimerText } from '@/components';
import { CustomAssignmentColorsSettings } from '@/components/CustomRoleColorPicker';
import { getDefinedCustomRoleIds } from '@/lib/customRoles';
import { useWCIF } from '@/providers/WCIFProvider';
import { Assignments } from './Assignments';
import { PersonalPageLayout } from './PersonalPageLayout';

export interface PersonalScheduleContainerProps {
  person: Person;
}

export function PersonalScheduleContent({ person }: PersonalScheduleContainerProps) {
  const { t } = useTranslation();

  const { wcif } = useWCIF();
  const customRoleIds = useMemo(() => getDefinedCustomRoleIds(wcif), [wcif]);

  const anyAssignmentsHasStationNumber = !!person.assignments?.some((a) => a.stationNumber);

  return (
    <>
      <DisclaimerText className="mx-1" />

      {wcif && (
        <>
          {person.assignments && person.assignments.length > 0 ? (
            <Assignments
              wcif={wcif}
              person={person}
              showStationNumber={anyAssignmentsHasStationNumber}
            />
          ) : (
            <div className="p-2">
              <p>{t('competition.personalSchedule.noAssignments.line1')}</p>
              <p>{t('competition.personalSchedule.noAssignments.line2')}</p>
            </div>
          )}
          <CustomAssignmentColorsSettings roleIds={customRoleIds} className="mx-1 mt-4" />
        </>
      )}
    </>
  );
}

export function PersonalScheduleContainer({ person }: PersonalScheduleContainerProps) {
  const { competitionId } = useWCIF();

  return (
    <PersonalPageLayout activePage="schedule" competitionId={competitionId} person={person}>
      <PersonalScheduleContent person={person} />
    </PersonalPageLayout>
  );
}
