export function createInitials(username: string | undefined | null) {
  return username?.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase() ?? '👤';
}
