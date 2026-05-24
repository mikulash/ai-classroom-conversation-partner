import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
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
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { OpenAiVoiceName } from '@repo/frontend-utils/src/clients/generated';

const personalitySchema = z.object({
  name: z.string().trim().min(1),
  gender: z.string(),
  age: z.string(),
  problemSummaryEn: z.string().trim().min(1),
  problemSummaryCs: z.string().trim().min(1),
  personalityDescriptionEn: z.string().trim().min(1),
  personalityDescriptionCs: z.string().trim().min(1),
  openaiVoiceName: z.nativeEnum(OpenAiVoiceName),
  elevenlabsVoiceId: z.string(),
  voiceInstructions: z.string(),
});

type PersonalityFormValues = z.infer<typeof personalitySchema>;

const EMPTY_VALUES: PersonalityFormValues = {
  name: '',
  gender: '',
  age: '',
  problemSummaryEn: '',
  problemSummaryCs: '',
  personalityDescriptionEn: '',
  personalityDescriptionCs: '',
  openaiVoiceName: OpenAiVoiceName.Alloy,
  elevenlabsVoiceId: '',
  voiceInstructions: '',
};

const personalityToFormValues = (p: PersonalityModel): PersonalityFormValues => ({
  name: p.name,
  gender: p.gender,
  age: p.age !== null ? String(p.age) : '',
  problemSummaryEn: p.problemSummaryEn,
  problemSummaryCs: p.problemSummaryCs,
  personalityDescriptionEn: p.personalityDescriptionEn,
  personalityDescriptionCs: p.personalityDescriptionCs,
  openaiVoiceName: p.openaiVoiceName,
  elevenlabsVoiceId: p.elevenlabsVoiceId ?? '',
  voiceInstructions: p.voiceInstructions ?? '',
});

const ageOrUndefined = (raw: string): number | undefined => {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
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

  const [editingPersonalityId, setEditingPersonalityId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarFileName, setUploadedAvatarFileName] = useState<string | null>(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);

  const form = useForm<PersonalityFormValues>({
    resolver: zodResolver(personalitySchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
  });

  const isProcessing =
    createPersonality.isPending ||
    updatePersonality.isPending ||
    deletePersonality.isPending ||
    removeAvatar.isPending;
  const isUploadingAvatar = uploadAvatar.isPending;

  const editingPersonality =
    editingPersonalityId !== null ?
      personalities.find((p) => p.id === editingPersonalityId) ?? null :
      null;

  const resetAvatarState = () => {
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
  };

  const handleEdit = (personality: PersonalityModel) => {
    setEditingPersonalityId(personality.id);
    form.reset(personalityToFormValues(personality));
    resetAvatarState();
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPersonalityId(null);
    form.reset(EMPTY_VALUES);
    resetAvatarState();
    setIsAddDialogOpen(true);
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
    if (editingPersonalityId === null) return;

    try {
      await removeAvatar.mutateAsync(editingPersonalityId);
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

  const buildPayload = (values: PersonalityFormValues) => ({
    name: values.name,
    problemSummaryEn: values.problemSummaryEn,
    problemSummaryCs: values.problemSummaryCs,
    personalityDescriptionEn: values.personalityDescriptionEn,
    personalityDescriptionCs: values.personalityDescriptionCs,
    gender: values.gender,
    age: ageOrUndefined(values.age),
    openaiVoiceName: values.openaiVoiceName,
    elevenlabsVoiceId: values.elevenlabsVoiceId || undefined,
    voiceInstructions: values.voiceInstructions || undefined,
    uploadedAvatarUrl: uploadedAvatarUrl ?? undefined,
  });

  const ensureAvatarUploaded = (): boolean => {
    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      return false;
    }
    return true;
  };

  const onEditSubmit = async (values: PersonalityFormValues) => {
    if (editingPersonalityId === null) return;
    if (!ensureAvatarUploaded()) return;

    try {
      await updatePersonality.mutateAsync({
        id: editingPersonalityId,
        input: buildPayload(values),
      });
      toast.success(t('personalities.updateSuccess'));
      resetAvatarState();
      setIsEditDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.updateFailed'), { description: message });
    }
  };

  const onAddSubmit = async (values: PersonalityFormValues) => {
    if (!ensureAvatarUploaded()) return;

    try {
      await createPersonality.mutateAsync(buildPayload(values));
      toast.success(t('personalities.createSuccess'));
      resetAvatarState();
      setIsAddDialogOpen(false);
      form.reset(EMPTY_VALUES);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('personalities.createFailed'), { description: message });
    }
  };

  const currentAvatarUrl = editingPersonality?.avatarUrl ?? null;
  const getAvatarFileName = (avatarUrl: string | null | undefined) =>
    avatarUrl ? (avatarUrl.split('/').at(-1) ?? avatarUrl) : null;
  const currentAvatarFileName = getAvatarFileName(currentAvatarUrl);
  const hasVisibleAvatar =
    selectedAvatarFile !== null ||
    uploadedAvatarUrl !== null ||
    Boolean(currentAvatarUrl);

  const renderPersonalityFormFields = () => {
    const { control } = form;
    return (
      <div className="grid gap-4">
        {/* Required fields notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">{t('personalities.requiredFieldsNotice')}</p>
          <p className="text-xs text-blue-700">
            {t('personalities.requiredFieldsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className="flex items-center gap-1">
                  {t('personalities.name')} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t('personalities.gender')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="age"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t('personalities.age')}</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
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

        <FormField
          control={control}
          name="problemSummaryEn"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className="flex items-center gap-1">
                {t('personalities.problemSummaryEn')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="problemSummaryCs"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className="flex items-center gap-1">
                {t('personalities.problemSummaryCs')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalityDescriptionEn"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className="flex items-center gap-1">
                {t('personalities.personalityDescriptionEn')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalityDescriptionCs"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className="flex items-center gap-1">
                {t('personalities.personalityDescriptionCs')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="openaiVoiceName"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>{t('personalities.openaiVoice')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('personalities.selectVoice')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(OpenAiVoiceName).map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="elevenlabsVoiceId"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>{t('personalities.elevenlabsVoiceId')}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="voiceInstructions"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>{t('personalities.voiceInstructions')}</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </div>
    );
  };

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

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onEditSubmit)(e);
            }}>
              {renderPersonalityFormFields()}

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">{t('common.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t('common.saving') : t('common.saveChanges')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('personalities.addNewPersonality')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onAddSubmit)(e);
            }}>
              {renderPersonalityFormFields()}

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">{t('common.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t('common.creating') : t('personalities.createPersonality')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
