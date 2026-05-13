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
import { personalityClient } from '@repo/frontend-utils/src/clients/db/personality.client';
import { PersonalityCreateModel, PersonalityModel } from '@repo/frontend-utils/src/models';
import { OpenAiVoiceName } from '@repo/frontend-utils/src/clients/generated';

type PersonalityForm = PersonalityCreateModel | PersonalityModel;

export function AdminPersonalitiesPage() {
  const { t } = useTypedTranslation();
  const personalities = useAppStore((state) => state.personalities);
  const setPersonalities = useAppStore((state) => state.setPersonalities);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarFileName, setUploadedAvatarFileName] = useState<string | null>(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (globalThis.confirm(t('personalities.confirmDelete'))) {
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
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);

    if (!('id' in currentPersonality)) {
      return;
    }

    setIsProcessing(true);
    const { data, error } = await personalityClient.removeAvatar(currentPersonality.id);

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.avatarRemoveFailed'), { description: error.message });
    } else {
      setCurrentPersonality(data);
      toast.success(t('personalities.avatarRemoveSuccess'));
      void fetchPersonalities();
    }

    setIsProcessing(false);
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) {
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarUploadProgress(0);

    const { data, error } = await personalityClient.uploadAvatarFile(
      selectedAvatarFile,
      (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }

        setAvatarUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      },
    );

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.avatarUploadFailed'), { description: error.message });
      setIsUploadingAvatar(false);
      return;
    }

    setUploadedAvatarUrl(data.avatarUrl);
    setUploadedAvatarFileName(selectedAvatarFile.name);
    setAvatarUploadProgress(100);
    setIsUploadingAvatar(false);
    setSelectedAvatarFile(null);
    toast.success(t('personalities.avatarUploadSuccess'));
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

    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      setIsProcessing(false);
      return;
    }

    const { data, error } = await personalityClient.update(currentPersonality.id, {
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
    });

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.updateFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.updateSuccess'));
      setCurrentPersonality(data);
      setUploadedAvatarUrl(null);
      setUploadedAvatarFileName(null);
      setAvatarUploadProgress(0);
      await fetchPersonalities();
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

    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      setIsProcessing(false);
      return;
    }

    const { error } = await personalityClient.insert({
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

    if (error) {
      console.error(error.message);
      toast.error(t('personalities.createFailed'), { description: error.message });
    } else {
      toast.success(t('personalities.createSuccess'));
      setUploadedAvatarUrl(null);
      setUploadedAvatarFileName(null);
      setAvatarUploadProgress(0);
      await fetchPersonalities();
      setIsAddDialogOpen(false);
      setCurrentPersonality(emptyPersonality);
    }
    setIsProcessing(false);
  };

  const handleAddNew = () => {
    setCurrentPersonality(emptyPersonality);
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
    setIsAddDialogOpen(true);
  };

  const getAvatarFileName = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) {
      return null;
    }

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
