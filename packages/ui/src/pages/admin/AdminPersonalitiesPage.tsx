import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useConfirm } from '../../hooks/useConfirm';
import {
  useCreatePersonality,
  useDeletePersonality,
  usePersonalities,
  useRemovePersonalityAvatar,
  useUpdatePersonality,
  useUploadPersonalityAvatar,
} from '../../hooks/queries/usePersonalities';
import { PersonalityCreateModel, PersonalityModel } from '@repo/frontend-utils/src/models';
import { OpenAiVoiceName } from '@repo/frontend-utils/src/clients/generated';

type PersonalityForm = PersonalityCreateModel | PersonalityModel;

const EMPTY_PERSONALITY: PersonalityCreateModel = {
  name: '',
  problemSummaryEn: '',
  problemSummaryCs: '',
  personalityDescriptionEn: '',
  personalityDescriptionCs: '',
  gender: '',
  openaiVoiceName: 'alloy',
};

export function AdminPersonalitiesPage() {
  const { t } = useTypedTranslation();
  const confirm = useConfirm();

  const personalitiesQuery = usePersonalities();
  const personalities = personalitiesQuery.data ?? [];

  const createPersonality = useCreatePersonality();
  const updatePersonality = useUpdatePersonality();
  const deletePersonality = useDeletePersonality();
  const removeAvatar = useRemovePersonalityAvatar();
  const uploadAvatar = useUploadPersonalityAvatar();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarFileName, setUploadedAvatarFileName] = useState<string | null>(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);

  const [currentPersonality, setCurrentPersonality] =
    useState<PersonalityForm>(EMPTY_PERSONALITY);

  // A mutation is in-flight if any of the write hooks are pending.
  const isProcessing =
    createPersonality.isPending ||
    updatePersonality.isPending ||
    deletePersonality.isPending ||
    removeAvatar.isPending;
  const isUploadingAvatar = uploadAvatar.isPending;

  const validateRequiredFields = (personality: PersonalityCreateModel): string | null => {
    const requiredFields = [
      { field: 'name', label: t('personalities.name') },
      { field: 'problemSummaryEn', label: t('personalities.problemSummaryEn') },
      { field: 'problemSummaryCs', label: t('personalities.problemSummaryCs') },
      { field: 'personalityDescriptionEn', label: t('personalities.personalityDescriptionEn') },
      { field: 'personalityDescriptionCs', label: t('personalities.personalityDescriptionCs') },
    ] as const;

    for (const { field, label } of requiredFields) {
      const value = personality[field];
      if (!value || value.trim() === '') {
        return `${label} is required and cannot be empty.`;
      }
    }
    return null;
  };

  const resetAvatarState = () => {
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
  };

  const handleEdit = (personality: PersonalityModel) => {
    setCurrentPersonality(personality);
    resetAvatarState();
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: t('personalities.confirmDelete'),
      confirmLabel: t('actions.delete', 'Delete'),
      cancelLabel: t('actions.cancel', 'Cancel'),
      destructive: true,
    });
    if (!ok) return;

    try {
      await deletePersonality.mutateAsync(id);
      toast.success(t('personalities.deleteSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.deleteFailed'), { description: message });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentPersonality((prev) => ({ ...prev, [name]: value } as PersonalityForm));
  };

  const handleSelectChange = (field: keyof PersonalityCreateModel, value: string) => {
    setCurrentPersonality((prev) => ({ ...prev, [field]: value } as PersonalityForm));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value === '' ? null : Number(e.target.value);
    setCurrentPersonality((prev) => ({ ...prev, age } as PersonalityForm));
  };

  const validateAvatarFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.glb')) {
      return t('personalities.avatarUploadOnlyGlb');
    }
    if (file.size > 50 * 1024 * 1024) {
      return t('personalities.avatarUploadMaxSize');
    }
    return null;
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedAvatarFile(null);
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(t('personalities.avatarUploadInvalid'), { description: validationError });
      e.target.value = '';
      setSelectedAvatarFile(null);
      return;
    }

    setSelectedAvatarFile(file);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
  };

  const handleRemoveAvatar = async () => {
    resetAvatarState();
    if (!('id' in currentPersonality)) return;

    try {
      const data = await removeAvatar.mutateAsync(currentPersonality.id);
      setCurrentPersonality(data);
      toast.success(t('personalities.avatarRemoveSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.avatarRemoveFailed'), { description: message });
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) return;
    setAvatarUploadProgress(0);

    try {
      const data = await uploadAvatar.mutateAsync({
        file: selectedAvatarFile,
        onProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setAvatarUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });
      setUploadedAvatarUrl(data.avatarUrl);
      setUploadedAvatarFileName(selectedAvatarFile.name);
      setAvatarUploadProgress(100);
      setSelectedAvatarFile(null);
      toast.success(t('personalities.avatarUploadSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.avatarUploadFailed'), { description: message });
    }
  };

  const handleEditSubmit = async () => {
    if (!('id' in currentPersonality)) return;

    const validationError = validateRequiredFields(currentPersonality);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      return;
    }

    try {
      const data = await updatePersonality.mutateAsync({
        id: currentPersonality.id,
        input: {
          name: currentPersonality.name,
          problemSummaryEn: currentPersonality.problemSummaryEn,
          problemSummaryCs: currentPersonality.problemSummaryCs,
          personalityDescriptionEn: currentPersonality.personalityDescriptionEn,
          personalityDescriptionCs: currentPersonality.personalityDescriptionCs,
          gender: currentPersonality.gender,
          age: currentPersonality.age ?? undefined,
          openaiVoiceName: currentPersonality.openaiVoiceName,
          elevenlabsVoiceId: currentPersonality.elevenlabsVoiceId ?? undefined,
          voiceInstructions: currentPersonality.voiceInstructions ?? undefined,
          uploadedAvatarUrl: uploadedAvatarUrl ?? undefined,
        },
      });
      toast.success(t('personalities.updateSuccess'));
      setCurrentPersonality(data);
      resetAvatarState();
      setIsEditDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.updateFailed'), { description: message });
    }
  };

  const handleAddSubmit = async () => {
    const validationError = validateRequiredFields(currentPersonality as PersonalityCreateModel);
    if (validationError) {
      toast.error('Validation Error', { description: validationError });
      return;
    }

    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      return;
    }

    try {
      await createPersonality.mutateAsync({
        name: currentPersonality.name,
        problemSummaryEn: currentPersonality.problemSummaryEn,
        problemSummaryCs: currentPersonality.problemSummaryCs,
        personalityDescriptionEn: currentPersonality.personalityDescriptionEn,
        personalityDescriptionCs: currentPersonality.personalityDescriptionCs,
        gender: currentPersonality.gender ?? undefined,
        age: currentPersonality.age ?? undefined,
        openaiVoiceName: currentPersonality.openaiVoiceName,
        elevenlabsVoiceId: currentPersonality.elevenlabsVoiceId ?? undefined,
        voiceInstructions: currentPersonality.voiceInstructions ?? undefined,
        uploadedAvatarUrl: uploadedAvatarUrl ?? undefined,
      });
      toast.success(t('personalities.createSuccess'));
      resetAvatarState();
      setIsAddDialogOpen(false);
      setCurrentPersonality(EMPTY_PERSONALITY);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.createFailed'), { description: message });
    }
  };

  const handleAddNew = () => {
    setCurrentPersonality(EMPTY_PERSONALITY);
    resetAvatarState();
    setIsAddDialogOpen(true);
  };

  const getAvatarFileName = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return null;
    return avatarUrl.split('/').at(-1) ?? avatarUrl;
  };

  const currentAvatarUrl = 'avatarUrl' in currentPersonality ? currentPersonality.avatarUrl : null;
  const currentAvatarFileName = getAvatarFileName(currentAvatarUrl);
  const hasVisibleAvatar =
    selectedAvatarFile !== null ||
    uploadedAvatarUrl !== null ||
    Boolean(currentAvatarUrl);

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
      </div>

      <div className="grid gap-3 rounded-lg border border-border p-4">
        <div className="grid gap-2">
          <Label htmlFor="avatarFile">{t('personalities.avatarUpload')}</Label>
          <Input
            id="avatarFile"
            name="avatarFile"
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={handleAvatarFileChange}
          />
          <p className="text-xs text-muted-foreground">
            {selectedAvatarFile ? selectedAvatarFile.name : t('personalities.avatarUploadHint')}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleUploadAvatar()}
              disabled={!selectedAvatarFile || isUploadingAvatar || isProcessing}
            >
              {isUploadingAvatar ? t('personalities.avatarUploading') : t('personalities.avatarUploadButton')}
            </Button>
            {uploadedAvatarUrl && (
              <span className="text-sm text-muted-foreground">{t('personalities.avatarReadyToSave')}</span>
            )}
          </div>
          {(isUploadingAvatar || avatarUploadProgress > 0) && (
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${avatarUploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {hasVisibleAvatar && (
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-muted-foreground">
              {selectedAvatarFile?.name ??
                uploadedAvatarFileName ??
                currentAvatarFileName ??
                t('personalities.avatarUploaded')}
            </span>
            {currentAvatarUrl && !uploadedAvatarUrl && !selectedAvatarFile && (
              <span className="shrink-0 text-xs font-medium text-emerald-700">
                {t('personalities.avatarAttached')}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleRemoveAvatar()}
              disabled={isProcessing}
            >
              {t('personalities.avatarRemove')}
            </Button>
          </div>
        )}
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
          }}>
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

  if (personalitiesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (personalitiesQuery.isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-destructive">
          {t('personalities.loadFailed')}: {personalitiesQuery.error.message}
        </span>
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
              <TableHead>{t('personalities.avatar')}</TableHead>
              <TableHead>{t('personalities.problemSummaryEn')}</TableHead>
              <TableHead>{t('personalities.voice')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {personalities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('personalities.noPersonalitiesFound')}
                </TableCell>
              </TableRow>
            ) : (
              personalities.map((personality) => (
                <TableRow key={personality.id}>
                  <TableCell className="font-medium">{personality.name}</TableCell>
                  <TableCell>{personality.gender}</TableCell>
                  <TableCell>{personality.age ?? '-'}</TableCell>
                  <TableCell>
                    <span className={personality.avatarUrl ? 'text-emerald-700' : 'text-muted-foreground'}>
                      {personality.avatarUrl ? t('personalities.avatarAttached') : t('personalities.avatarMissing')}
                    </span>
                  </TableCell>
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
