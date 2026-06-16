import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { LANGUAGE } from '@repo/frontend-utils/src/enums/Language';
import { ConversationRoleModel } from '@repo/frontend-utils/src/models';

/**
 * Props for the role selector (rewritten to work with role **names**, not objects).
 */
interface ConversationRoleSelectorProps {
    /** Predefined conversation roles coming from DB */
    predefinedRoles: ConversationRoleModel[];
    /** Currently selected role name (translated) */
    value: string;
    onChange: (roleName: string) => void;
}

export const ConversationRoleSelector: React.FC<ConversationRoleSelectorProps> = ({
  predefinedRoles,
  value,
  onChange,

}) => {
  const { t, language } = useTypedTranslation();

  const translatedName = (r: ConversationRoleModel) =>
    language === LANGUAGE.EN ? r.nameEn : r.nameCs;

  const matchedPredefined = predefinedRoles.find((r) => translatedName(r) === value);

  const [customRoleName, setCustomRoleName] = useState<string>(matchedPredefined ? '' : value);

  const selectUserRole = (conversationRole: ConversationRoleModel) => {
    onChange(translatedName(conversationRole));
    setCustomRoleName('');
  };

  const handleCustomUserRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomRoleName(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4 items-center">
      {predefinedRoles.map((conversationRole) => {
        const name = translatedName(conversationRole);
        const isSelected = matchedPredefined?.id === conversationRole.id;

        return (
          <Button
            key={conversationRole.id}
            variant={isSelected ? 'default' : 'outline'}
            aria-pressed={isSelected}
            onClick={() => {
              selectUserRole(conversationRole);
            }}
          >
            {name}
          </Button>
        );
      })}

      <div className="relative min-w-56">
        <Input
          id="custom-user-role"
          value={customRoleName}
          onChange={handleCustomUserRoleChange}
          className={`border-2 ${customRoleName ? 'border-primary' : ''}`}
          placeholder={t('conversation.enterCustomRolePlaceholder')}
          aria-label={t('conversation.enterCustomRolePlaceholder')}
        />
      </div>
    </div>
  );
};
