import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useCustomRoleColorPreferences } from '@/hooks/useAssignmentColorClasses';
import {
  assignmentColorPaletteLabels,
  assignmentColorPalettePickerOrder,
  AssignmentColorPalette,
  getPaletteColorClasses,
} from '@/lib/assignmentColorPalettes';
import { getAssignmentDisplayName } from '@/lib/customRoles';
import { useWCIF } from '@/providers/WCIFProvider';

interface CustomRoleColorPickerProps {
  roleId: string;
  className?: string;
}

export function CustomRoleColorPicker({ roleId, className }: CustomRoleColorPickerProps) {
  const { wcif } = useWCIF();
  const { getColor, setColor } = useCustomRoleColorPreferences();
  const selected = getColor(roleId);
  const label = getAssignmentDisplayName(roleId, wcif);

  return (
    <div
      className={classNames(
        'flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3',
        className,
      )}>
      <span
        className="type-body-sm shrink-0 sm:w-28"
        title={assignmentColorPaletteLabels[selected]}>
        {label}
      </span>
      <div
        className="flex min-w-0 flex-wrap gap-1"
        role="radiogroup"
        aria-label={`Color for ${label}`}>
        {assignmentColorPalettePickerOrder.map((palette) => {
          const swatch = getPaletteColorClasses(palette);
          const isSelected = selected === palette;

          return (
            <button
              key={palette}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={assignmentColorPaletteLabels[palette]}
              title={assignmentColorPaletteLabels[palette]}
              className={classNames(
                'h-5 w-5 shrink-0 rounded-full border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                swatch.bg,
                isSelected
                  ? 'border-gray-900 ring-1 ring-gray-900 dark:border-white dark:ring-white'
                  : 'border-transparent',
              )}
              onClick={() => setColor(roleId, palette as AssignmentColorPalette)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CustomAssignmentColorsSettingsProps {
  roleIds: string[];
  className?: string;
}

export function CustomAssignmentColorsSettings({
  roleIds,
  className,
}: CustomAssignmentColorsSettingsProps) {
  const { t } = useTranslation();

  if (roleIds.length === 0) {
    return null;
  }

  return (
    <details
      id="custom-assignment-colors"
      className={classNames(
        'group rounded-lg border border-tertiary-weak bg-panel/60 shadow-sm',
        className,
      )}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 marker:content-none hover:bg-gray-50 dark:hover:bg-gray-800/60 [&::-webkit-details-marker]:hidden">
        <span className="type-body-sm text-subtle">
          {t('competition.customAssignmentColors.summary')}
        </span>
        <span
          className="fa fa-chevron-down text-subtle transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-2 border-t border-tertiary-weak px-3 py-2.5">
        <p className="type-meta text-subtle">
          {t('competition.customAssignmentColors.description')}
        </p>
        <div className="divide-y divide-tertiary-weak">
          {roleIds.map((roleId) => (
            <CustomRoleColorPicker key={roleId} roleId={roleId} className="py-1.5" />
          ))}
        </div>
      </div>
    </details>
  );
}

/** @deprecated Use CustomAssignmentColorsSettings instead. */
export const CustomAssignmentColorsPanel = CustomAssignmentColorsSettings;
