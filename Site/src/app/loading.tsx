import { Mark } from "@/components/Mark";

export default function Loading() {
  return (
    <div className="dln-loading" role="status" aria-label="Loading">
      <Mark size="nav" />
    </div>
  );
}
