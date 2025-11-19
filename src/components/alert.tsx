import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Optimized for Larger Screens.</AlertTitle>
        <AlertDescription>
          <p>We’re sorry, but this website is best experienced on a laptop or a larger screen.
          Some features may not display properly on smaller devices.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Try on bigger screen</li>
            <li>Retry once again</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
