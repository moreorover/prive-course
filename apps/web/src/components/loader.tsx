import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="pc-loader">
      <Loader2 className="pc-loader__icon" aria-hidden="true" />
    </div>
  );
}
