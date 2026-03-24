import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
} as const;

export function UserAvatar({ name, image, size = 'md', className }: UserAvatarProps) {
  const initials = name ? getInitials(name) : 'U';

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'User avatar'}
        className={cn(
          'rounded-full object-cover shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
