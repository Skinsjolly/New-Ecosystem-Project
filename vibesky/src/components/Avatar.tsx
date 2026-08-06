export default function Avatar({ src, name, size = 40 }: { src?: string; name?: string; size?: number }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        width={size}
        height={size}
        loading="lazy"
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full brand-gradient flex items-center justify-center font-bold text-white shrink-0 select-none"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}
