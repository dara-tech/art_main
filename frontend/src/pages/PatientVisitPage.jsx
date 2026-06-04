import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass } from '../components/layout/appNavStyles';
import AppPageShell from '../components/layout/AppPageShell';
import AdultVisitForm from '../components/clinicalForms/AdultVisitForm';
import { useAuth } from '../contexts/AuthContext';

export default function PatientVisitPage() {
  const { user } = useAuth();
  const { program, clinicId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const vid = searchParams.get('vid') || 'new';
  const siteCode = user?.site_code || '0101'; // Fallback for dev testing
  
  const titlePrefix = program === 'adult' ? 'មនុស្សពេញវ័យ' : program === 'child' ? 'កុមារ' : 'ទារក';
  
  return (
    <AppPageShell wide title={`ការពិនិត្យតាមដាន ${titlePrefix} (Follow-up Visit ${program})`} className="flex h-[calc(100vh-2.5rem)] min-w-0 w-full max-w-full flex-col !p-0 overflow-hidden">
      <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card border-0 rounded-none shadow-none')}>
        <CardContent className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-0 border-0 border-t-0 p-0 overflow-y-auto">
          {program === 'adult' ? (
            <AdultVisitForm 
              siteCode={siteCode} 
              vid={vid} 
              clinicId={clinicId}
              initialData={{ ClinicID: clinicId }} 
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              ទម្រង់នេះកំពុងអភិវឌ្ឍន៍ (Form under development)
            </div>
          )}
        </CardContent>
      </Card>
    </AppPageShell>
  );
}
