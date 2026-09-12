export const ProductSkeleton = () => {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 animate-pulse">
      <div className="aspect-[3/4] w-full rounded-xl bg-neutral-800 mb-4" />
      <div className="h-4 w-3/4 bg-neutral-800 rounded mb-2" />
      <div className="h-4 w-1/2 bg-neutral-800 rounded mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/3 bg-neutral-800 rounded" />
        <div className="h-8 w-24 bg-neutral-800 rounded-full" />
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="h-10 w-28 rounded-full bg-neutral-800 animate-pulse shrink-0" />
  );
};
