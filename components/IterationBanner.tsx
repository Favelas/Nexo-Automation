import { loc, testId } from "@/lib/test-ids";

export function IterationBanner({ children }: { children: React.ReactNode }) {
  return (
    <p
      {...loc(testId.iterationBanner)}
      role="status"
      className="mb-6 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
    >
      {children}
    </p>
  );
}
