import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { personalityApi } from '@repo/frontend-utils/src/supabaseService';
import { toast } from 'sonner';
import { Personality, PersonalityInsert } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { Constants, Enums } from '@repo/shared/types/supabase/database.types';
import { useAppStore } from '../../hooks/useAppStore';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

export function AdminPersonalitiesPage() {
  const { t } = useTypedTranslation();
  const personalities = useAppStore((state) => state.personalities);
  const setPersonalities = useAppStore((state) => state.setPersonalities);

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // A clean template for new personalities
  const emptyPersonality: PersonalityInsert = {
    name: '',
    problem_summary_en: '',
    problem_summary_cs: '',
    personality_description_en: '',
    personality_description_cs: '',
    gender: '',
    openai_voice_name: 'alloy',
  };

  const [currentPersonality, setCurrentPersonality] =
        useState<PersonalityInsert>(emptyPersonality);

  useEffect(() => {
    fetchPersonalities();
  }, []);

  // Validation function for required fields
  const validateRequiredFields = (personality: PersonalityInsert): string | null => {
    const requiredFields = [
      { field: 'name', label: t('personalities.name') },
      { field: 'problem_summary_en', label: t('personalities.problemSummaryEn') },
      { field: 'problem_summary_cs', label: t('personalities.problemSummaryCs') },
      { field: 'personality_description_en', label: t('personalities.personalityDescriptionEn') },
      { field: 'personality_description_cs', label: t('personalities.personalityDescriptionCs') },
    ];

    for (const { field, label } of requiredFields) {
      const value = personality[field as keyof PersonalityInsert];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${label} is required and cannot be empty.`;
      }
    }
    return null;
  };

  async function fetchPersonalities() {
    setLoading(true);
    const { data, error } = await personalityApi.all();

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.loadFailed'), {
        description: error.message,
      });
    } else {
      const sortedPersonalities = data.toSorted((a, b) => a.id - b.id);
      setPersonalities(sortedPersonalities);
    }
    setLoading(false);
  }

  const handleEdit = (personality: Personality) => {
    setCurrentPersonality(personality);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('personalities.confirmDelete'))) {
      setIsProcessing(true);
      const { error } = await personalityApi.delete(id);

      if (error) {
        console.error(error.message);
        toast.error(t('personalities.deleteFailed'), { description: error.message });
      } else {
        toast.success(t('personalities.deleteSuccess'));
        fetchPersonalities();
      }
      setIsProcessing(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentPersonality((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setCurrentPersonality((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value === '' ? null : Number(e.target.value);
    setCurrentPersonality((prev) => ({ ...prev, age }));
  };

  const handleEditSubmit = async () => {
    if (!currentPersonality?.id) return;

    // Validate required fields
    const validationError = validateRequiredFields(currentPersonality);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    setIsProcessing(true);

    const { error } = await personalityApi.update(
      currentPersonality.id,
      {
        name: currentPersonality.name,
        problem_summary_en: currentPersonality.problem_summary_en,
        problem_summary_cs: currentPersonality.problem_summary_cs,
        personality_description_en: currentPersonality.personality_description_en,
        personality_description_cs: currentPersonality.personality_description_cs,
        gender: currentPersonality.gender,
        age: currentPersonality.age,
        avatar_url: currentPersonality.avatar_url,
        openai_voice_name: currentPersonality.openai_voice_name,
        elevenlabs_voice_id: currentPersonality.elevenlabs_voice_id,
        voice_instructions: currentPersonality.voice_instructions,
      },
    );

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.updateFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.updateSuccess'));
      fetchPersonalities();
      setIsEditDialogOpen(false);
    }
    setIsProcessing(false);
  };

  const handleAddSubmit = async () => {
    // Validate required fields
    const validationError = validateRequiredFields(currentPersonality);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    setIsProcessing(true);

    const { error } = await personalityApi.insert(currentPersonality);

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.createFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.createSuccess'));
      fetchPersonalities();
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
            placeholder={t('personalities.namePlaceholder')}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">{t('personalities.gender')}</Label>
          <Input
            id="gender"
            name="gender"
            value={currentPersonality.gender ?? ''}
            onChange={handleInputChange}
            placeholder={t('personalities.genderPlaceholder')}
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
            placeholder={t('personalities.agePlaceholder')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="avatar_url">{t('personalities.avatarUrl')}</Label>
          <Input
            id="avatar_url"
            name="avatar_url"
            value={currentPersonality.avatar_url ?? ''}
            onChange={handleInputChange}
            placeholder="https://models.readyplayer.me/6820bbc0e036577fe085562c.glb"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="problem_summary_en" className="flex items-center gap-1">
          {t('personalities.problemSummaryEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problem_summary_en"
          name="problem_summary_en"
          value={currentPersonality.problem_summary_en}
          onChange={handleInputChange}
          rows={3}
          placeholder={t('personalities.problemSummaryEnPlaceholder')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="problem_summary_cs" className="flex items-center gap-1">
          {t('personalities.problemSummaryCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problem_summary_cs"
          name="problem_summary_cs"
          value={currentPersonality.problem_summary_cs}
          onChange={handleInputChange}
          rows={3}
          placeholder={t('personalities.problemSummaryCsPlaceholder')}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personality_description_en" className="flex items-center gap-1">
          {t('personalities.personalityDescriptionEn')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personality_description_en"
          name="personality_description_en"
          value={currentPersonality.personality_description_en}
          onChange={handleInputChange}
          rows={3}
          placeholder={t('personalities.personalityDescriptionEnPlaceholder')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="personality_description_cs" className="flex items-center gap-1">
          {t('personalities.personalityDescriptionCs')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="personality_description_cs"
          name="personality_description_cs"
          value={currentPersonality.personality_description_cs}
          onChange={handleInputChange}
          rows={3}
          placeholder={t('personalities.personalityDescriptionCsPlaceholder')}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="openai_voice_name">{t('personalities.openaiVoice')}</Label>
        <Select
          value={currentPersonality.openai_voice_name ?? 'alloy'}
          onValueChange={(value) =>
            handleSelectChange('openai_voice_name', value as Enums<'OpenAiVoiceName'>)
          }>
          <SelectTrigger>
            <SelectValue placeholder={t('personalities.selectVoice')}/>
          </SelectTrigger>
          <SelectContent>
            {
              Constants.public.Enums.OpenAiVoiceName.map((voice) => (
                <SelectItem key={voice} value={voice}>
                  {voice.charAt(0).toUpperCase() + voice.slice(1)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="elevenlabs_voice_id">{t('personalities.elevenlabsVoiceId')}</Label>
        <Input
          id="elevenlabs_voice_id"
          name="elevenlabs_voice_id"
          value={currentPersonality.elevenlabs_voice_id ?? ''}
          onChange={handleInputChange}
          placeholder={t('personalities.elevenlabsVoiceIdPlaceholder')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="voice_instructions">{t('personalities.voiceInstructions')}</Label>
        <Textarea
          id="voice_instructions"
          name="voice_instructions"
          value={currentPersonality.voice_instructions ?? ''}
          onChange={handleInputChange}
          rows={3}
          placeholder={t('personalities.voiceInstructionsPlaceholder')}
        />
      </div>
    </div>
  );

  if (loading) {
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
                    {personality.problem_summary_en}
                  </TableCell>
                  <TableCell>{personality.openai_voice_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(personality)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(personality.id)}
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
            <Button onClick={handleEditSubmit} disabled={isProcessing}>
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
            <Button onClick={handleAddSubmit} disabled={isProcessing}>
              {isProcessing ? t('common.creating') : t('personalities.createPersonality')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
