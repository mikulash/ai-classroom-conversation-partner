import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import {
  useCreatePersonality,
  useRemovePersonalityAvatar,
  useUpdatePersonality,
  useUploadPersonalityAvatar,
} from '../../hooks/queries/usePersonalities';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { OpenAiVoiceName } from '@repo/frontend-utils/src/clients/generated';

const MAX_AVATAR_BYTES = 50 * 1024 * 1024;

const buildSchema = (requiredMessage: (label: string) => string) =>
  z.object({
    name: z.string().trim().min(1, { message: requiredMessage('name') }),
    gender: z.string().optional().default(''),
    age: z
      .union([z.number(), z.literal('')])
      .optional()
      .transform((value) => (value === '' || value === undefined ? null : value)),
    problemSummaryEn: z.string().trim().min(1, { message: requiredMessage('problemSummaryEn') }),
    problemSummaryCs: z.string().trim().min(1, { message: requiredMessage('problemSummaryCs') }),
    personalityDescriptionEn: z
      .string()
      .trim()
      .min(1, { message: requiredMessage('personalityDescriptionEn') }),
    personalityDescriptionCs: z
      .string()
      .trim()
      .min(1, { message: requiredMessage('personalityDescriptionCs') }),
    openaiVoiceName: z.nativeEnum(OpenAiVoiceName),
    elevenlabsVoiceId: z.string().optional().default(''),
    voiceInstructions: z.string().optional().default(''),
  });

type PersonalityFormValues = z.infer<ReturnType<typeof buildSchema>>;

const DEFAULT_VALUES: PersonalityFormValues = {
  name: '',
  gender: '',
  age: null,
  problemSummaryEn: '',
  problemSummaryCs: '',
  personalityDescriptionEn: '',
  personalityDescriptionCs: '',
  openaiVoiceName: OpenAiVoiceName.Alloy,
  elevenlabsVoiceId: '',
  voiceInstructions: '',
};

const toFormValues = (personality: PersonalityModel | null): PersonalityFormValues => {
  if (!personality) return DEFAULT_VALUES;
  return {
    name: personality.name,
    gender: personality.gender,
    age: personality.age ?? null,
    problemSummaryEn: personality.problemSummaryEn,
    problemSummaryCs: personality.problemSummaryCs,
    personalityDescriptionEn: personality.personalityDescriptionEn,
    personalityDescriptionCs: personality.personalityDescriptionCs,
    openaiVoiceName: personality.openaiVoiceName,
    elevenlabsVoiceId: personality.elevenlabsVoiceId ?? '',
    voiceInstructions: personality.voiceInstructions ?? '',
  };
};

interface PersonalityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When null, the dialog operates in create mode. When set, edit mode. */
  initialPersonality: PersonalityModel | null;
}

/**
 * Personality CRUD form dialog.
 *
 * Owns:
 *  - text-field state via react-hook-form + zod
 *  - avatar staging state (selected file, uploaded URL, progress)
 *  - the create/update/avatar mutations
 *
 * Auto-closes on successful submit; the parent only needs to control `open`.
 */
export const PersonalityFormDialog: React.FC<PersonalityFormDialogProps> = ({
  open,
  onOpenChange,
  initialPersonality,
}) => {
  const { t } = useTypedTranslation();

  const createPersonality = useCreatePersonality();
  const updatePersonality = useUpdatePersonality();
  const removeAvatar = useRemovePersonalityAvatar();
  const uploadAvatar = useUploadPersonalityAvatar();

  const mode: 'create' | 'edit' = initialPersonality ? 'edit' : 'create';

  // Avatar staging state — independent of form state because the upload
  // is a side-effect that happens before the parent record is saved.
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarFileName, setUploadedAvatarFileName] = useState<string | null>(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);

  const schema = buildSchema((field) => t(`personalities.${field}` as const) + ' is required');

  const form = useForm<PersonalityFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });

  // Reset the form whenever the dialog is opened with a different target.
  useEffect(() => {
    if (!open) return;
    form.reset(toFormValues(initialPersonality));
    setCurrentAvatarUrl(initialPersonality?.avatarUrl ?? null);
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
    // form is intentionally not a dep — RHF's form instance is stable.
  }, [open, initialPersonality]);

  const validateAvatarFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.glb')) return t('personalities.avatarUploadOnlyGlb');
    if (file.size > MAX_AVATAR_BYTES) return t('personalities.avatarUploadMaxSize');
    return null;
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedAvatarFile(null);
      return;
    }
    const error = validateAvatarFile(file);
    if (error) {
      toast.error(t('personalities.avatarUploadInvalid'), { description: error });
      e.target.value = '';
      setSelectedAvatarFile(null);
      return;
    }
    setSelectedAvatarFile(file);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) return;
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
      toast.error(t('personalities.avatarUploadFailed'), { description: message });
    }
  };

  const handleRemoveAvatar = async () => {
    setSelectedAvatarFile(null);
    setUploadedAvatarUrl(null);
    setUploadedAvatarFileName(null);
    setAvatarUploadProgress(0);
    if (!initialPersonality) return;

    try {
      await removeAvatar.mutateAsync(initialPersonality.id);
      setCurrentAvatarUrl(null);
      toast.success(t('personalities.avatarRemoveSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t('personalities.avatarRemoveFailed'), { description: message });
    }
  };

  const onSubmit = async (values: PersonalityFormValues) => {
    if (selectedAvatarFile && !uploadedAvatarUrl) {
      toast.error(t('personalities.avatarUploadRequired'));
      return;
    }

    const payload = {
      name: values.name,
      problemSummaryEn: values.problemSummaryEn,
      problemSummaryCs: values.problemSummaryCs,
      personalityDescriptionEn: values.personalityDescriptionEn,
      personalityDescriptionCs: values.personalityDescriptionCs,
      gender: values.gender || undefined,
      age: values.age ?? undefined,
      openaiVoiceName: values.openaiVoiceName,
      elevenlabsVoiceId: values.elevenlabsVoiceId || undefined,
      voiceInstructions: values.voiceInstructions || undefined,
      uploadedAvatarUrl: uploadedAvatarUrl ?? undefined,
    };

    try {
      if (initialPersonality) {
        await updatePersonality.mutateAsync({ id: initialPersonality.id, input: payload });
        toast.success(t('personalities.updateSuccess'));
      } else {
        await createPersonality.mutateAsync(payload);
        toast.success(t('personalities.createSuccess'));
      }
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(
        initialPersonality ? t('personalities.updateFailed') : t('personalities.createFailed'),
        { description: message },
      );
    }
  };

  const isProcessing =
    createPersonality.isPending ||
    updatePersonality.isPending ||
    removeAvatar.isPending;
  const isUploadingAvatar = uploadAvatar.isPending;

  const getAvatarFileName = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    return avatarUrl.split('/').at(-1) ?? avatarUrl;
  };
  const currentAvatarFileName = getAvatarFileName(currentAvatarUrl);
  const hasVisibleAvatar =
    selectedAvatarFile !== null || uploadedAvatarUrl !== null || Boolean(currentAvatarUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ?
              t('personalities.editPersonality') :
              t('personalities.addNewPersonality')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }} className="grid gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                {t('personalities.requiredFieldsNotice')}
              </p>
              <p className="text-xs text-blue-700">
                {t('personalities.requiredFieldsDescription')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      {t('personalities.name')} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalities.gender')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalities.age')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          field.onChange(e.target.value === '' ? null : Number(e.target.value));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 rounded-lg border border-border p-4">
              <div className="grid gap-2">
                <label htmlFor="avatarFile" className="text-sm font-medium">
                  {t('personalities.avatarUpload')}
                </label>
                <Input
                  id="avatarFile"
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
                    {isUploadingAvatar ?
                      t('personalities.avatarUploading') :
                      t('personalities.avatarUploadButton')}
                  </Button>
                  {uploadedAvatarUrl && (
                    <span className="text-sm text-muted-foreground">
                      {t('personalities.avatarReadyToSave')}
                    </span>
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
              control={form.control}
              name="problemSummaryEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    {t('personalities.problemSummaryEn')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problemSummaryCs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    {t('personalities.problemSummaryCs')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalityDescriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    {t('personalities.personalityDescriptionEn')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalityDescriptionCs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    {t('personalities.personalityDescriptionCs')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openaiVoiceName"
              render={({ field }) => (
                <FormItem>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="elevenlabsVoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('personalities.elevenlabsVoiceId')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voiceInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('personalities.voiceInstructions')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('common.cancel')}</Button>
              </DialogClose>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ?
                  (mode === 'edit' ? t('common.saving') : t('common.creating')) :
                  (mode === 'edit' ? t('common.saveChanges') : t('personalities.createPersonality'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
