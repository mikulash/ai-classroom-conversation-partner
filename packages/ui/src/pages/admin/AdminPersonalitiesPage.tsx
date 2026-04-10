import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { OpenAiVoiceName } from '@repo/shared/types/generated/enums';
import { personalityClient } from '@repo/frontend-utils/src/clients/db/personality.client';
import { PersonalityCreateModel, PersonalityModel } from '@repo/frontend-utils/src/models';

type PersonalityForm = PersonalityCreateModel | PersonalityModel;

export function AdminPersonalitiesPage() {
  const { t } = useTypedTranslation();
  const personalities = useAppStore((state) => state.personalities);
  const setPersonalities = useAppStore((state) => state.setPersonalities);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // A clean template for new personalities
  const emptyPersonality: PersonalityCreateModel = {
    name: '',
    problemSummaryEn: '',
    problemSummaryCs: '',
    personalityDescriptionEn: '',
    personalityDescriptionCs: '',
    gender: '',
    openaiVoiceName: 'alloy',
  };

  const [currentPersonality, setCurrentPersonality] =
    useState<PersonalityForm>(emptyPersonality);

  useEffect(() => {
    void fetchPersonalities();
  }, []);

  const validateRequiredFields = (personality: PersonalityCreateModel): string | null => {
    // 👇 use camelCase keys, not snake_case
    const requiredFields = [
      { field: 'name', label: t('personalities.name') },
      { field: 'problemSummaryEn', label: t('personalities.problemSummaryEn') },
      { field: 'problemSummaryCs', label: t('personalities.problemSummaryCs') },
      { field: 'personalityDescriptionEn', label: t('personalities.personalityDescriptionEn') },
      { field: 'personalityDescriptionCs', label: t('personalities.personalityDescriptionCs') },
    ] as const;

    for (const { field, label } of requiredFields) {
      const value = personality[field];
      if (!value || (value.trim() === '')) {
        return `${label} is required and cannot be empty.`;
      }
    }
    return null;
  };

  async function fetchPersonalities() {
    setIsLoading(true);
    const { data, error } = await personalityClient.all();

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.loadFailed'), {
        description: error.message,
      });
    } else {
      const sortedPersonalities = data.toSorted((a, b) => a.id - b.id);
      setPersonalities(sortedPersonalities);
    }
    setIsLoading(false);
  }

  const handleEdit = (personality: PersonalityModel) => {
    // 👇 this now fits the union
    setCurrentPersonality(personality);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('personalities.confirmDelete'))) {
      setIsProcessing(true);
      const { error } = await personalityClient.delete(id);

      if (error) {
        console.error(error.message);
        toast.error(t('personalities.deleteFailed'), { description: error.message });
      } else {
        toast.success(t('personalities.deleteSuccess'));
        void fetchPersonalities();
      }
      setIsProcessing(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // 👇 all names must match camelCase in DTO
    setCurrentPersonality((prev) => ({ ...prev, [name]: value } as PersonalityForm));
  };

  const handleSelectChange = (field: keyof PersonalityCreateModel, value: string) => {
    setCurrentPersonality((prev) => ({ ...prev, [field]: value } as PersonalityForm));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value === '' ? null : Number(e.target.value);
    setCurrentPersonality((prev) => ({ ...prev, age } as PersonalityForm));
  };

  const handleEditSubmit = async () => {
    // only edit when we have an id
    if (!('id' in currentPersonality)) return;

    const validationError = validateRequiredFields(currentPersonality);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    setIsProcessing(true);

    const { error } = await personalityClient.update(currentPersonality.id, {
      name: currentPersonality.name,
      problemSummaryEn: currentPersonality.problemSummaryEn,
      problemSummaryCs: currentPersonality.problemSummaryCs,
      personalityDescriptionEn: currentPersonality.personalityDescriptionEn,
      personalityDescriptionCs: currentPersonality.personalityDescriptionCs,
      gender: currentPersonality.gender ?? undefined,
      age: currentPersonality.age ?? undefined,
      avatarUrl: currentPersonality.avatarUrl ?? undefined,
      openaiVoiceName: currentPersonality.openaiVoiceName,
      elevenlabsVoiceId: currentPersonality.elevenlabsVoiceId ?? undefined,
      voiceInstructions: currentPersonality.voiceInstructions ?? undefined,
    });

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.updateFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.updateSuccess'));
      void fetchPersonalities();
      setIsEditDialogOpen(false);
    }
    setIsProcessing(false);
  };


  const handleAddSubmit = async () => {
    // currentPersonality here is of create shape (no id)
    const validationError = validateRequiredFields(currentPersonality as PersonalityCreateModel);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    setIsProcessing(true);

    const { error } = await personalityClient.insert({
      name: currentPersonality.name,
      problemSummaryEn: currentPersonality.problemSummaryEn,
      problemSummaryCs: currentPersonality.problemSummaryCs,
      personalityDescriptionEn: currentPersonality.personalityDescriptionEn,
      personalityDescriptionCs: currentPersonality.personalityDescriptionCs,
      gender: currentPersonality.gender ?? undefined,
      age: currentPersonality.age ?? undefined,
      avatarUrl: currentPersonality.avatarUrl ?? undefined,
      openaiVoiceName: currentPersonality.openaiVoiceName,
      elevenlabsVoiceId: currentPersonality.elevenlabsVoiceId ?? undefined,
      voiceInstructions: currentPersonality.voiceInstructions ?? undefined,
    });

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.createFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.createSuccess'));
      void fetchPersonalities();
      setIsAddDialogOpen(false);
      setCurrentPersonality(emptyPersonality);
    }
    setIsProcessing(false);
  };

  const handleAddNew = () => {
    setCurrentPersonality(emptyPersonality);
    setIsAddDialogOpen(true);
  };

  const renderPersonalityForm = () => (
    <div className="grid gap-4">
      {/* Required fields notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">{t('personalities.requiredFieldsNotice')}</p>
        <p className="text-xs text-blue-700">
          {t('personalities.requiredFieldsDescription')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="flex items-center gap-1">
            {t('personalities.name')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={currentPersonality.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">{t('personalities.gender')}</Label>
          <Input
            id="gender"
            name="gender"
            value={currentPersonality.gender ?? ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="age">{t('personalities.age')}</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={currentPersonality.age ?? ''}
            onChange={handleAgeChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="avatarUrl">{t('personalities.avatarUrl')}</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            value={currentPersonality.avatarUrl ?? ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="problemSummaryEn" className="flex items-center gap-1">
          {t('personalities.problemSummaryEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problemSummaryEn"
          name="problemSummaryEn"
          value={currentPersonality.problemSummaryEn ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="problemSummaryCs" className="flex items-center gap-1">
          {t('personalities.problemSummaryCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problemSummaryCs"
          name="problemSummaryCs"
          value={currentPersonality.problemSummaryCs ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personalityDescriptionEn" className="flex items-center gap-1">
          {t('personalities.personalityDescriptionEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personalityDescriptionEn"
          name="personalityDescriptionEn"
          value={currentPersonality.personalityDescriptionEn ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personalityDescriptionCs" className="flex items-center gap-1">
          {t('personalities.personalityDescriptionCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personalityDescriptionCs"
          name="personalityDescriptionCs"
          value={currentPersonality.personalityDescriptionCs ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="openaiVoiceName">{t('personalities.openaiVoice')}</Label>
        <Select
          value={currentPersonality.openaiVoiceName}
          onValueChange={(value) => {
            handleSelectChange('openaiVoiceName', value as OpenAiVoiceName);
          }
          }>
          <SelectTrigger>
            <SelectValue placeholder={t('personalities.selectVoice')} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(OpenAiVoiceName).map((voice) => (
              <SelectItem key={voice} value={voice}>
                {voice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="elevenlabsVoiceId">{t('personalities.elevenlabsVoiceId')}</Label>
        <Input
          id="elevenlabsVoiceId"
          name="elevenlabsVoiceId"
          value={currentPersonality.elevenlabsVoiceId ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="voiceInstructions">{t('personalities.voiceInstructions')}</Label>
        <Textarea
          id="voiceInstructions"
          name="voiceInstructions"
          value={currentPersonality.voiceInstructions ?? ''}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto p-6 mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('personalities.title')}</CardTitle>
        <Button onClick={handleAddNew}>{t('personalities.addNewPersonality')}</Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('personalities.name')}</TableHead>
              <TableHead>{t('personalities.gender')}</TableHead>
              <TableHead>{t('personalities.age')}</TableHead>
              <TableHead>{t('personalities.problemSummaryEn')}</TableHead>
              <TableHead>{t('personalities.voice')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {personalities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('personalities.noPersonalitiesFound')}
                </TableCell>
              </TableRow>
            ) : (
              personalities.map((personality) => (
                <TableRow key={personality.id}>
                  <TableCell className="font-medium">{personality.name}</TableCell>
                  <TableCell>{personality.gender}</TableCell>
                  <TableCell>{personality.age ?? '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {personality.problemSummaryEn}
                  </TableCell>
                  <TableCell>{personality.openaiVoiceName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleEdit(personality);
                        }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete(personality.id)}
                        disabled={isProcessing}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('personalities.editPersonality')}</DialogTitle>
          </DialogHeader>

          {renderPersonalityForm()}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={() => void handleEditSubmit()} disabled={isProcessing}>
              {isProcessing ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('personalities.addNewPersonality')}</DialogTitle>
          </DialogHeader>

          {renderPersonalityForm()}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={() => void handleAddSubmit()} disabled={isProcessing}>
              {isProcessing ? t('common.creating') : t('personalities.createPersonality')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
