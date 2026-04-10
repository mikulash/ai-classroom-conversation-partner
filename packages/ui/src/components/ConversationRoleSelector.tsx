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
            className={isSelected ? 'bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-500 hover:bg-gray-700'}
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
          className={`bg-transparent border-2 ${customRoleName ? 'border-black' : 'border-gray-400'}`}
          placeholder={t('enterCustomRolePlaceholder')}
        />
      </div>
    </div>
  );
};
