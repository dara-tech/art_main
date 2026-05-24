import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import Patient360SubNav from '../components/patient360/Patient360SubNav';
import { Patient360LoadingPanel } from '../components/patient360/Patient360LoadingPanel';
import VcctFormView from '../components/vcct/VcctFormView';
import {
  VcctArtLinksTable,
  VcctSectionBlock,
  buildVcctSubNavSummary,
  sectionHasContent
} from '../components/vcct/VcctDetailSections';
import { useSites } from '../contexts/SitesContext';
import { useAuth } from '../contexts/AuthContext';
import { filterSitesByUserScope, isFacilitySite, resolveVcctSiteFromRegistry } from '../utils/siteSelection';
import vcctApi from '../services/vcctApi';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { APP_NAV_MUTED, P360_TABLE_PAD, P360_TABLE_TEXT, p360CardClass } from '../components/layout/appNavStyles';
import { P360_KH } from './patient360Kh';
import { VCCT_KH } from './vcctKh';

export default function VcctDetail({ siteCode, vcctId, vcctSiteCode, onBack }) {
  const { user } = useAuth();
  const { sites: registrySites } = useSites();
  const sites = useMemo(
    () => filterSitesByUserScope(registrySites || [], user),
    [registrySites, user]
  );
  const siteOptions = useMemo(() => {
    const facilitySites = sites.filter(isFacilitySite);
    return facilitySites.length ? facilitySites : sites;
  }, [sites]);
  const registryVcctSite = useMemo(
    () => resolveVcctSiteFromRegistry(siteOptions, siteCode),
    [siteOptions, siteCode]
  );
  const effectiveVcctSiteCode = vcctSiteCode || registryVcctSite.code || null;
  const skipVcctLoad = !effectiveVcctSiteCode && registryVcctSite.known;

  const [loading, setLoading] = useState(() => !skipVcctLoad);
  const [snapshot, setSnapshot] = useState(() =>
    skipVcctLoad
      ? {
          linked: false,
          message: VCCT_KH.list.noVcctSite,
          displaySections: [],
          artLinks: []
        }
      : null
  );

  const loadDetail = useCallback(async () => {
    if (!siteCode || !vcctId) return;
    if (skipVcctLoad) {
      setSnapshot({
        linked: false,
        message: VCCT_KH.list.noVcctSite,
        displaySections: [],
        artLinks: []
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await vcctApi.getDetail(siteCode, {
        vcctId,
        vcctSiteCode: effectiveVcctSiteCode
      });
      setSnapshot(res);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || VCCT_KH.toast.loadFailed);
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [siteCode, vcctId, effectiveVcctSiteCode, skipVcctLoad]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const recordSections = useMemo(
    () => (snapshot?.displaySections || []).filter((s) => s.id !== 'registration'),
    [snapshot]
  );
  const subNavSummary = useMemo(() => buildVcctSubNavSummary(snapshot), [snapshot]);

  const toolbar = (
    <Patient360SubNav
      clinicId={vcctId}
      onBack={onBack}
      summary={subNavSummary}
      profileLoading={loading}
    />
  );

  const showMessage =
    snapshot?.message &&
    !snapshot?.formPages?.length &&
    !recordSections.some(sectionHasContent);

  const hasForm = (snapshot?.formPages?.length ?? 0) > 0;
  const hasLegacySections = recordSections.some(sectionHasContent);

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
            <CardContent className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-0 border-0 border-t-0 p-0 pt-0">
              {loading ? (
                <Patient360LoadingPanel
                  label={VCCT_KH.detail.loading}
                  className="m-0 flex-1 border-0"
                  minHeight="min-h-[16rem]"
                />
              ) : !snapshot ? (
                <p
                  className={cn(
                    'flex min-h-[12rem] flex-1 items-center justify-center',
                    P360_TABLE_PAD,
                    P360_TABLE_TEXT,
                    'text-muted-foreground'
                  )}
                >
                  {VCCT_KH.toast.loadFailed}
                </p>
              ) : (
                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-0 py-0">
                    {showMessage ? (
                      <div className={cn(p360CardClass, 'mx-0 overflow-hidden shadow-sm')}>
                        <p
                          className={cn(
                            P360_TABLE_PAD,
                            P360_TABLE_TEXT,
                            'text-amber-800 dark:text-amber-400'
                          )}
                        >
                          {snapshot.message}
                        </p>
                      </div>
                    ) : null}

                    {hasForm || hasLegacySections ? (
                      <div className="space-y-4">
                        <VcctArtLinksTable artLinks={snapshot.artLinks} artSiteCode={siteCode} />
                        {hasForm ? (
                          <VcctFormView pages={snapshot.formPages} />
                        ) : (
                          recordSections.map((section) => (
                            <VcctSectionBlock key={section.id} section={section} />
                          ))
                        )}
                      </div>
                    ) : (
                      <p
                        className={cn(
                          'flex min-h-[12rem] items-center justify-center',
                          P360_TABLE_PAD,
                          P360_TABLE_TEXT,
                          'text-muted-foreground'
                        )}
                      >
                        {P360_KH.vcct.noDetail}
                      </p>
                    )}

                    <p className={cn(P360_TABLE_PAD, APP_NAV_MUTED, P360_TABLE_TEXT)}>
                      {VCCT_KH.readOnlyBadge}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>
    </>
  );
}
