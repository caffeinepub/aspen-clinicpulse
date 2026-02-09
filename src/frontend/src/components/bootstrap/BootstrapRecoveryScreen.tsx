import { AlertTriangle, RefreshCw, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { getErrorTechnicalDetails } from '@/utils/actorError';

interface BootstrapRecoveryScreenProps {
  error?: Error | null;
  onRetry: () => void;
  onResetSession: () => void;
  onReload: () => void;
}

/**
 * Bootstrap recovery UI component that displays concise error messages with
 * expandable technical details and provides user actions (Retry, Reset Session, Reload).
 */
export function BootstrapRecoveryScreen({ error, onRetry, onResetSession, onReload }: BootstrapRecoveryScreenProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // Extract user-friendly message and technical details
  const userMessage = error?.message || 'An unexpected error occurred';
  const technicalDetails = error ? getErrorTechnicalDetails(error) : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Unable to Load Application</CardTitle>
          <CardDescription>
            We're having trouble connecting to the application. This might be due to a network issue or session problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              {userMessage}
            </AlertDescription>
          </Alert>

          {technicalDetails && (
            <Collapsible open={showTechnicalDetails} onOpenChange={setShowTechnicalDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-xs text-muted-foreground">Technical Details</span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md bg-muted p-3">
                  <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                    {technicalDetails}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Try one of the following actions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Retry:</strong> Attempt to reconnect</li>
              <li><strong>Reset Session:</strong> Clear cached data and reload</li>
              <li><strong>Reload:</strong> Refresh the entire page</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={onRetry} className="w-full" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          <div className="flex w-full gap-2">
            <Button onClick={onResetSession} className="flex-1" variant="outline">
              <RotateCw className="mr-2 h-4 w-4" />
              Reset Session
            </Button>
            <Button onClick={onReload} className="flex-1" variant="outline">
              <RotateCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
