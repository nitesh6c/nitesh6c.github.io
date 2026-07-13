import { AssignmentCode } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { useAssignmentColorClasses } from '@/hooks/useAssignmentColorClasses';
import { getAssignmentDisplayName, isCustomRoleAssignmentCode } from '@/lib/customRoles';
import { useWCIF } from '@/providers/WCIFProvider';
import { BaseAssignmentPill } from '../Pill';

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode | string;
}

export function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  const { t } = useTranslation();
  const { wcif } = useWCIF();

  const customName = getAssignmentDisplayName(assignmentCode, wcif);
  const name = isCustomRoleAssignmentCode(assignmentCode)
    ? customName
    : t(`common.assignments.${assignmentCode}.noun`, {
        defaultValue: customName,
      });

  const colorClasses = useAssignmentColorClasses(assignmentCode);

  return <BaseAssignmentPill className={colorClasses.bg}>{name}</BaseAssignmentPill>;
}
