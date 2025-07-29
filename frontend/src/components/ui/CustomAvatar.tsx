interface CustomAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function CustomAvatar({
  src,
  alt,
  fallback,
  className,
}: CustomAvatarProps) {
  return (
    <div
      className={`relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ${className}`}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full"
          alt={alt || "avatar"}
          src={src || "/placeholder.svg"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
          {fallback || "AD"}
        </div>
      )}
    </div>
  );
}
