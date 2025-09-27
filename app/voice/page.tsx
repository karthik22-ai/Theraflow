import { headers } from 'next/headers';
import { App } from '@/components/app';
import { getAppConfig } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function VoicePage() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return (
    <div className="relative">
      {/* Back to Dashboard Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>
      <App appConfig={appConfig} />
    </div>
  );
}
