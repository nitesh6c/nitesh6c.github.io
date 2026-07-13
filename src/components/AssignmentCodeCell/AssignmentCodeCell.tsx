import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssignmentColorClasses } from '@/hooks/useAssignmentColorClasses';
import { AssignmentsMap, SupportedAssignmentCode } from '@/lib/assignments';
import { getAssignmentDisplayName, isCustomRoleAssignmentCode } from '@/lib/customRoles';
import { useWCIF } from '@/providers/WCIFProvider';

interface AssignmentCodeCellProps<T extends React.ElementType> {
  children?: React.ReactNode;
  className?: string;
  assignmentCode?: SupportedAssignmentCode | string;
  letter?: boolean;
  as?: T;
  border?: boolean;
  grammar?: 'verb' | 'noun' | 'plural-noun';
  count?: number;
}

export function AssignmentCodeCell<T extends React.ElementType = 'td'>({
  children,
  className,
  assignmentCode,
  letter = false,
  as,
  border = false,
  grammar = 'noun',
  count,
  ...props
}: AssignmentCodeCellProps<T> & React.ComponentProps<T>) {
  const { t } = useTranslation();
  const { wcif } = useWCIF();
  const assignment = assignmentCode && AssignmentsMap[assignmentCode as SupportedAssignmentCode];

  const content = useMemo(() => {
    if (!assignmentCode) {
      return '';
    }

    if (children) {
      return children;
    }

    if (!assignment) {
      if (letter) {
        if (isCustomRoleAssignmentCode(assignmentCode)) {
          const customRole = getAssignmentDisplayName(assignmentCode, wcif);
          return customRole[0]?.toUpperCase() ?? assignmentCode[0];
        }

        return assignmentCode[0];
      }

      if (isCustomRoleAssignmentCode(assignmentCode)) {
        return getAssignmentDisplayName(assignmentCode, wcif);
      }

      return assignmentCode.split('-')[1];
    }

    if (letter) {
      return assignment.letter;
    }

    const translationKey = `common.assignments.${assignmentCode}`;
    if (grammar === 'plural-noun') {
      return t(`${translationKey}.noun_other`);
    }

    if (grammar === 'verb') {
      return t(`${translationKey}.verb`);
    }

    return t(`${translationKey}.noun`);
  }, [assignment, assignmentCode, children, grammar, letter, t, wcif]);

  const Component = as || 'td';

  const colorClasses = useAssignmentColorClasses(assignmentCode ?? 'competitor');

  return (
    <Component
      className={classNames(
        className,
        assignmentCode && !border && colorClasses.bgMuted,
        assignmentCode && border && [colorClasses.border, 'border-b-4'],
      )}
      {...props}>
      {content}
      {count ? (
        <>
          {' '}
          <span className="type-body-sm">({count})</span>
        </>
      ) : null}
    </Component>
  );
}
