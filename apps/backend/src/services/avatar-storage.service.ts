import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve, sep } from 'node:path';
import { EnvConfigService } from '../core/config/env-config.service';

export interface UploadedAvatarFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const avatarRoutePrefix = '/api/personality-avatars/';
const maxAvatarFileSize = 50 * 1024 * 1024;

@Injectable()
export class AvatarStorageService {
  readonly uploadDirectory: string;

  constructor(private readonly configService: EnvConfigService) {
    this.uploadDirectory = resolve(configService.avatarUploadDir);
  }

  async saveAvatar(file: UploadedAvatarFile, ownerKey: number | 'pending'): Promise<string> {
    this.validateAvatarFile(file);
    await mkdir(this.uploadDirectory, { recursive: true });

    const filename = `${ownerKey}-${randomUUID()}.glb`;
    const destination = this.getAvatarPath(filename);
    await writeFile(destination, file.buffer);

    return `${avatarRoutePrefix}${filename}`;
  }

  requireManagedAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
    if (!avatarUrl) {
      return undefined;
    }

    if (!this.getManagedAvatarFilename(avatarUrl)) {
      throw new BadRequestException('Avatar must be uploaded through the avatar upload endpoint');
    }

    return avatarUrl;
  }

  async attachUploadedAvatar(avatarUrl: string | null | undefined, ownerId: number): Promise<string | undefined> {
    const filename = this.getManagedAvatarFilename(avatarUrl);
    if (!filename) {
      return this.requireManagedAvatarUrl(avatarUrl);
    }

    if (filename.startsWith(`${ownerId}-`)) {
      return avatarUrl ?? undefined;
    }

    if (!filename.startsWith('pending-')) {
      throw new BadRequestException('Avatar upload is already attached to another personality');
    }

    const filePath = await this.getAvatarFilePath(filename);
    const attachedFilename = `${ownerId}-${randomUUID()}.glb`;
    await rename(filePath, this.getAvatarPath(attachedFilename));

    return `${avatarRoutePrefix}${attachedFilename}`;
  }

  async removeManagedAvatar(avatarUrl: string | null | undefined): Promise<void> {
    const filename = this.getManagedAvatarFilename(avatarUrl);
    if (!filename) {
      return;
    }

    await rm(this.getAvatarPath(filename), { force: true });
  }

  async getAvatarFilePath(filename: string): Promise<string> {
    const safeFilename = basename(filename);
    if (safeFilename !== filename || extname(safeFilename).toLowerCase() !== '.glb') {
      throw new NotFoundException('Avatar not found');
    }

    const filePath = this.getAvatarPath(safeFilename);
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        throw new NotFoundException('Avatar not found');
      }
    } catch {
      throw new NotFoundException('Avatar not found');
    }

    return filePath;
  }

  private validateAvatarFile(file: UploadedAvatarFile | undefined): asserts file is UploadedAvatarFile {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    if (file.size > maxAvatarFileSize) {
      throw new BadRequestException('Avatar file must be 50 MB or smaller');
    }

    if (extname(file.originalname).toLowerCase() !== '.glb') {
      throw new BadRequestException('Only .glb avatar files are allowed');
    }

    if (file.buffer.subarray(0, 4).toString('utf8') !== 'glTF') {
      throw new BadRequestException('Avatar file must be a valid GLB file');
    }
  }

  private getAvatarPath(filename: string): string {
    const filePath = resolve(join(this.uploadDirectory, filename));
    if (!filePath.startsWith(`${this.uploadDirectory}${sep}`) && filePath !== this.uploadDirectory) {
      throw new BadRequestException('Invalid avatar path');
    }

    return filePath;
  }

  private getManagedAvatarFilename(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl?.startsWith(avatarRoutePrefix)) {
      return null;
    }

    return basename(avatarUrl.slice(avatarRoutePrefix.length));
  }
}
